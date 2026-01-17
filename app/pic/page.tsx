import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getUserBookings } from "@/app/actions/pic-actions";
import PICDashboardClient from "./pic-dashboard";
import { RoomAvailabilityTable } from "./room-availability-table";

export default async function PICPage() {
  const session = await auth();

  if (!session) redirect("/login");
  if (session.user.role !== "PIC") redirect("/");

  const bookings = await getUserBookings();

  return (
    <>
      <PICDashboardClient bookings={bookings} />;{/* Room Availability Table */}
      <RoomAvailabilityTable />
    </>
  );
}
