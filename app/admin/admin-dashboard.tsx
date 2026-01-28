"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
  approveBooking,
  rejectBooking,
  updateAutoApprove,
  getSystemConfig,
} from "@/app/actions/admin-actions";
import { useToastNotifications } from "@/hooks/use-toast-notifications";
import { Sidebar, Header } from "@/components/admin-layout";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, BookOpen, Clock, CheckCircle, XCircle, Eye } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

function parseJsonArray(jsonString: string | null): string[] {
  if (!jsonString) return [];
  try {
    return JSON.parse(jsonString);
  } catch {
    return [];
  }
}

type AdminDashboardProps = {
  bookings: { success: boolean; data?: any[]; error?: string };
};

export default function AdminDashboardClient({
  bookings,
}: AdminDashboardProps) {
  const { showError, showSuccess } = useToastNotifications();
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [bookingList, setBookingList] = useState<any[]>(bookings?.success && bookings.data ? bookings.data : []);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [filter, setFilter] = useState("");
  const [autoApproveEnabled, setAutoApproveEnabled] = useState(false);
  const [togglingAutoApprove, setTogglingAutoApprove] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const loadAutoApproveStatus = async () => {
      const result = await getSystemConfig();

      if (!result.success) {
        showError(result.error);
        return;
      }

      setAutoApproveEnabled(result.data?.autoApprove || false);
    };

    loadAutoApproveStatus();
  }, []);

  const handleApprove = async (bookingId: string) => {
    setLoading(true);
    try {
      const result = await approveBooking(bookingId);

      if (!result.success) {
        showError(result.error);
        return;
      }

      showSuccess("Booking approved");

      // UPDATE STATE BERDASARKAN DATA DARI SERVER
      if (result.data && typeof result.data === 'object' && 'id' in result.data) {
        const bookingData = result.data as { id: string };
        setBookingList((prev) =>
          prev.map((b) => (b.id === bookingData.id ? bookingData : b)),
        );
      }
    } catch (error) {
      showError(error instanceof Error ? error.message : String(error), "Failed to approve booking");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAutoApprove = async () => {
    setTogglingAutoApprove(true);
    try {
      const result = await updateAutoApprove(!autoApproveEnabled);

      if (!result.success) {
        showError(result.error);
        return;
      }

      setAutoApproveEnabled(result.data?.autoApprove || false);
      showSuccess("Auto-approve updated");
    } catch (error) {
      showError(error instanceof Error ? error.message : String(error), "Failed to update auto-approve");
    } finally {
      setTogglingAutoApprove(false);
    }
  };

  const handleRejectSubmit = async () => {
    if (!selectedBooking) {
      showError("Booking not found");
      return;
    }

    setLoading(true);
    try {
      const result = await rejectBooking(selectedBooking.id, rejectReason);

      if (!result.success) {
        showError(result.error);
        return;
      }

      showSuccess("Booking rejected");

      if (result.data && typeof result.data === 'object' && 'id' in result.data) {
        const bookingData = result.data as { id: string };
        setBookingList((prev) =>
          prev.map((b) => (b.id === bookingData.id ? bookingData : b)),
        );
      }

      setShowRejectModal(false);
      setRejectReason("");
      setSelectedBooking(null);
    } catch (error) {
      showError(error instanceof Error ? error.message : String(error), "Failed to reject booking");
    } finally {
      setLoading(false);
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = bookingList
    .filter(
      (booking) =>
        booking.room?.name.toLowerCase().includes(filter.toLowerCase()) ||
        booking.user?.name.toLowerCase().includes(filter.toLowerCase()) ||
        booking.status.toLowerCase().includes(filter.toLowerCase()),
    )
    .slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(event.target.value);
    setCurrentPage(1);
  };

  const statusConfig = {
    APPROVED: { label: "DISETUJUI", bg: "bg-[#22c55e]", text: "text-white" },
    PENDING: { label: "MENUNGGU", bg: "bg-[#FFF000]", text: "text-black" },
    REJECTED: { label: "DITOLAK", bg: "bg-[#FF5E5B]", text: "text-white" },
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar - Sticky position */}
      <div className="hidden md:block md:w-64">
        <div className="sticky top-0 h-screen">
          <Sidebar currentView="dashboard" />
        </div>
      </div>
      {/* Mobile Sidebar Sheet */}
      {isMobile && (
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="p-0 w-64">
            <Sidebar currentView="dashboard" />
          </SheetContent>
        </Sheet>
      )}
      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0 h-full">
        <Header
          onMenuClick={isMobile ? () => setSidebarOpen(true) : undefined}
        />
        {/* Scrollable content */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 md:p-8">
          {/* Header with date */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold uppercase">ADMIN DASHBOARD</h1>
            <div className="flex border-3 border-black brutal-shadow overflow-hidden">
              <div className="px-4 py-2 bg-[#22c55e] text-white font-bold uppercase border-r-3 border-black">
                {format(new Date(), "EEEE", { locale: id }).toUpperCase()}
              </div>
              <div className="px-4 py-2 bg-black text-white font-bold border-r-3 border-black">
                {format(new Date(), "dd/MM/yyyy")}
              </div>
              <div className="px-4 py-2 bg-black text-white font-bold">
                {format(new Date(), "HH:mm")}
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="mb-8">
            <div className="flex gap-4 overflow-x-auto pb-2">
              {/* STATUS CARDS */}
              <div className="flex w-full gap-4 min-w-[700px]">
                {/* TOTAL BOOKING */}
                <div className="flex-1 flex items-center justify-between bg-white border-3 border-black brutal-shadow p-4 min-w-[180px]">
                  <div>
                    <h2 className="text-sm font-bold uppercase text-black/60">TOTAL BOOKING</h2>
                    <p className="text-3xl font-bold">{bookingList.length}</p>
                  </div>
                  <span className="ml-4 flex-shrink-0">
                    <BookOpen className="w-8 h-8 text-[#22c55e]" />
                  </span>
                </div>
                {/* MENUNGGU */}
                <div className="flex-1 flex items-center justify-between bg-white border-3 border-black brutal-shadow p-4 min-w-[180px]">
                  <div>
                    <h2 className="text-sm font-bold uppercase text-black/60">MENUNGGU</h2>
                    <p className="text-3xl font-bold">
                      {bookingList.filter((b) => b.status === "PENDING").length}
                    </p>
                  </div>
                  <span className="ml-4 flex-shrink-0">
                    <Clock className="w-8 h-8 text-[#FFF000]" />
                  </span>
                </div>
                {/* DISETUJUI */}
                <div className="flex-1 flex items-center justify-between bg-white border-3 border-black brutal-shadow p-4 min-w-[180px]">
                  <div>
                    <h2 className="text-sm font-bold uppercase text-black/60">DISETUJUI</h2>
                    <p className="text-3xl font-bold">
                      {bookingList.filter((b) => b.status === "APPROVED").length}
                    </p>
                  </div>
                  <span className="ml-4 flex-shrink-0">
                    <CheckCircle className="w-8 h-8 text-[#22c55e]" />
                  </span>
                </div>
                {/* DITOLAK */}
                <div className="flex-1 flex items-center justify-between bg-white border-3 border-black brutal-shadow p-4 min-w-[180px]">
                  <div>
                    <h2 className="text-sm font-bold uppercase text-black/60">DITOLAK</h2>
                    <p className="text-3xl font-bold">
                      {bookingList.filter((b) => b.status === "REJECTED").length}
                    </p>
                  </div>
                  <span className="ml-4 flex-shrink-0">
                    <XCircle className="w-8 h-8 text-[#FF5E5B]" />
                  </span>
                </div>
              </div>
            </div>
          </div>



          {/* Booking Table */}
          <div className="mb-8">
            <h2 className="text-xl font-bold uppercase mb-4">SEMUA BOOKING</h2>

            {/* Search and Auto Approve Button Row */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <input
                type="text"
                value={filter}
                onChange={handleFilterChange}
                placeholder="Cari booking..."
                className="w-full px-4 py-2 border-2 border-black brutal-shadow focus:outline-none focus:shadow-[4px_4px_0_0_#000] focus:translate-x-[-2px] focus:translate-y-[-2px] transition-all"
              />
              <button
                onClick={handleToggleAutoApprove}
                disabled={togglingAutoApprove}
                className={`w-full md:w-auto flex flex-col justify-center items-center font-bold uppercase text-center border-3 border-black brutal-shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed
                  hover:shadow-[6px_6px_0_0_#000] hover:translate-x-[-2px] hover:translate-y-[-2px]
                  ${autoApproveEnabled ? "bg-[#22c55e] text-white" : "bg-white text-black"}
                  h-[44px] px-4 py-2
                `}
                style={{ minWidth: "180px" }}
              >
                <span className="text-xs opacity-80 mb-1 leading-none">AUTO APPROVE</span>
                <span className="text-lg leading-none">
                  {autoApproveEnabled ? "ON" : "OFF"}
                </span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse border-3 border-black brutal-shadow">
                <thead className="bg-[#f5f5f5]">
                  <tr>
                    <th className="border-2 border-black p-3 text-left font-bold uppercase text-sm">NO SURAT</th>
                    <th className="border-2 border-black p-3 text-left font-bold uppercase text-sm">RUANGAN</th>
                    <th className="border-2 border-black p-3 text-left font-bold uppercase text-sm">TANGGAL</th>
                    <th className="border-2 border-black p-3 text-left font-bold uppercase text-sm">SESI</th>
                    <th className="border-2 border-black p-3 text-left font-bold uppercase text-sm">PIC</th>
                    <th className="border-2 border-black p-3 text-left font-bold uppercase text-sm">STATUS</th>
                    <th className="border-2 border-black p-3 text-left font-bold uppercase text-sm">AKSI</th>
                  </tr>
                </thead>

                <tbody>
                  {currentItems.map((booking, index) => {
                    const statusKey = booking.status as keyof typeof statusConfig;
                    const status = statusConfig[statusKey] || statusConfig.PENDING;

                    return (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border-2 border-black p-3">{booking.letterNumber}</td>
                        <td className="border-2 border-black p-3">{booking.room?.name}</td>
                        <td className="border-2 border-black p-3">
                          {format(new Date(booking.bookingDate), "dd/MM/yyyy")}
                        </td>
                        <td className="border-2 border-black p-3">
                          {booking.session === "SESSION_1" ? "Sesi 1" :
                           booking.session === "SESSION_2" ? "Sesi 2" : "Full Day"}
                        </td>
                        <td className="border-2 border-black p-3">{booking.user?.name}</td>
                        <td className="border-2 border-black p-3">
                          <span className={`px-3 py-1 border-2 border-black text-xs font-bold uppercase ${status.bg} ${status.text}`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="border-2 border-black p-3 space-x-2">
                          <button
                            onClick={() => setSelectedBooking(booking)}
                            className="px-3 py-1 bg-white border-2 border-black text-xs font-bold uppercase hover:shadow-[4px_4px_0_0_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {booking.status === "PENDING" && (
                            <>
                              <button
                                onClick={() => handleApprove(booking.id)}
                                disabled={loading}
                                className="px-3 py-1 bg-[#22c55e] text-white border-2 border-black text-xs font-bold uppercase hover:shadow-[4px_4px_0_0_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all disabled:opacity-50"
                              >
                                SETUJUI
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedBooking(booking);
                                  setShowRejectModal(true);
                                }}
                                disabled={loading}
                                className="px-3 py-1 bg-[#FF5E5B] text-white border-2 border-black text-xs font-bold uppercase hover:shadow-[4px_4px_0_0_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all disabled:opacity-50"
                              >
                                TOLAK
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex justify-center gap-2">
              {Array.from({ length: Math.ceil(bookingList.length / itemsPerPage) }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => paginate(page)}
                  className={`px-4 py-2 border-2 border-black font-bold uppercase ${
                    currentPage === page
                      ? "bg-[#22c55e] text-white"
                      : "bg-white text-black hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2 text-left">Letter</th>
                <th className="border p-2 text-left">Room</th>
                <th className="border p-2 text-left">Date</th>
                <th className="border p-2 text-left">Session</th>
                <th className="border p-2 text-left">PIC</th>
                <th className="border p-2 text-left">Status</th>
                <th className="border p-2 text-left">Actions</th>
              </tr>
            </thead>

            <tbody>
              {currentItems.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="border p-2">{booking.letterNumber}</td>
                  <td className="border p-2">{booking.room?.name}</td>
                  <td className="border p-2">{booking.bookingDateFormatted}</td>
                  <td className="border p-2">{booking.session}</td>
                  <td className="border p-2">{booking.user?.name}</td>
                  <td className="border p-2">
                    <span
                      className={`px-2 py-1 rounded text-sm font-semibold ${
                        booking.status === "PENDING"
                          ? "bg-yellow-200"
                          : booking.status === "APPROVED"
                            ? "bg-green-200"
                            : "bg-red-200"
                      }`}
                    >
                      {booking.status}
                    </span>
                  </td>
                  <td className="border p-2 space-x-2">
                    <button
                      onClick={() => setSelectedBooking(booking)}
                      className="text-blue-500 hover:underline text-sm"
                    >
                      View
                    </button>

                    {booking.status === "PENDING" && (
                      <>
                        <button
                          onClick={() => handleApprove(booking.id)}
                          disabled={loading}
                          className="text-green-500 hover:underline text-sm disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => {
                            setSelectedBooking(booking);
                            setShowRejectModal(true);
                          }}
                          disabled={loading}
                          className="text-red-500 hover:underline text-sm disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Detail Modal */}
      <Dialog open={!!selectedBooking && !showRejectModal} onOpenChange={() => setSelectedBooking(null)}>
        <DialogContent className="max-w-2xl">
          <div className="flex justify-between items-center mb-4">
            <DialogTitle className="text-xl font-bold uppercase">DETAIL BOOKING</DialogTitle>
          </div>
          {selectedBooking && (
            <div className="space-y-4 py-4 max-h-[80vh] overflow-y-auto">
              <div>
                <p className="text-sm font-bold uppercase text-black/60">NOMOR SURAT</p>
                <p className="font-semibold">{selectedBooking.letterNumber}</p>
              </div>

              <div>
                <p className="text-sm font-bold uppercase text-black/60">RUANGAN</p>
                <p className="font-semibold">{selectedBooking.room?.name}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-bold uppercase text-black/60">TANGGAL</p>
                  <p className="font-semibold">
                    {format(new Date(selectedBooking.bookingDate), "dd/MM/yyyy")}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-bold uppercase text-black/60">SESI</p>
                  <p className="font-semibold">
                    {selectedBooking.session === "SESSION_1" ? "Sesi 1 (08:00 - 12:00)" :
                     selectedBooking.session === "SESSION_2" ? "Sesi 2 (13:00 - 16:00)" : "Full Day (08:00 - 16:00)"}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm font-bold uppercase text-black/60">NAMA PIC</p>
                <p className="font-semibold">{selectedBooking.user?.name}</p>
              </div>

              <div>
                <p className="text-sm font-bold uppercase text-black/60">AGENDA</p>
                <p className="font-semibold">{selectedBooking.agenda}</p>
              </div>

              <div>
                <p className="text-sm font-bold uppercase text-black/60">DESKRIPSI</p>
                <p className="text-sm">{selectedBooking.description}</p>
              </div>

              <div>
                <p className="text-sm font-bold uppercase text-black/60">TIPE RAPAT</p>
                <p className="font-semibold">{selectedBooking.meetingType}</p>
              </div>

              {(() => {
                const foodList = parseJsonArray(selectedBooking.foodNames);
                return foodList.length > 0 ? (
                  <div>
                    <p className="text-sm font-bold uppercase text-black/60">MAKANAN</p>
                    <p className="text-sm">{foodList.join(", ")}</p>
                  </div>
                ) : null;
              })()}

              {(() => {
                const snackList = parseJsonArray(selectedBooking.snackNames);
                return snackList.length > 0 ? (
                  <div>
                    <p className="text-sm font-bold uppercase text-black/60">SNACK</p>
                    <p className="text-sm">{snackList.join(", ")}</p>
                  </div>
                ) : null;
              })()}

              {selectedBooking.note && (
                <div>
                  <p className="text-sm font-bold uppercase text-black/60">CATATAN</p>
                  <p className="text-sm">{selectedBooking.note}</p>
                </div>
              )}

              <div>
                <p className="text-sm font-bold uppercase text-black/60">STATUS</p>
                <span className={`inline-block px-3 py-1 border-2 border-black text-sm font-bold uppercase ${statusConfig[selectedBooking.status as keyof typeof statusConfig]?.bg} ${statusConfig[selectedBooking.status as keyof typeof statusConfig]?.text}`}>
                  {statusConfig[selectedBooking.status as keyof typeof statusConfig]?.label}
                </span>
              </div>

              {selectedBooking.rejectionReason && (
                <div className="bg-[#FF5E5B]/10 border border-[#FF5E5B] rounded p-3">
                  <p className="text-sm font-bold uppercase text-black/60">ALASAN PENOLAKAN</p>
                  <p className="text-sm text-[#FF5E5B]">
                    {selectedBooking.rejectionReason}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Confirmation Modal */}
      <Dialog open={showRejectModal && !!selectedBooking} onOpenChange={() => {
        setShowRejectModal(false);
        setRejectReason("");
      }}>
        <DialogContent className="max-w-md">
          <div className="flex justify-between items-center mb-4">
            <DialogTitle className="text-xl font-bold uppercase">TOLAK BOOKING</DialogTitle>
          </div>
          {selectedBooking && (
            <>
              <div className="space-y-4 py-4">
                <div>
                  <p className="font-bold uppercase text-black/60 mb-2">NOMOR SURAT</p>
                  <p className="mb-4">{selectedBooking.letterNumber}</p>
                </div>

                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Masukkan alasan penolakan..."
                  className="w-full border-2 border-black p-3 h-24 mb-4 brutal-shadow focus:outline-none focus:shadow-[4px_4px_0_0_#000] focus:translate-x-[-2px] focus:translate-y-[-2px] transition-all"
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleRejectSubmit}
                  disabled={loading || !rejectReason.trim()}
                  className="flex-1 px-4 py-3 bg-[#FF5E5B] text-white font-bold uppercase border-2 border-black hover:shadow-[4px_4px_0_0_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all disabled:opacity-50"
                >
                  {loading ? "MEMPROSES..." : "TOLAK"}
                </button>
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectReason("");
                  }}
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-white font-bold uppercase border-2 border-black hover:shadow-[4px_4px_0_0_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all disabled:opacity-50"
                >
                  BATAL
                </button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}