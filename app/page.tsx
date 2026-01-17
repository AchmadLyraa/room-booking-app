import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();

  if (!session) redirect("/login");
  if (session.user?.role === "ADMIN") redirect("/admin");
  if (session.user?.role === "PIC") redirect("/pic");

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold">Welcome</h1>
    </div>
  );
}
