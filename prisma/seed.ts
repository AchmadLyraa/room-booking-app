import { PrismaClient, Role } from "./generated/client";
import bcrypt from "bcryptjs";
import { adapter } from "@/prisma/adapter-pg.ts";
import { getUsersData } from "./data/users";

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

  // CREATE USERS
  const usersData = await getUsersData();
  const createdUsers = await prisma.user.createManyAndReturn({
    data: usersData,
  });
  console.log(`✅ Created ${createdUsers.length} users`);

  // Create rooms
  const room1 = await prisma.room.create({
    data: {
      name: "Ruang Meeting Smart Office",
      description: "Ruang meeting dengan kapasitas besar",
      capacity: 35,
    },
  });

  const room2 = await prisma.room.create({
    data: {
      name: "Ruang Meeting Refactory",
      description: "Ruang meeting medium size",
      capacity: 35,
    },
  });

  const room3 = await prisma.room.create({
    data: {
      name: "Hall Meeting Refactory",
      description: "Ruang meeting medium size",
      capacity: 100,
    },
  });

  const room4 = await prisma.room.create({
    data: {
      name: "Ruang Meeting CCR",
      description: "Ruang meeting medium size",
      capacity: 20,
    },
  });

  const room5 = await prisma.room.create({
    data: {
      name: "Ruang Meeting Perpustakaan",
      description: "Ruang meeting medium size",
      capacity: 10,
    },
  });

  // Create food items
  const foodNames = [
    "Makan Pagi",
    "Makan Siang",
    "Makan Sore",
    "Makan Malam",
    "Snack Malam (Khusus On Call Malam)",
    "Snack Piring",
    "Kotak Snack",
    "Air Mineral Botol Kecil",
    "Kopi kapal api",
    "Teh",
    "Gula",
    "Minuman manis",
    "Kopi (Khusus On Call Malam)",
  ];

  await prisma.food.createMany({
    data: foodNames.map((name) => ({ name })),
  });

  // Create system config
  await prisma.systemConfig.create({
    data: { autoApprove: false },
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
