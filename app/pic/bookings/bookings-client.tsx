"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Sidebar } from "../sidebar";
import { Header } from "../header";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

function BookingsClient({ bookings }: { bookings: any[] }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const isMobile = useIsMobile();

  const statusConfig = {
    APPROVED: { label: "DISETUJUI", bg: "bg-[#22c55e]", text: "text-white" },
    PENDING: { label: "MENUNGGU", bg: "bg-[#facc15]", text: "text-black" },
    REJECTED: { label: "DITOLAK", bg: "bg-[#FF5E5B]", text: "text-white" },
  };

  // Filter bookings based on status and date
  const filteredBookings = bookings.filter((booking) => {
    let matchesStatus = true;
    let matchesDate = true;

    if (statusFilter) {
      matchesStatus = booking.status === statusFilter;
    }

    if (dateFilter) {
      const bookingDate = new Date(booking.bookingDate);
      matchesDate =
        bookingDate.getDate() === dateFilter.getDate() &&
        bookingDate.getMonth() === dateFilter.getMonth() &&
        bookingDate.getFullYear() === dateFilter.getFullYear();
    }

    return matchesStatus && matchesDate;
  });

  return (
    <div className="flex">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar role="user" currentView="bookings" />
      </div>

      {/* Mobile Layout */}
      <div className="flex-1 md:flex-1">
        <Header onMenuClick={isMobile ? () => setSidebarOpen(true) : undefined} />

        {/* Mobile Sidebar Sheet - Only show on mobile */}
        {isMobile && (
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetContent side="left" className="p-0 w-64">
              <Sidebar role="user" currentView="bookings" />
            </SheetContent>
          </Sheet>
        )}

        <div className="p-4 md:p-8">
          <div className="space-y-6">
            {/* Header with title and filters - matches room availability layout */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h1 className="text-xl md:text-2xl font-bold uppercase">SEMUA BOOKING SAYA</h1>
              <div className="flex border-3 border-black brutal-shadow overflow-hidden w-full md:w-auto self-end md:self-auto">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex-1 md:w-32 px-3 md:px-4 py-2 bg-[#22c55e] text-white font-bold uppercase border-r-3 border-black hover:bg-[#16a34a] transition-colors text-sm md:text-base min-h-[44px] flex items-center justify-center gap-2">
                      <span>STATUS</span>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-48 border-3 border-black brutal-shadow bg-white">
                    <DropdownMenuItem
                      onClick={() => setStatusFilter(statusFilter === "APPROVED" ? "" : "APPROVED")}
                      className={`font-bold uppercase cursor-pointer ${
                        statusFilter === "APPROVED" ? "bg-[#22c55e] text-white" : ""
                      }`}
                    >
                      DISETUJUI
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setStatusFilter(statusFilter === "PENDING" ? "" : "PENDING")}
                      className={`font-bold uppercase cursor-pointer ${
                        statusFilter === "PENDING" ? "bg-[#facc15] text-black" : ""
                      }`}
                    >
                      MENUNGGU
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setStatusFilter(statusFilter === "REJECTED" ? "" : "REJECTED")}
                      className={`font-bold uppercase cursor-pointer ${
                        statusFilter === "REJECTED" ? "bg-[#FF5E5B] text-white" : ""
                      }`}
                    >
                      DITOLAK
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Date Filter */}
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="flex-1 md:w-40 px-3 md:px-4 py-2 bg-white text-black font-bold border-r-3 border-black hover:bg-[#16a34a] transition-colors text-sm md:text-base min-h-[44px] flex items-center justify-center">
                      {dateFilter ? format(dateFilter, "dd/MM/yyyy") : "TANGGAL"}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 border-3 border-black brutal-shadow bg-white" align="end">
                    <Calendar
                      mode="single"
                      selected={dateFilter}
                      onSelect={(date) => setDateFilter(date)}
                      className="border-0"
                    />
                  </PopoverContent>
                </Popover>

                {/* Clear Filter */}
                <button
                  onClick={() => {
                    setStatusFilter("");
                    setDateFilter(undefined);
                  }}
                  className="flex-1 md:w-24 px-3 md:px-4 py-2 bg-white text-black font-bold uppercase hover:bg-[#16a34a] transition-colors text-sm md:text-base min-h-[44px] flex items-center justify-center"
                >
                  CLEAR
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredBookings.map((booking: any) => {
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
                  <div key={booking.id} className="bg-white border-3 border-black brutal-shadow p-4 md:p-6 flex flex-col md:flex-row gap-4 hover:shadow-[6px_6px_0_0_#000] transition-all">
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                        <p className="text-sm font-bold text-black/60 uppercase">
                          {format(booking.bookingDate, "dd/MM/yyyy")}
                        </p>
                        <span className={`text-xs font-bold uppercase px-3 py-1 border-2 border-black ${status.bg} ${status.text} self-start md:self-auto`}>
                          {status.label}
                        </span>
                      </div>
                      <h3 className="font-bold uppercase text-lg">{booking.room.name}</h3>
                      <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 text-sm">
                        <div>
                          <span className="text-xs text-black/60 uppercase">AREA</span>
                          <p className="font-bold">{booking.room.area || "N/A"}</p>
                        </div>
                        <div>
                          <span className="text-xs text-black/60 uppercase">KAPASITAS</span>
                          <p className="font-bold">{booking.room.capacity}</p>
                        </div>
                      </div>
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
                          <DialogTrigger asChild>
                            <button
                              className="h-8 px-3 bg-white font-bold uppercase border-2 border-black text-xs hover:shadow-[4px_4px_0_0_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all self-start"
                              onClick={() => setSelectedBooking(booking)}
                            >
                              DETAIL
                            </button>
                          </DialogTrigger>
                          <DialogContent className="border-3 border-black brutal-shadow bg-white max-w-2xl">
                            <DialogHeader>
                              <DialogTitle className="text-xl font-bold uppercase">DETAIL BOOKING</DialogTitle>
                            </DialogHeader>
                            {selectedBooking && (
                              <div className="space-y-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-sm font-bold text-black/60 uppercase">TANGGAL</p>
                                    <p className="font-bold">{format(selectedBooking.bookingDate, "dd/MM/yyyy")}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-bold text-black/60 uppercase">STATUS</p>
                                    <span className={`text-xs font-bold uppercase px-3 py-1 border-2 border-black ${statusConfig[selectedBooking.status as keyof typeof statusConfig]?.bg || statusConfig.PENDING.bg} ${statusConfig[selectedBooking.status as keyof typeof statusConfig]?.text || statusConfig.PENDING.text}`}>
                                      {statusConfig[selectedBooking.status as keyof typeof statusConfig]?.label || statusConfig.PENDING.label}
                                    </span>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-sm font-bold text-black/60 uppercase">RUANGAN</p>
                                    <p className="font-bold uppercase">{selectedBooking.room.name}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-bold text-black/60 uppercase">AREA</p>
                                    <p className="font-bold">{selectedBooking.room.area || "N/A"}</p>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-sm font-bold text-black/60 uppercase">KAPASITAS</p>
                                    <p className="font-bold">{selectedBooking.room.capacity}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-bold text-black/60 uppercase">SESI</p>
                                    <p className="font-bold">
                                      {(() => {
                                        switch (selectedBooking.session) {
                                          case "SESSION_1":
                                            return "Sesi 1 (08:00 - 12:00)";
                                          case "SESSION_2":
                                            return "Sesi 2 (13:00 - 16:00)";
                                          case "FULLDAY":
                                            return "Full Day (08:00 - 16:00)";
                                          default:
                                            return selectedBooking.session;
                                        }
                                      })()}
                                    </p>
                                  </div>
                                </div>

                                <div>
                                  <p className="text-sm font-bold text-black/60 uppercase">AGENDA</p>
                                  <p className="font-bold">{selectedBooking.agenda}</p>
                                </div>

                                <div>
                                  <p className="text-sm font-bold text-black/60 uppercase">DESKRIPSI</p>
                                  <p className="font-bold">{selectedBooking.description}</p>
                                </div>

                                <div>
                                  <p className="text-sm font-bold text-black/60 uppercase">JENIS RAPAT</p>
                                  <p className="font-bold">{selectedBooking.meetingType}</p>
                                </div>

                                {selectedBooking.note && (
                                  <div>
                                    <p className="text-sm font-bold text-black/60 uppercase">CATATAN</p>
                                    <p className="font-bold">{selectedBooking.note}</p>
                                  </div>
                                )}

                                {selectedBooking.foodNames && (
                                  <div>
                                    <p className="text-sm font-bold text-black/60 uppercase">MAKANAN</p>
                                    <p className="font-bold">{selectedBooking.foodNames}</p>
                                  </div>
                                )}

                                {selectedBooking.snackNames && (
                                  <div>
                                    <p className="text-sm font-bold text-black/60 uppercase">SNACK</p>
                                    <p className="font-bold">{selectedBooking.snackNames}</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        <span className="text-xs font-bold uppercase self-end md:self-auto">{sessionLabel}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredBookings.length === 0 && bookings.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📅</div>
                <h3 className="text-xl font-bold mb-2">Belum Ada Booking</h3>
                <p className="text-black/60">Anda belum memiliki booking aktif saat ini</p>
              </div>
            )}

            {filteredBookings.length === 0 && bookings.length > 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-bold mb-2">Tidak Ada Booking yang Cocok</h3>
                <p className="text-black/60">Coba ubah filter untuk melihat booking lainnya</p>
                <button
                  onClick={() => {
                    setStatusFilter("");
                    setDateFilter(undefined);
                  }}
                  className="mt-4 px-4 py-2 bg-[#22c55e] text-white font-bold uppercase border-2 border-black hover:shadow-[4px_4px_0_0_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all"
                >
                  CLEAR FILTER
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookingsClient;