import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getAllRooms } from "@/app/actions/admin-actions";
import RoomsManagementClient from "./rooms-management";

export default async function RoomsPage() {
  const session = await auth();

  if (!session) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/");

  const rooms = await getAllRooms();

  return <RoomsManagementClient rooms={rooms} />;
}
