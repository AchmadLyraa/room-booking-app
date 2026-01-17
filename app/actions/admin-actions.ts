"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-utils";
import { Role, BookingStatus } from "@/prisma/generated/client";

// ROOM MANAGEMENT
export async function createRoom(
  name: string,
  description: string,
  capacity: number,
) {
  await requireRole([Role.ADMIN]);

  return prisma.room.create({
    data: { name, description, capacity },
  });
}

export async function updateRoom(
  id: string,
  name: string,
  description: string,
  capacity: number,
) {
  await requireRole([Role.ADMIN]);

  return prisma.room.update({
    where: { id },
    data: { name, description, capacity },
  });
}

export async function deleteRoom(id: string) {
  await requireRole([Role.ADMIN]);

  return prisma.room.delete({
    where: { id },
  });
}

export async function getAllRooms() {
  await requireRole([Role.ADMIN]);
  return prisma.room.findMany({
    orderBy: { createdAt: "desc" },
  });
}

// BOOKING APPROVAL
export async function approveBooking(bookingId: string) {
  await requireRole([Role.ADMIN]);

  // Get booking yang mau di-approve
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { user: true, room: true },
  });

  if (!booking) {
    throw new Error("Booking not found");
  }

  // Tentukan sessions yang conflict
  let conflictSessions: BookingSession[] = [];

  if (booking.session === "FULLDAY") {
    // FULLDAY conflict dengan SESSION_1 dan SESSION_2
    conflictSessions = ["SESSION_1", "SESSION_2"];
  } else if (
    booking.session === "SESSION_1" ||
    booking.session === "SESSION_2"
  ) {
    // SESSION_1 atau SESSION_2 conflict dengan FULLDAY
    conflictSessions = ["FULLDAY"];
  }

  // Cari booking conflict yang PENDING atau APPROVED
  const conflictBookings = await prisma.booking.findMany({
    where: {
      roomId: booking.roomId,
      bookingDate: booking.bookingDate,
      session: { in: conflictSessions },
      status: { in: [BookingStatus.PENDING, BookingStatus.APPROVED] },
      id: { not: bookingId }, // Jangan hitung booking yang sedang di-approve
    },
  });

  // Approve booking yang di-request
  const approvedBooking = await prisma.booking.update({
    where: { id: bookingId },
    data: { status: BookingStatus.APPROVED },
    include: { user: true, room: true },
  });

  // Auto-reject semua booking yang conflict
  if (conflictBookings.length > 0) {
    await prisma.booking.updateMany({
      where: {
        id: { in: conflictBookings.map((b) => b.id) },
      },
      data: {
        status: BookingStatus.REJECTED,
        rejectionReason: "Maaf, sudah ada yang request duluan",
      },
    });
  }

  return approvedBooking;
}

export async function rejectBooking(bookingId: string, reason: string) {
  await requireRole([Role.ADMIN]);

  return prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: BookingStatus.REJECTED,
      rejectionReason: reason,
    },
    include: { user: true, room: true },
  });
}

export async function getAllBookings(
  page: number,
  pageSize: number,
  status?: BookingStatus,
) {
  await requireRole([Role.ADMIN]);

  const skip = (page - 1) * pageSize;
  const take = pageSize;

  return prisma.booking.findMany({
    where: status ? { status } : {},
    include: {
      user: true,
      room: true,
      // bookingFoods: { include: { food: true } },
      // bookingSnacks: { include: { snack: true } },
    },
    orderBy: { createdAt: "desc" },
    skip,
    take,
  });
}

// FOOD & SNACK MANAGEMENT
export async function createFood(name: string) {
  await requireRole([Role.ADMIN]);
  return prisma.food.create({ data: { name } });
}

export async function deleteFood(id: string) {
  await requireRole([Role.ADMIN]);
  return prisma.food.delete({ where: { id } });
}

export async function getAllFoods() {
  await requireRole([Role.ADMIN]);
  return prisma.food.findMany({ orderBy: { createdAt: "desc" } });
}

export async function createSnack(name: string) {
  await requireRole([Role.ADMIN]);
  return prisma.snack.create({ data: { name } });
}

export async function deleteSnack(id: string) {
  await requireRole([Role.ADMIN]);
  return prisma.snack.delete({ where: { id } });
}

export async function getAllSnacks() {
  await requireRole([Role.ADMIN]);
  return prisma.snack.findMany({ orderBy: { createdAt: "desc" } });
}

// SYSTEM CONFIG
export async function updateAutoApprove(autoApprove: boolean) {
  await requireRole([Role.ADMIN]);

  return prisma.systemConfig.update({
    where: { id: 1 },
    data: { autoApprove },
  });
}

export async function getSystemConfig() {
  await requireRole([Role.ADMIN]);
  return prisma.systemConfig.findUnique({ where: { id: 1 } });
}
