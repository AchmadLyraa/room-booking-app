import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getUserBookings } from "@/app/actions/pic-actions";
import BookingsClient from "./bookings-client";

export default async function BookingsPage() {
  const session = await auth();

  if (!session) redirect("/login");
  if (session.user.role !== "PIC") redirect("/");

  const bookings = await getUserBookings();

  return <BookingsClient bookings={bookings} />;
}
