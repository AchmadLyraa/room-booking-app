"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-utils";
import {
  Role,
  BookingSession,
  type MeetingType,
} from "@/prisma/generated/client";
import { successResult, errorResult } from "@/lib/types";

// FILTER A VALID BOOKING
export async function getAvailableRooms(bookingDate: string) {
  await requireRole([Role.PIC]);

  const date = new Date(bookingDate);
  date.setHours(0, 0, 0, 0);

  // Get current time
  const now = new Date();

  const todayUTC = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      0,
      0,
      0,
      0,
    ),
  );

  const isToday = date.getTime() === todayUTC.getTime();
  const currentHour = now.getUTCHours();

  // Get all rooms with their bookings for the selected date
  const rooms = await prisma.room.findMany({
    include: {
      bookings: {
        where: {
          bookingDate: {
            gte: date,
            lt: new Date(date.getTime() + 24 * 60 * 60 * 1000),
          },
          status: "APPROVED",
        },
        select: {
          session: true,
        },
      },
    },
  });

  return rooms.map((room) => {
    const bookedSessions = room.bookings.map((b) => b.session);

    // Filter sessions yang available
    let availableSessions = Object.values(BookingSession).filter(
      (session) => !bookedSessions.some((b) => b === session),
    );

    // ✅ Jika hari ini, hapus session yang sudah passed
    if (isToday) {
      availableSessions = availableSessions.filter((session) => {
        if (session === "SESSION_1" && currentHour >= 8) return false;
        if (session === "SESSION_2" && currentHour >= 13) return false;
        if (session === "FULLDAY" && currentHour >= 8) return false;
        return true;
      });
    }

    return {
      ...room,
      availableSessions,
    };
  });
}

// CREATE BOOKING
export async function createBooking(data: {
  letterNumber: string;
  roomId: string;
  bookingDate: string;
  session: BookingSession;
  agenda: string;
  description: string;
  meetingType: MeetingType;
  note?: string;
  documentUrl?: string;
  foodIds: string[];
  snackIds: string[];
}) {
  const user = await requireRole([Role.PIC]);

  const [year, month, day] = data.bookingDate.split("-").map(Number);
  const bookingDateUTC = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));

  // VALIDASI: Cegah booking di tanggal lampau
  const now = new Date();

  // TODAY UTC (00:00 UTC)
  const todayUTC = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      0,
      0,
      0,
      0,
    ),
  );

  // BANDIN UTC KE UTC
  const isToday = bookingDateUTC.getTime() === todayUTC.getTime();

  // JAM UTC
  const currentHour = now.getUTCHours();

  if (bookingDateUTC < todayUTC) {
    return {
      success: false,
      error: "Cannot book for past dates.",
    };
  }

  const witaNow = getWIBTime(now);
  const currentHourWITA = witaNow.hours;

  if (isToday) {
    if (data.session === "SESSION_1" && currentHourWITA >= 12) {
      // ← Cek jam 12 WITA (akhir sesi)
      return errorResult(
        "SESSION_1 (08:00–12:00) has already started or passed.",
      );
    }
    if (data.session === "SESSION_2" && currentHourWITA >= 16) {
      // ← Cek jam 16 WITA (akhir sesi)
      return errorResult(
        "SESSION_2 (13:00–16:00) has already started or passed.",
      );
    }
    if (data.session === "FULLDAY" && currentHourWITA >= 8) {
      // ← Cek jam 8 WITA (awal sesi)
      return errorResult(
        "FULLDAY (08:00–16:00) has already started or passed.",
      );
    }
  }

  // Get food and snack names for denormalization
  const selectedFoods = await prisma.food.findMany({
    where: { id: { in: data.foodIds } },
  });
  const selectedSnacks = await prisma.snack.findMany({
    where: { id: { in: data.snackIds } },
  });

  const foodNames = JSON.stringify(selectedFoods.map((f) => f.name));
  const snackNames = JSON.stringify(selectedSnacks.map((s) => s.name));

  const existingBooking = await prisma.booking.findFirst({
    where: {
      userId: user.id as string,
      roomId: data.roomId,
      bookingDate: bookingDateUTC,
      session: data.session,
      status: { in: ["PENDING", "APPROVED"] },
    },
  });

  if (existingBooking) {
    return {
      success: false,
      error: "You already have a booking for this room, date, and session.",
    };
  }

  const conflictingBooking = await prisma.booking.findFirst({
    where: {
      roomId: data.roomId,
      bookingDate: bookingDateUTC,
      session: data.session,
      status: "APPROVED",
    },
  });

  if (conflictingBooking) {
    return {
      success: false,
      error:
        "This room is no longer available for the selected session. Please refresh and try another time.",
    };
  }

  if (data.session === "FULLDAY") {
    const partialConflict = await prisma.booking.findFirst({
      where: {
        roomId: data.roomId,
        bookingDate: bookingDateUTC,
        session: { in: ["SESSION_1", "SESSION_2"] },
        status: "APPROVED",
      },
    });

    if (partialConflict) {
      return {
        success: false,
        error:
          "This room is partially booked during fullday hours. Please select a different date or session.",
      };
    }
  }

  if (data.session === "SESSION_1" || data.session === "SESSION_2") {
    const fullDayConflict = await prisma.booking.findFirst({
      where: {
        roomId: data.roomId,
        bookingDate: bookingDateUTC,
        session: "FULLDAY",
        status: "APPROVED",
      },
    });

    if (fullDayConflict) {
      return {
        success: false,
        error:
          "This room is fully booked during this time. Please select a different date or session.",
      };
    }
  }

  const booking = await prisma.booking.create({
    data: {
      letterNumber: data.letterNumber,
      roomId: data.roomId,
      userId: user.id as string,
      bookingDate: bookingDateUTC,
      session: data.session,
      agenda: data.agenda,
      description: data.description,
      meetingType: data.meetingType,
      note: data.note,
      documentUrl: data.documentUrl,
      foodNames,
      snackNames,
      bookingFoods: {
        create: data.foodIds.map((foodId) => ({ foodId })),
      },
      bookingSnacks: {
        create: data.snackIds.map((snackId) => ({ snackId })),
      },
    },
    include: {
      room: true,
      bookingFoods: { include: { food: true } },
      bookingSnacks: { include: { snack: true } },
    },
  });

  // Check if auto-approve is enabled
  const config = await prisma.systemConfig.findUnique({ where: { id: 1 } });

  if (config?.autoApprove) {
    const approvedBooking = await prisma.booking.update({
      where: { id: booking.id },
      data: { status: "APPROVED" },
      include: {
        room: true,
        bookingFoods: { include: { food: true } },
        bookingSnacks: { include: { snack: true } },
      },
    });
    return {
      success: true,
      data: approvedBooking,
    };
  }

  return {
    success: true,
    data: booking,
  };
}

// GET USER'S BOOKINGS
export async function getUserBookings() {
  const user = await requireRole([Role.PIC]);

  return prisma.booking.findMany({
    where: { userId: user.id as string },
    include: {
      room: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

// GET ALL FOODS & SNACKS FOR DROPDOWN
export async function getFoodsAndSnacks() {
  const foods = await prisma.food.findMany();
  const snacks = await prisma.snack.findMany();
  return { foods, snacks };
}

// GET ROOM AVAILABILITY FOR A SPECIFIC DATE
// Fungsi untuk convert UTC ke WIB (GMT+7)
function getWIBTime(date: Date) {
  const witaTime = new Date(date.getTime() + 8 * 60 * 60 * 1000);
  return {
    hours: witaTime.getUTCHours(),
    date: witaTime,
  };
}

function getSessionStatus(
  isBooked: boolean,
  isToday: boolean,
  currentHourWITA: number,
  sessionTime: { start: number; end: number },
) {
  if (isBooked) {
    return "TERPAKAI";
  }

  // Cek apakah sesi sudah SELESAI (lewat jam end)
  if (isToday && currentHourWITA >= sessionTime.end) {
    return "DISABLED";
  }

  return "TERSEDIA";
}

export async function getRoomAvailability(bookingDateString: string) {
  await requireRole([Role.PIC]);

  const [year, month, day] = bookingDateString.split("-").map(Number);
  const dateUTC = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
  const nextDayUTC = new Date(dateUTC.getTime() + 24 * 60 * 60 * 1000);

  const now = new Date();
  const witaNow = getWIBTime(now);

  const todayWITA = new Date(now.getTime() + 8 * 60 * 60 * 1000);
  const todayWITAString = todayWITA.toISOString().slice(0, 10);
  const isToday = bookingDateString === todayWITAString;
  const currentHourWITA = witaNow.hours;

  const rooms = await prisma.room.findMany({
    include: {
      bookings: {
        where: {
          bookingDate: {
            gte: dateUTC,
            lt: nextDayUTC,
          },
          status: "APPROVED",
        },
        select: { session: true },
      },
    },
    orderBy: { name: "asc" },
  });

  const sessionTimes = {
    SESSION_1: { start: 8, end: 12 },
    SESSION_2: { start: 13, end: 16 },
    FULLDAY: { start: 8, end: 16 },
  };

  return rooms.map((room) => {
    const booked = room.bookings.map((b) => b.session);
    const hasS1 = booked.includes("SESSION_1");
    const hasS2 = booked.includes("SESSION_2");
    const hasFD = booked.includes("FULLDAY");

    return {
      id: room.id, // ← TAMBAH INI ANJING!
      name: room.name, // ← TAMBAH INI!
      capacity: room.capacity, // ← TAMBAH INI!
      sessionAvailability: {
        SESSION_1: hasFD
          ? "TERPAKAI"
          : getSessionStatus(
              hasS1,
              isToday,
              currentHourWITA,
              sessionTimes.SESSION_1,
            ),

        SESSION_2: hasFD
          ? "TERPAKAI"
          : getSessionStatus(
              hasS2,
              isToday,
              currentHourWITA,
              sessionTimes.SESSION_2,
            ),

        FULLDAY:
          hasS1 || hasS2
            ? "DISABLED" // Ada booking di S1/S2
            : hasFD
              ? "TERPAKAI" // FULLDAY ada booking
              : isToday && currentHourWITA >= sessionTimes.SESSION_1.end // ← Cek jam >= 12 (akhir SESI 1)
                ? "DISABLED" // SESI 1 udah lewat, FULLDAY gak mungkin!
                : "TERSEDIA",
      },
    };
  });
}
