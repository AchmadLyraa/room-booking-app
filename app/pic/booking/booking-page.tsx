"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getAvailableRooms, createBooking } from "@/app/actions/pic-actions";
import type { BookingSession, MeetingType } from "@prisma/client";
import { Suspense } from "react";
import { useToastNotifications } from "@/hooks/use-toast-notifications";

function CreateBookingForm({ foods, snacks }: { foods: any[]; snacks: any[] }) {
  const router = useRouter();
  const { showError, showSuccess } = useToastNotifications(); // Declare useToastNotifications
  const [loading, setLoading] = useState(false);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);

  const searchParams = useSearchParams();

  const initialDate = searchParams.get("date") || "";
  const initialRoomId = searchParams.get("roomId") || "";
  const initialSession = searchParams.get("session") || "";

  const [formData, setFormData] = useState({
    letterNumber: "",
    roomId: initialRoomId,
    bookingDate: initialDate,
    session: (initialSession as BookingSession) || ("" as BookingSession),
    agenda: "",
    description: "",
    meetingType: "" as MeetingType,
    note: "",
    documentUrl: "",
    foodIds: [] as string[],
    snackIds: [] as string[],
  });

  // load rooms based on date
  useEffect(() => {
    if (!formData.bookingDate) return;

    async function loadRooms() {
      setLoadingRooms(true);
      try {
        const data = await getAvailableRooms(formData.bookingDate);
        setRooms(data);
      } catch (error) {
        showError(error, "Failed to load rooms");
        setRooms([]);
      } finally {
        setLoadingRooms(false);
      }
    }

    loadRooms();
  }, [formData.bookingDate, showError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validation
      if (!formData.letterNumber.trim()) {
        showError("Letter number is required");
        setLoading(false);
        return;
      }
      if (!formData.roomId) {
        showError("Please select a room");
        setLoading(false);
        return;
      }
      if (!formData.session) {
        showError("Please select a session");
        setLoading(false);
        return;
      }
      if (!formData.agenda.trim()) {
        showError("Agenda is required");
        setLoading(false);
        return;
      }
      if (!formData.description.trim()) {
        showError("Description is required");
        setLoading(false);
        return;
      }
      if (!formData.meetingType) {
        showError("Meeting type is required");
        setLoading(false);
        return;
      }

      await createBooking(formData);
      showSuccess(
        "Booking created successfully! Awaiting admin approval.",
        "Success",
      );
      router.push("/pic");
    } catch (error) {
      showError(error, "Failed to create booking");
    } finally {
      setLoading(false);
    }
  };

  const getAvailableSessions = () => {
    const room = rooms.find((r) => r.id === formData.roomId);
    if (!room) return [];

    let availableSessions = room.availableSessions || [];

    // Kalo SESSION_1 atau SESSION_2 tersedia, hapus FULLDAY
    if (
      availableSessions.includes("SESSION_1") ||
      availableSessions.includes("SESSION_2")
    ) {
      // Jika keduanya ada, FULLDAY harus dihapus
      if (
        availableSessions.includes("SESSION_1") &&
        availableSessions.includes("SESSION_2")
      ) {
        availableSessions = availableSessions.filter((s) => s !== "FULLDAY");
      }
    }

    return availableSessions;
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">Create Room Booking</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold mb-2">
            Letter Number *
          </label>
          <input
            type="text"
            required
            value={formData.letterNumber}
            onChange={(e) =>
              setFormData({ ...formData, letterNumber: e.target.value })
            }
            className="w-full border rounded px-4 py-2"
            placeholder="e.g., SURAT-2024-001"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">
            Booking Date *
          </label>
          <input
            type="date"
            required
            value={formData.bookingDate}
            onChange={(e) =>
              setFormData({ ...formData, bookingDate: e.target.value })
            }
            className={`w-full border rounded px-4 py-2 ${
              initialDate !== ""
                ? "bg-gray-100 text-gray-500 cursor-not-allowed opacity-60"
                : ""
            }`}
            disabled={initialDate !== ""}
          />
          {initialDate && (
            <p className="text-xs text-gray-500 mt-1">
              Date pre-selected from availability table
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Room *</label>
          <select
            required
            value={formData.roomId}
            onChange={(e) =>
              setFormData({ ...formData, roomId: e.target.value })
            }
            className={`w-full border rounded px-4 py-2 ${
              initialRoomId !== ""
                ? "bg-gray-100 text-gray-500 cursor-not-allowed opacity-60"
                : ""
            }`}
            disabled={initialRoomId !== ""}
          >
            <option value="">Select a room</option>
            {rooms.map((room) => (
              <option key={room.id} value={room.id}>
                {room.name} (Capacity: {room.capacity})
              </option>
            ))}
          </select>
          {initialRoomId && (
            <p className="text-xs text-gray-500 mt-1">
              Room pre-selected from availability table
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Session *</label>
          <select
            required
            value={formData.session}
            onChange={(e) =>
              setFormData({
                ...formData,
                session: e.target.value as BookingSession,
              })
            }
            className={`w-full border rounded px-4 py-2 ${
              initialSession !== ""
                ? "bg-gray-100 text-gray-500 cursor-not-allowed opacity-60"
                : ""
            }`}
            disabled={initialSession !== ""}
          >
            <option value="">Select a session</option>
            {getAvailableSessions().map((session) => (
              <option key={session} value={session}>
                {session === "SESSION_1"
                  ? "08:00 - 12:00"
                  : session === "SESSION_2"
                    ? "13:00 - 16:00"
                    : "08:00 - 16:00 (Fullday)"}
              </option>
            ))}
          </select>
          {initialSession && (
            <p className="text-xs text-gray-500 mt-1">
              Session pre-selected from availability table
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">
            Agenda/Keperluan *
          </label>
          <input
            type="text"
            required
            value={formData.agenda}
            onChange={(e) =>
              setFormData({ ...formData, agenda: e.target.value })
            }
            className="w-full border rounded px-4 py-2"
            placeholder="Tujuan penggunaan ruangan"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">
            Description *
          </label>
          <textarea
            required
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="w-full border rounded px-4 py-2 h-24"
            placeholder="Deskripsi detail kegiatan"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">
            Meeting Type *
          </label>
          <select
            required
            value={formData.meetingType}
            onChange={(e) =>
              setFormData({
                ...formData,
                meetingType: e.target.value as MeetingType,
              })
            }
            className="w-full border rounded px-4 py-2"
          >
            <option value="">Select type</option>
            <option value="INTERNAL">Internal</option>
            <option value="INTERNAL_LINTAS_BIDANG">
              Internal Lintas Bidang
            </option>
            <option value="EKSTERNAL">Eksternal</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">
            Additional Notes
          </label>
          <textarea
            value={formData.note}
            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
            className="w-full border rounded px-4 py-2 h-20"
            placeholder="Catatan tambahan (opsional)"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Food</label>
          <div className="space-y-2">
            {foods.map((food) => (
              <label key={food.id} className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.foodIds.includes(food.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFormData({
                        ...formData,
                        foodIds: [...formData.foodIds, food.id],
                      });
                    } else {
                      setFormData({
                        ...formData,
                        foodIds: formData.foodIds.filter(
                          (id) => id !== food.id,
                        ),
                      });
                    }
                  }}
                  className="mr-2"
                />
                <span>{food.name}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Snacks</label>
          <div className="space-y-2">
            {snacks.map((snack) => (
              <label key={snack.id} className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.snackIds.includes(snack.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFormData({
                        ...formData,
                        snackIds: [...formData.snackIds, snack.id],
                      });
                    } else {
                      setFormData({
                        ...formData,
                        snackIds: formData.snackIds.filter(
                          (id) => id !== snack.id,
                        ),
                      });
                    }
                  }}
                  className="mr-2"
                />
                <span>{snack.name}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Booking"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 px-6 py-3 border rounded hover:bg-gray-100"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default function CreateBookingClient({
  foods,
  snacks,
}: {
  foods: any[];
  snacks: any[];
}) {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <CreateBookingForm foods={foods} snacks={snacks} />
    </Suspense>
  );
}
