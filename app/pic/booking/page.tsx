import { getFoodsAndSnacks } from "@/app/actions/pic-actions";
import CreateBookingClient from "./booking-page";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function BookingPage() {
  const session = await auth();

  if (!session) redirect("/login");

  if (session.user.role !== "PIC") {
    redirect("/");
  }

  const { foods, snacks } = await getFoodsAndSnacks();

  return <CreateBookingClient foods={foods} snacks={snacks} />;
}
