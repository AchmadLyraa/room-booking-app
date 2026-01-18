"use client";
import type React from "react";
import {
  approveBooking,
  rejectBooking,
  updateAutoApprove,
  getSystemConfig,
} from "@/app/actions/admin-actions";

import { useState, useEffect } from "react";
import { logoutUser } from "@/app/actions/logout-action";
import Pagination from "@/components/Pagination";
import Filter from "@/components/Filter";
import { useToastNotifications } from "@/hooks/use-toast-notifications";

function parseJsonArray(jsonString: string | null): string[] {
  if (!jsonString) return [];
  try {
    return JSON.parse(jsonString);
  } catch {
    return [];
  }
}

type AdminDashboardProps = {
  bookings: any[];
};

export default function AdminDashboardClient({
  bookings,
}: AdminDashboardProps) {
  const { showError, showSuccess } = useToastNotifications();
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [bookingList, setBookingList] = useState(bookings);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [filter, setFilter] = useState("");
  const [autoApproveEnabled, setAutoApproveEnabled] = useState(false);
  const [togglingAutoApprove, setTogglingAutoApprove] = useState(false);

  useEffect(() => {
    const loadAutoApproveStatus = async () => {
      const result = await getSystemConfig();

      if (!result.success) {
        showError(result.error);
        return;
      }

      setAutoApproveEnabled(result.data.autoApprove);
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
      setBookingList((prev) =>
        prev.map((b) => (b.id === result.data.id ? result.data : b)),
      );
    } catch (error) {
      showError(error, "Failed to approve booking");
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

      setAutoApproveEnabled(result.data.autoApprove);
      showSuccess("Auto-approve updated");
    } catch (error) {
      showError(error, "Failed to update auto-approve");
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

      setBookingList((prev) =>
        prev.map((b) => (b.id === result.data.id ? result.data : b)),
      );

      setShowRejectModal(false);
      setRejectReason("");
      setSelectedBooking(null);
    } catch (error) {
      showError(error, "Failed to reject booking");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
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

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
        <div className="p-4 bg-blue-100 rounded">
          <h2 className="text-sm text-gray-600">Total Bookings</h2>
          <p className="text-3xl font-bold">{bookingList.length}</p>
        </div>

        <div className="p-4 bg-yellow-100 rounded">
          <h2 className="text-sm text-gray-600">Pending</h2>
          <p className="text-3xl font-bold">
            {bookingList.filter((b) => b.status === "PENDING").length}
          </p>
        </div>

        <div className="p-4 bg-green-100 rounded">
          <h2 className="text-sm text-gray-600">Approved</h2>
          <p className="text-3xl font-bold">
            {bookingList.filter((b) => b.status === "APPROVED").length}
          </p>
        </div>

        <div className="p-4 bg-red-100 rounded">
          <h2 className="text-sm text-gray-600">Rejected</h2>
          <p className="text-3xl font-bold">
            {bookingList.filter((b) => b.status === "REJECTED").length}
          </p>
        </div>
      </div>

      <div className="mb-8 flex gap-4">
        <a
          href="/admin/rooms"
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Manage Rooms
        </a>
        <a
          href="/admin/foods-snacks"
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Manage Foods & Snacks
        </a>
        <button
          onClick={handleToggleAutoApprove}
          disabled={togglingAutoApprove}
          className={`px-4 py-2 text-white rounded ${
            autoApproveEnabled
              ? "bg-green-500 hover:bg-green-600"
              : "bg-gray-500 hover:bg-gray-600"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {autoApproveEnabled ? "✓ Auto-Approve ON" : "✗ Auto-Approve OFF"}
        </button>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">All Bookings</h2>
        <div className="mb-4">
          <Filter value={filter} onChange={handleFilterChange} />
        </div>

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
                  <td className="border p-2">
                    {new Date(booking.bookingDate).toLocaleDateString()}
                  </td>
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
            </tbody>
          </table>
        </div>
        <div className="mt-4">
          <Pagination
            itemsPerPage={itemsPerPage}
            totalItems={bookingList.length}
            paginate={paginate}
            currentPage={currentPage}
          />
        </div>
      </div>

      {/* Detail Modal */}
      {selectedBooking && !showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Booking Details</h2>
              <button
                onClick={() => setSelectedBooking(null)}
                className="text-gray-500 hover:text-gray-700"
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
                <p className="text-sm text-gray-600">PIC Name</p>
                <p className="font-semibold">{selectedBooking.user?.name}</p>
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
                <p className="text-sm text-gray-600">Status</p>
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
                <div>
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

      {/* Reject Confirmation Modal */}
      {showRejectModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4">Reject Booking</h2>
            <p className="text-gray-600 mb-4">
              Letter: {selectedBooking.letterNumber}
            </p>

            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter reason for rejection..."
              className="w-full border rounded px-4 py-2 h-24 mb-4"
            />

            <div className="flex gap-4">
              <button
                onClick={handleRejectSubmit}
                disabled={loading || !rejectReason.trim()}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
              >
                {loading ? "Submitting..." : "Reject"}
              </button>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason("");
                }}
                disabled={loading}
                className="flex-1 px-4 py-2 border rounded hover:bg-gray-100 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
