import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getUserBookings } from "@/app/actions/pic-actions";
import PICDashboardClient from "./pic-dashboard";

export default async function PICPage({
  searchParams,
}: {
  searchParams: { view?: string };
}) {
  const session = await auth();

  if (!session) redirect("/login");
  if (session.user.role !== "PIC") redirect("/");

  const bookings = await getUserBookings();
  const view = searchParams.view || "availability";

  return <PICDashboardClient bookings={bookings} view={view} />;
}
