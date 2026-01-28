"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-utils";
import {
  Role,
  BookingStatus,
  BookingSession,
  Prisma,
} from "@/prisma/generated/client";
import { successResult, errorResult } from "@/lib/types";

// ROOM MANAGEMENT
export async function createRoom(
  name: string,
  description: string,
  capacity: number,
) {
  try {
    const room = await prisma.room.create({
      data: { name, description, capacity },
    });

    return { success: true, data: room };
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2002") {
        return {
          success: false,
          error: "ROOM_NAME_EXISTS",
        };
      }
    }

    return {
      success: false,
      error: "UNKNOWN_ERROR",
    };
  }
}
export async function updateRoom(
  id: string,
  name: string,
  description: string,
  capacity: number,
) {
  await requireRole([Role.ADMIN]);

  const room = await prisma.room.update({
    where: { id },
    data: { name, description, capacity },
  });

  return successResult(room);
}

export async function deleteRoom(id: string) {
  await requireRole([Role.ADMIN]);

  return prisma.$transaction(async (tx) => {
    const activeBooking = await tx.booking.findFirst({
      where: {
        roomId: id,
        status: { in: [BookingStatus.PENDING, BookingStatus.APPROVED] },
      },
    });

    if (activeBooking) {
      return errorResult("Room still has active bookings");
    }

    await tx.room.delete({ where: { id } });

    return successResult(null);
  });
}

export async function getAllRooms() {
  await requireRole([Role.ADMIN]);

  const rooms = await prisma.room.findMany({
    orderBy: { createdAt: "desc" },
  });

  return {
    success: true,
    data: rooms,
  };
}

// BOOKING APPROVAL

export async function approveBooking(bookingId: string) {
  await requireRole([Role.ADMIN]);

  return prisma.$transaction(async (tx) => {
    // Ambil booking + lock logical
    const booking = await tx.booking.findUnique({
      where: { id: bookingId },
      include: { user: true, room: true },
    });

    if (!booking) {
      return errorResult("Booking not found");
    }

    if (booking.status !== BookingStatus.PENDING) {
      return errorResult("Booking already processed");
    }

    const sameSessionApproved = await tx.booking.findFirst({
      where: {
        roomId: booking.roomId,
        bookingDate: booking.bookingDate,
        session: booking.session,
        status: BookingStatus.APPROVED,
        id: { not: bookingId },
      },
    });

    if (sameSessionApproved) {
      return errorResult("Room already approved for this session");
    }

    // Tentukan conflict session
    let conflictSessions: BookingSession[] = [];

    if (booking.session === BookingSession.FULLDAY) {
      conflictSessions = [BookingSession.SESSION_1, BookingSession.SESSION_2];
    } else {
      conflictSessions = [BookingSession.FULLDAY];
    }

    // Cari booking conflict (PENDING / APPROVED)
    const conflictBookings = await tx.booking.findMany({
      where: {
        roomId: booking.roomId,
        bookingDate: booking.bookingDate,
        session: { in: conflictSessions },
        status: { in: [BookingStatus.PENDING, BookingStatus.APPROVED] },
        id: { not: bookingId },
      },
    });

    // Approve booking utama
    const approvedBooking = await tx.booking.update({
      where: { id: bookingId },
      data: {
        status: BookingStatus.APPROVED,
      },
      include: { user: true, room: true },
    });

    // Auto reject semua conflict
    if (conflictBookings.length > 0) {
      await tx.booking.updateMany({
        where: {
          id: { in: conflictBookings.map((b) => b.id) },
        },
        data: {
          status: BookingStatus.REJECTED,
          rejectionReason: "Maaf, sudah ada booking lebih dulu",
        },
      });
    }

    return successResult(approvedBooking);
  });
}

/* =========================
   REJECT BOOKING
========================= */

export async function rejectBooking(bookingId: string, reason: string) {
  await requireRole([Role.ADMIN]);

  if (!reason.trim()) {
    return errorResult("Rejection reason is required");
  }

  return prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({
      where: { id: bookingId },
      include: { user: true, room: true },
    });

    if (!booking) {
      return errorResult("Booking not found");
    }

    if (booking.status !== BookingStatus.PENDING) {
      return errorResult("Only pending booking can be rejected");
    }

    const rejected = await tx.booking.update({
      where: { id: bookingId },
      data: {
        status: BookingStatus.REJECTED,
        rejectionReason: reason,
      },
      include: { user: true, room: true },
    });

    return successResult(rejected);
  });
}

export async function getAllBookings(
  page: number,
  pageSize: number,
  status?: BookingStatus,
) {
  await requireRole([Role.ADMIN]);

  const skip = (page - 1) * pageSize;

  const bookings = await prisma.booking.findMany({
    where: status ? { status } : {},
    include: {
      user: true,
      room: true,
    },
    orderBy: { createdAt: "desc" },
    skip,
    take: pageSize,
  });

  return successResult(
    bookings.map((b) => ({
      ...b,
      bookingDateFormatted: b.bookingDate.toISOString().slice(0, 10),
    })),
  );
}

// FOOD & SNACK MANAGEMENT
export async function createFood(name: string) {
  await requireRole([Role.ADMIN]);

  if (!name.trim()) {
    return errorResult("Food name is required");
  }

  const food = await prisma.food.create({
    data: { name },
  });

  return successResult(food);
}

export async function deleteFood(id: string) {
  await requireRole([Role.ADMIN]);

  const existing = await prisma.food.findUnique({ where: { id } });
  if (!existing) {
    return errorResult("Food not found");
  }

  await prisma.food.delete({ where: { id } });

  return successResult(null);
}

export async function getAllFoods() {
  await requireRole([Role.ADMIN]);

  const foods = await prisma.food.findMany({
    orderBy: { createdAt: "desc" },
  });

  return successResult(foods);
}

/* =========================
   SNACK MANAGEMENT
========================= */

export async function createSnack(name: string) {
  await requireRole([Role.ADMIN]);

  if (!name.trim()) {
    return errorResult("Snack name is required");
  }

  const snack = await prisma.snack.create({
    data: { name },
  });

  return successResult(snack);
}

export async function deleteSnack(id: string) {
  await requireRole([Role.ADMIN]);

  const existing = await prisma.snack.findUnique({ where: { id } });
  if (!existing) {
    return errorResult("Snack not found");
  }

  await prisma.snack.delete({ where: { id } });

  return successResult(null);
}

export async function getAllSnacks() {
  await requireRole([Role.ADMIN]);

  const snacks = await prisma.snack.findMany({
    orderBy: { createdAt: "desc" },
  });

  return successResult(snacks);
}

/* =========================
   SYSTEM CONFIG
========================= */

export async function updateAutoApprove(autoApprove: boolean) {
  await requireRole([Role.ADMIN]);

  const config = await prisma.systemConfig.findUnique({
    where: { id: 1 },
  });

  if (!config) {
    return errorResult("System config not found");
  }

  const updated = await prisma.systemConfig.update({
    where: { id: 1 },
    data: { autoApprove },
  });

  return successResult(updated);
}

export async function getSystemConfig() {
  await requireRole([Role.ADMIN]);

  const config = await prisma.systemConfig.findUnique({
    where: { id: 1 },
  });

  if (!config) {
    return errorResult("System config not found");
  }

  return successResult(config);
}
