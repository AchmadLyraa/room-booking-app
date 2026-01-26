import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Calendar, Clock, ArrowLeft } from "lucide-react";
import { auth } from "@/auth";
import Link from "next/link";

export default async function ProfilePage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  // Fetch user data from database
  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    include: {
      bookings: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-white p-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4 mb-6 max-w-6xl mx-auto">
        <Link
          href={user.role === "PIC" ? "/pic" : "/"}
          className="bg-white text-black px-6 py-3 font-bold uppercase border-3 border-black brutal-shadow hover:shadow-[6px_6px_0_0_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all"
        >
          KEMBALI
        </Link>
        <h1 className="text-2xl font-bold text-black uppercase flex-1 text-center">PROFIL PENGGUNA</h1>
        <div className="w-24" />
      </div>

      <div className="container mx-auto py-8 px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="md:col-span-1">
            <CardHeader className="flex flex-col items-center gap-4">
              <Avatar className="w-24 h-24">
                <AvatarImage src="/placeholder-user.jpg" alt={user.name || "User"} />
                <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
              <div className="text-center">
                <CardTitle className="text-xl">{user.name}</CardTitle>
                <Badge variant="secondary" className="mt-2">
                  {user.role}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>Joined: {new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>

          {/* User Info Card */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>User Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Account Details</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name</span>
                      <span>{user.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email</span>
                      <span>{user.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Role</span>
                      <span>{user.role}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Member since</span>
                      <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Booking Statistics</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Bookings</span>
                      <span>{user.bookings.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Active Bookings</span>
                      <span>{user.bookings.filter(b => new Date(b.bookingDate) >= new Date()).length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}