import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ResetPasswordAdmin from "./page-client";

export default async function AdminResetPasswordPage() {
  const session = await auth();

  // Cek authentication dan role
  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (user?.role !== "ADMIN") {
    redirect("/");
  }

  // Ambil semua user dengan role PIC
  const picUsers = await prisma.user.findMany({
    where: { role: "PIC" },
    select: {
      id: true,
      name: true,
      email: true,
    },
    orderBy: { name: "asc" },
  });

  return <ResetPasswordAdmin users={picUsers} />;
}
