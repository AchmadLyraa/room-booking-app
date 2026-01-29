"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getAvailableRooms, createBooking } from "@/app/actions/pic-actions";
import type { BookingSession, MeetingType } from "@/prisma/generated/enums";
import { Suspense } from "react";
import { useToastNotifications } from "@/hooks/use-toast-notifications";
import { Grid2X2, Users } from "lucide-react";
import Link from "next/link";

function BookingForm({ foods, snacks }: { foods: any[]; snacks: any[] }) {
  const router = useRouter();
  const { showError, showSuccess } = useToastNotifications();
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
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        showError(errorMessage, "Failed to load rooms");
        setRooms([]);
      } finally {
        setLoadingRooms(false);
      }
    }

    loadRooms();
  }, [formData.bookingDate]);

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

      const result = await createBooking(formData);

      if (!result.success) {
        showError(result.error ?? "Booking failed");
        setLoading(false);
        return;
      }

      showSuccess(
        "Booking created successfully! Awaiting admin approval.",
        "Success",
      );
      router.push("/pic");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      showError(errorMessage, "Failed to create booking");
    } finally {
      setLoading(false);
    }
  };

  const getAvailableSessions = () => {
    const room = rooms.find((r) => r.id === formData.roomId);
    if (!room) return [];
    return room.availableSessions ?? [];
  };

  const sessionMap: Record<string, string> = {
    SESSION_1: "1 (08:00 - 12:00)",
    SESSION_2: "2 (13:00 - 16:00)",
    FULLDAY: "Full Day (08:00 - 16:00)",
  };

  const getSelectedRoom = () => {
    return rooms.find((r) => r.id === formData.roomId);
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 max-w-6xl mx-auto">
      {/* Booking Form */}
      <div className="flex-1 bg-white border-3 border-black brutal-shadow-lg">
        <div className="p-6 space-y-6">
          {/* Room Info - Responsive */}
          {formData.roomId && getSelectedRoom() && (
            <div className="pb-4 border-b-3 border-black">
              <h2 className="font-bold text-lg uppercase mb-4">
                {getSelectedRoom().name}
              </h2>
              <div className="flex flex-col md:flex-row items-start gap-4 md:gap-6">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-black/60 uppercase">
                    KAPASITAS
                  </span>
                  <span className="font-bold text-xl">
                    {getSelectedRoom().capacity}
                  </span>
                  <Users className="w-5 h-5" />
                </div>
              </div>
            </div>
          )}

          {/* Form - Responsive */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg uppercase">DETAIL BOOKING</h3>

            {/* Responsive form fields - stack on mobile, row on desktop */}
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="space-y-2 w-full md:w-[220px]">
                <label className="text-xs font-bold uppercase block">
                  NO SURAT*
                </label>
                <input
                  placeholder="Masukkan no surat"
                  value={formData.letterNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, letterNumber: e.target.value })
                  }
                  className="w-full h-12 px-4 border-3 border-black bg-white font-mono outline-none transition-all focus:shadow-[4px_4px_0_0_#000] focus:translate-x-[-2px] focus:translate-y-[-2px]"
                />
              </div>
              <div className="space-y-2 w-full md:w-[180px]">
                <label className="text-xs font-bold uppercase block">
                  TGL BOOKING*
                </label>
                <input
                  type="date"
                  value={formData.bookingDate}
                  onChange={(e) =>
                    setFormData({ ...formData, bookingDate: e.target.value })
                  }
                  className={`w-full h-12 px-4 border-3 border-black bg-white font-mono outline-none transition-all focus:shadow-[4px_4px_0_0_#000] focus:translate-x-[-2px] focus:translate-y-[-2px] ${
                    initialDate !== "" ? "bg-[#f5f5f5] cursor-not-allowed" : ""
                  }`}
                  disabled={initialDate !== ""}
                />
              </div>
              <div className="space-y-2 w-full md:w-[220px]">
                <label className="text-xs font-bold uppercase block">
                  SESI*
                </label>
                <input
                  value={
                    formData.session
                      ? sessionMap[formData.session] || formData.session
                      : ""
                  }
                  disabled
                  className="w-full h-12 px-4 border-3 border-black bg-[#f5f5f5] font-mono cursor-not-allowed"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase block">
                AGENDA*
              </label>
              <input
                placeholder="Masukkan agenda"
                value={formData.agenda}
                onChange={(e) =>
                  setFormData({ ...formData, agenda: e.target.value })
                }
                className="w-full h-12 px-4 border-3 border-black bg-white font-mono outline-none transition-all focus:shadow-[4px_4px_0_0_#000] focus:translate-x-[-2px] focus:translate-y-[-2px]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase block">
                DESKRIPSI*
              </label>
              <textarea
                placeholder="Masukkan deskripsi"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full min-h-24 px-4 py-3 border-3 border-black bg-white font-mono outline-none transition-all focus:shadow-[4px_4px_0_0_#000] focus:translate-x-[-2px] focus:translate-y-[-2px] resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase block">
                JENIS RAPAT*
              </label>
              <select
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    meetingType: e.target.value as MeetingType,
                  })
                }
                value={formData.meetingType}
                className="w-full h-12 px-4 border-3 border-black bg-white font-mono outline-none cursor-pointer"
              >
                <option value="">Pilih jenis rapat</option>
                <option value="INTERNAL">Internal</option>
                <option value="INTERNAL_LINTAS_BIDANG">
                  Internal Lintas Bidang
                </option>
                <option value="EKSTERNAL">Eksternal</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase block">
                CATATAN TAMBAHAN
              </label>
              <textarea
                placeholder="Catatan tambahan (opsional)"
                value={formData.note}
                onChange={(e) =>
                  setFormData({ ...formData, note: e.target.value })
                }
                className="w-full min-h-24 px-4 py-3 border-3 border-black bg-white font-mono outline-none transition-all focus:shadow-[4px_4px_0_0_#000] focus:translate-x-[-2px] focus:translate-y-[-2px] resize-none"
              />
            </div>

            {/* Responsive food/snack selection - stack on mobile */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase block">
                  PILIH MENU MAKANAN
                </label>
                <select
                  onChange={(e) => {
                    const foodId = e.target.value;
                    if (foodId) {
                      setFormData({
                        ...formData,
                        foodIds: [...formData.foodIds, foodId],
                      });
                    }
                  }}
                  className="w-full h-12 px-4 border-3 border-black bg-[#22c55e] text-white font-mono font-bold outline-none cursor-pointer"
                >
                  <option value="">Pilih makanan</option>
                  {foods.map((food: any) => (
                    <option key={food.id} value={food.id}>
                      {food.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase block">
                  PILIH MENU SNACK
                </label>
                <select
                  onChange={(e) => {
                    const snackId = e.target.value;
                    if (snackId) {
                      setFormData({
                        ...formData,
                        snackIds: [...formData.snackIds, snackId],
                      });
                    }
                  }}
                  className="w-full h-12 px-4 border-3 border-black bg-[#22c55e] text-white font-mono font-bold outline-none cursor-pointer"
                >
                  <option value="">Pilih snack</option>
                  {snacks.map((snack: any) => (
                    <option key={snack.id} value={snack.id}>
                      {snack.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Summary - Responsive */}
      <div className="bg-white border-3 border-black brutal-shadow-lg sticky top-6 md:w-96 md:ml-6">
        <div className="p-6 space-y-4">
          <h3 className="font-bold text-center text-lg uppercase border-b-3 border-black pb-4">
            RINGKASAN RESERVASI
          </h3>

          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-4 pb-2 border-b-2 border-black">
              <div>
                <p className="text-xs font-bold uppercase text-black/60">
                  TGL BOOKING
                </p>
                <p className="font-bold">{formData.bookingDate || "-"}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase text-black/60">
                  SESI
                </p>
                <p className="font-bold">
                  {formData.session
                    ? sessionMap[formData.session] || formData.session
                    : "-"}
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold uppercase text-black/60">
                NO SURAT
              </p>
              <p className="font-bold">{formData.letterNumber || "-"}</p>
            </div>

            <div>
              <p className="text-xs font-bold uppercase text-black/60">
                AGENDA
              </p>
              <p className="font-bold">{formData.agenda || "-"}</p>
            </div>

            <div>
              <p className="text-xs font-bold uppercase text-black/60">
                DESKRIPSI
              </p>
              <p className="font-bold">{formData.description || "-"}</p>
            </div>

            <div>
              <p className="text-xs font-bold uppercase text-black/60">
                JENIS RAPAT
              </p>
              <p className="font-bold uppercase">
                {formData.meetingType || "-"}
              </p>
            </div>

            <div>
              <p className="text-xs font-bold uppercase text-black/60">
                CATATAN
              </p>
              <p className="font-bold">{formData.note || "-"}</p>
            </div>

            <div className="pt-2 border-t-2 border-black">
              <p className="text-xs font-bold uppercase text-black/60">
                MENU MAKANAN & SNACK
              </p>
              <div className="flex gap-2 mt-1">
                <span className="font-bold">
                  {formData.foodIds.length > 0
                    ? foods
                        .filter((f) => formData.foodIds.includes(f.id))
                        .map((f) => f.name)
                        .join(", ")
                    : "-"}
                </span>
                <span className="text-black/60">|</span>
                <span className="font-bold">
                  {formData.snackIds.length > 0
                    ? snacks
                        .filter((s) => formData.snackIds.includes(s.id))
                        .map((s) => s.name)
                        .join(", ")
                    : "-"}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t-3 border-black">
            <button
              onClick={handleSubmit}
              disabled={
                !formData.letterNumber ||
                !formData.bookingDate ||
                !formData.agenda ||
                loading
              }
              className="w-full h-12 bg-[#22c55e] text-white font-bold uppercase border-3 border-black hover:shadow-[4px_4px_0_0_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:translate-x-0 disabled:hover:translate-y-0"
            >
              {loading ? "MEMBUAT BOOKING..." : "BOOKING SEKARANG"}
            </button>
            <button
              onClick={() => router.push("/pic")}
              className="w-full h-12 bg-white text-black font-bold uppercase border-3 border-black hover:shadow-[4px_4px_0_0_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all"
            >
              BATAL
            </button>
          </div>
        </div>
      </div>
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
    <div className="min-h-screen bg-white p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6 max-w-6xl mx-auto">
        <Link
          href="/pic"
          className="bg-white text-black px-6 py-3 font-bold uppercase border-3 border-black brutal-shadow hover:shadow-[6px_6px_0_0_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all"
        >
          KEMBALI
        </Link>
        <h1 className="text-2xl font-bold text-black uppercase flex-1 text-center">
          BOOKING RUANGAN
        </h1>
        <div className="w-24" />
      </div>

      <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
        <BookingForm foods={foods} snacks={snacks} />
      </Suspense>
    </div>
  );
}
