"use client";

import { useState } from "react";
import { format } from "date-fns";
import { logoutUser } from "@/app/actions/logout-action";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { RoomAvailabilityTable } from "./room-availability-table";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

function parseJsonArray(jsonString: string | null): string[] {
  if (!jsonString) return [];
  try {
    return JSON.parse(jsonString);
  } catch {
    return [];
  }
}

export default function PICDashboardClient({
  bookings,
  view = "availability"
}: {
  bookings: any[];
  view?: string;
}) {
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  const handleLogout = async () => {
    await logoutUser();
  };

  const statusConfig = {
    APPROVED: { label: "DISETUJUI", bg: "bg-[#22c55e]", text: "text-white" },
    PENDING: { label: "MENUNGGU", bg: "bg-[#facc15]", text: "text-black" },
    REJECTED: { label: "DITOLAK", bg: "bg-[#FF5E5B]", text: "text-white" },
  };

  const BookingList = ({ bookings }: { bookings: any[] }) => (
    <div className="space-y-6">
      <div>
         <h1 className="text-xl md:text-2xl font-bold uppercase">SEMUA BOOKING SAYA</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {bookings.map((booking) => {
          const statusKey = booking.status as keyof typeof statusConfig;
          const status = statusConfig[statusKey] || statusConfig.PENDING;

          const sessionLabel = (() => {
            switch (booking.session) {
              case "SESSION_1":
                return "Sesi 1 (08:00 - 12:00)";
              case "SESSION_2":
                return "Sesi 2 (13:00 - 16:00)";
              case "FULLDAY":
                return "Full Day (08:00 - 16:00)";
              default:
                return booking.session;
            }
          })();

          return (
            <div key={booking.id} className="bg-white border-3 border-black brutal-shadow p-6 flex gap-4 hover:shadow-[6px_6px_0_0_#000] transition-all">
              <div className="w-32 h-24 bg-gradient-to-br from-amber-800 to-amber-600 flex-shrink-0 relative overflow-hidden border-2 border-black">
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              </div>
              <div className="flex-1 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-black/60 uppercase">
                    {format(booking.bookingDate, "dd/MM/yyyy")}
                  </p>
                  <span className={`text-xs font-bold uppercase px-3 py-1 border-2 border-black ${status.bg} ${status.text}`}>
                    {status.label}
                  </span>
                </div>
                <h3 className="font-bold uppercase text-lg">{booking.room.name}</h3>
                <div className="flex items-center gap-4 text-sm">
                  <div>
                    <span className="text-xs text-black/60 uppercase">AREA</span>
                    <p className="font-bold">{booking.room.area || "N/A"}</p>
                  </div>
                  <div>
                    <span className="text-xs text-black/60 uppercase">KAPASITAS</span>
                    <p className="font-bold">{booking.room.capacity}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setSelectedBooking(booking)}
                    className="h-8 px-3 bg-white font-bold uppercase border-2 border-black text-xs hover:shadow-[4px_4px_0_0_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all"
                  >
                    LIHAT DETAIL
                  </button>
                  <span className="text-xs font-bold uppercase">{sessionLabel}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {bookings.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📅</div>
          <h3 className="text-xl font-bold mb-2">Belum Ada Booking</h3>
          <p className="text-black/60">Anda belum memiliki booking aktif saat ini</p>
        </div>
      )}
    </div>
  );

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
          <Header onMenuClick={isMobile ? () => setSidebarOpen(true) : undefined} />

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
              <BookingList bookings={bookings} />
            ) : (
              <RoomAvailabilityTable />
            )}
          </div>
        </div>
      </div>

      {selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6 border-3 border-black brutal-shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold uppercase">DETAIL BOOKING</h2>
              <button
                onClick={() => setSelectedBooking(null)}
                className="w-8 h-8 flex items-center justify-center bg-white border-2 border-black font-bold uppercase hover:shadow-[4px_4px_0_0_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Letter Number</p>
                <p className="font-semibold">{selectedBooking.letterNumber}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Room</p>
                <p className="font-semibold">{selectedBooking.room?.name}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Date</p>
                  <p className="font-semibold">
                    {new Date(selectedBooking.bookingDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Session</p>
                  <p className="font-semibold">{selectedBooking.session}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600">Agenda</p>
                <p className="font-semibold">{selectedBooking.agenda}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Description</p>
                <p className="text-sm">{selectedBooking.description}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Meeting Type</p>
                <p className="font-semibold">{selectedBooking.meetingType}</p>
              </div>

              {(() => {
                const foodList = parseJsonArray(selectedBooking.foodNames);
                return foodList.length > 0 ? (
                  <div>
                    <p className="text-sm text-gray-600">Food</p>
                    <p className="text-sm">{foodList.join(", ")}</p>
                  </div>
                ) : null;
              })()}

              {(() => {
                const snackList = parseJsonArray(selectedBooking.snackNames);
                return snackList.length > 0 ? (
                  <div>
                    <p className="text-sm text-gray-600">Snacks</p>
                    <p className="text-sm">{snackList.join(", ")}</p>
                  </div>
                ) : null;
              })()}

              {selectedBooking.note && (
                <div>
                  <p className="text-sm text-gray-600">Notes</p>
                  <p className="text-sm">{selectedBooking.note}</p>
                </div>
              )}

              <div>
                <p className="text-sm text-gray-600">Current Status</p>
                <span
                  className={`inline-block px-3 py-1 rounded text-sm font-semibold ${
                    selectedBooking.status === "PENDING"
                      ? "bg-yellow-200"
                      : selectedBooking.status === "APPROVED"
                        ? "bg-green-200"
                        : "bg-red-200"
                  }`}
                >
                  {selectedBooking.status}
                </span>
              </div>

              {selectedBooking.rejectionReason && (
                <div className="bg-red-50 border border-red-200 rounded p-3">
                  <p className="text-sm text-gray-600">Rejection Reason</p>
                  <p className="text-sm text-red-600">
                    {selectedBooking.rejectionReason}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
