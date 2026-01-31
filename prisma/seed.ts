import { PrismaClient, Role } from "./generated/client";
import bcrypt from "bcryptjs";
import { adapter } from "@/prisma/adapter-pg.ts";

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🧹 Starting cleanup...");

  try {
    // Hapus dari child tables dulu (yang punya foreign keys)
    await prisma.bookingSnack.deleteMany();
    console.log("✅ BookingSnack cleared");

    await prisma.bookingFood.deleteMany();
    console.log("✅ BookingFood cleared");

    await prisma.booking.deleteMany();
    console.log("✅ Booking cleared");

    // Baru hapus parent tables
    await prisma.snack.deleteMany();
    console.log("✅ Snack cleared");

    await prisma.food.deleteMany();
    console.log("✅ Food cleared");

    await prisma.room.deleteMany();
    console.log("✅ Room cleared");

    await prisma.user.deleteMany();
    console.log("✅ User cleared");

    await prisma.systemConfig.deleteMany();
    console.log("✅ SystemConfig cleared");

    console.log("🎉 All data cleared!\n");
  } catch (error) {
    console.error("❌ Error during cleanup:", error);
    throw error;
  }

  // Create admin user
  const admin = await prisma.user.create({
    data: {
      name: "Admin",
      email: "admin@booking.com",
      password: await bcrypt.hash("admin123", 10),
      role: Role.ADMIN,
    },
  });

  // Create PIC users
  const pic1 = await prisma.user.create({
    data: {
      name: "PIC 1",
      email: "pic1@booking.com",
      password: await bcrypt.hash("pic123", 10),
      role: Role.PIC,
    },
  });

  const pic2 = await prisma.user.create({
    data: {
      name: "PIC 2",
      email: "pic2@booking.com",
      password: await bcrypt.hash("pic123", 10),
      role: Role.PIC,
    },
  });

  // Create rooms
  const room1 = await prisma.room.create({
    data: {
      name: "Ruang Meeting Smart Office",
      description: "Ruang meeting dengan kapasitas besar",
      capacity: 50,
    },
  });

  const room2 = await prisma.room.create({
    data: {
      name: "Ruang Meeting Refactory",
      description: "Ruang meeting medium size",
      capacity: 30,
    },
  });

  const room3 = await prisma.room.create({
    data: {
      name: "Hall Meeting Refactory",
      description: "Ruang meeting medium size",
      capacity: 30,
    },
  });

  const room4 = await prisma.room.create({
    data: {
      name: "Ruang Meeting CCR",
      description: "Ruang meeting medium size",
      capacity: 30,
    },
  });

  const room5 = await prisma.room.create({
    data: {
      name: "Ruang Meeting Perpustakaan",
      description: "Ruang meeting medium size",
      capacity: 30,
    },
  });

  // Create food items
  const food1 = await prisma.food.create({
    data: { name: "Nasi Kuning" },
  });

  const food2 = await prisma.food.create({
    data: { name: "Mie Goreng" },
  });

  // Create snacks
  const snack1 = await prisma.snack.create({
    data: { name: "Kopi" },
  });

  const snack2 = await prisma.snack.create({
    data: { name: "Teh Manis" },
  });

  // Create system config
  await prisma.systemConfig.create({
    data: { autoApprove: false },
  });

  console.log("✅ Seed completed:", {
    admin: admin.email,
    pic1: pic1.email,
    pic2: pic2.email,
    rooms: [room1.name, room2.name],
    foods: [food1.name, food2.name],
    snacks: [snack1.name, snack2.name],
  });
}

main()
  .catch((e) => {
    console.error("❌ Fatal error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
