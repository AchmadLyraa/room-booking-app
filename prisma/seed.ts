import { PrismaClient, Role } from "./generated/client";
import bcrypt from "bcryptjs";
import { adapter } from "@/prisma/adapter-pg.ts";

const prisma = new PrismaClient({ adapter });

async function main() {
  // Clear existing data
  await prisma.bookingSnack.deleteMany();
  await prisma.bookingFood.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.snack.deleteMany();
  await prisma.food.deleteMany();
  await prisma.room.deleteMany();
  await prisma.user.deleteMany();
  await prisma.systemConfig.deleteMany();

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
      name: "Ruang Meeting A",
      description: "Ruang meeting dengan kapasitas besar",
      capacity: 50,
    },
  });

  const room2 = await prisma.room.create({
    data: {
      name: "Ruang Meeting B",
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

  console.log("Seed completed:", {
    admin: admin.email,
    pic: pic1.email,
    rooms: [room1.name, room2.name],
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
