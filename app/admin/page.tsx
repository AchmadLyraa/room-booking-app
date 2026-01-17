import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getAllBookings } from "@/app/actions/admin-actions";
import AdminDashboardClient from "./admin-dashboard";

export default async function AdminPage() {
  // HARD GATE — DI SINI AUTH BERES
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  if (session?.user?.role !== "ADMIN") {
    redirect("/");
  }

  // FETCH DATA DI SERVER
  const bookings = await getAllBookings(1, 100);

  return <AdminDashboardClient bookings={bookings} />;
}
