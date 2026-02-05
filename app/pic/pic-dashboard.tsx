"use client";

import { useState } from "react";
import { format } from "date-fns";
import { useDispatch } from "react-redux";
import { showLoading, hideLoading } from "react-redux-loading-bar";
import { signOut } from "next-auth/react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { RoomAvailabilityTable } from "./room-availability-table";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import BookingsClient from "./bookings/bookings-client";

function parseJsonArray(jsonString: string | null): string[] {
  if (!jsonString) return [];
  try {
    return JSON.parse(jsonString);
  } catch {
    return [];
  }
}

// Helper function untuk format date yang aman dari hydration error
function formatDateSafe(dateString: string | Date): string {
  const date = new Date(dateString);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${day}/${month}/${year}`; // atau format lain yang kamu mau
}

export default function PICDashboardClient({
  bookings,
  view = "availability",
}: {
  bookings: any[];
  view?: string;
}) {
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();
  const dispatch = useDispatch();

  const handleLogout = async () => {
    dispatch(showLoading());
    try {
      await signOut({ callbackUrl: "/login" });
    } finally {
      dispatch(hideLoading());
    }
  };

  const statusConfig = {
    APPROVED: { label: "DISETUJUI", bg: "bg-[#22c55e]", text: "text-white" },
    PENDING: { label: "MENUNGGU", bg: "bg-[#FFF000]", text: "text-black" },
    REJECTED: { label: "DITOLAK", bg: "bg-[#FF5E5B]", text: "text-white" },
  };

  return (
    <>
      <div className="flex">
        {/* Desktop Sidebar - Sticky position */}
        <div className="hidden md:block md:w-64">
          <div className="sticky top-0 h-screen">
            <Sidebar role="user" currentView={view} />
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="flex-1">
          <Header
            onMenuClick={isMobile ? () => setSidebarOpen(true) : undefined}
          />

          {/* Mobile Sidebar Sheet - Only show on mobile */}
          {isMobile && (
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetContent side="left" className="p-0 w-64">
                <Sidebar role="user" currentView={view} />
              </SheetContent>
            </Sheet>
          )}

          <div className="p-4 md:p-8">
            {view === "bookings" ? (
              <BookingsClient bookings={bookings} />
            ) : (
              <RoomAvailabilityTable />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
