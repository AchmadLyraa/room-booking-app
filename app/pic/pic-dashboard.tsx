"use client";

import { useState } from "react";
import { logoutUser } from "@/app/actions/logout-action";

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

export default function PICDashboardClient({ bookings }: { bookings: any[] }) {
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  const handleLogout = async () => {
    await logoutUser();
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold mb-8">My Bookings</h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      <div className="space-y-4">
        {bookings.length === 0 ? (
          <p className="text-gray-500">No bookings yet</p>
        ) : (
          <div className="grid gap-4">
            {bookings.map((booking) => {
              const foodList = parseJsonArray(booking.foodNames);
              const snackList = parseJsonArray(booking.snackNames);

              return (
                <div key={booking.id} className="border rounded p-6 bg-white">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold">{booking.room.name}</h3>
                      <p className="text-gray-600">
                        Letter: {booking.letterNumber}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded font-semibold text-sm ${
                        booking.status === "PENDING"
                          ? "bg-yellow-200"
                          : booking.status === "APPROVED"
                            ? "bg-green-200"
                            : "bg-red-200"
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Date</p>
                      <p className="font-semibold">
                        {formatDateSafe(booking.bookingDate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Session</p>
                      <p className="font-semibold">{booking.session}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-600">Agenda</p>
                    <p className="font-semibold">{booking.agenda}</p>
                  </div>

                  {foodList.length > 0 && (
                    <div className="mb-2">
                      <p className="text-sm text-gray-600">Food</p>
                      <p className="text-sm">{foodList.join(", ")}</p>
                    </div>
                  )}

                  {snackList.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600">Snacks</p>
                      <p className="text-sm">{snackList.join(", ")}</p>
                    </div>
                  )}

                  <button
                    onClick={() => setSelectedBooking(booking)}
                    className="text-blue-500 hover:underline text-sm"
                  >
                    View Details
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedBooking && (
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
                    {formatDateSafe(selectedBooking.bookingDate)}
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
    </div>
  );
}
