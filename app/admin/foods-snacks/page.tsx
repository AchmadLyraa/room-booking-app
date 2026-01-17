import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getAllFoods, getAllSnacks } from "@/app/actions/admin-actions";
import FoodsSnacksManagementClient from "./foods-snacks-management";

export default async function FoodsSnacksPage() {
  const session = await auth();

  if (!session) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/");

  const foods = await getAllFoods();
  const snacks = await getAllSnacks();

  return <FoodsSnacksManagementClient foods={foods} snacks={snacks} />;
}
