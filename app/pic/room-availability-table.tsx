"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { getRoomAvailability } from "@/app/actions/pic-actions";
import type { BookingSession } from "@prisma/client";

export function RoomAvailabilityTable() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const today = new Date();
    // today.setHours(0, 0, 0, 0);
    return today;
  });
  const [availability, setAvailability] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedDate) return;

    async function loadAvailability() {
      setLoading(true);
      try {
        const dateString = selectedDate.toLocaleDateString("en-CA"); // en-CA gives YYYY-MM-DD format
        const data = await getRoomAvailability(dateString);
        setAvailability(data);
      } finally {
        setLoading(false);
      }
    }

    loadAvailability();
  }, [selectedDate]);

  const handleCellClick = (
    roomId: string,
    session: BookingSession,
    status: string,
  ) => {
    if (status !== "TERSEDIA") return;

    const dateString = selectedDate!.toLocaleDateString("en-CA");
    router.push(
      `/pic/booking?date=${dateString}&roomId=${roomId}&session=${session}`,
    );
  };

  const getSessionLabel = (session: BookingSession) => {
    if (session === "SESSION_1") return "SESI1\n08:00-12:00";
    if (session === "SESSION_2") return "SESI2\n13:00-16:00";
    return "FULL\n08:00-16:00";
  };

  const getStatusStyle = (status: string) => {
    if (status === "TERSEDIA") {
      return "bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer font-semibold";
    }
    if (status === "DISABLED") {
      return "bg-gray-100 text-gray-500 cursor-not-allowed font-semibold";
    }
    return "bg-red-100 text-red-800 cursor-not-allowed font-semibold";
  };

  return (
    <div className="p-6 bg-white rounded-lg border">
      <div className="mb-6 flex items-center gap-4">
        <h2 className="text-2xl font-bold">DAFTAR RESERVASI RUANGAN</h2>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">
              📅{" "}
              {selectedDate
                ? selectedDate.toLocaleDateString("id-ID")
                : "Pilih Tanggal"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) =>
                date < new Date(new Date().setHours(0, 0, 0, 0))
              }
            />
          </PopoverContent>
        </Popover>
      </div>

      {!selectedDate ? (
        <p className="text-gray-500 text-center py-8">
          Silakan pilih tanggal untuk melihat ketersediaan ruangan
        </p>
      ) : loading ? (
        <p className="text-gray-500 text-center py-8">Loading...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-400 px-4 py-2 text-left font-bold">
                  NO
                </th>
                <th className="border border-gray-400 px-4 py-2 text-left font-bold">
                  RUANGAN
                </th>
                <th className="border border-gray-400 px-4 py-2 text-center font-bold">
                  KAPASITAS
                </th>
                <th
                  colSpan={3}
                  className="border border-gray-400 px-4 py-2 text-center font-bold"
                >
                  SESI RAPAT
                </th>
              </tr>
              <tr className="bg-gray-100">
                <th className="border border-gray-400 px-4 py-2"></th>
                <th className="border border-gray-400 px-4 py-2"></th>
                <th className="border border-gray-400 px-4 py-2"></th>
                <th className="border border-gray-400 px-4 py-2 text-center font-bold">
                  <div>SESI1</div>
                  <div className="text-sm">08:00-12:00</div>
                </th>
                <th className="border border-gray-400 px-4 py-2 text-center font-bold">
                  <div>SESI2</div>
                  <div className="text-sm">13:00-16:00</div>
                </th>
                <th className="border border-gray-400 px-4 py-2 text-center font-bold">
                  <div>FULL</div>
                  <div className="text-sm">08:00-16:00</div>
                </th>
              </tr>
            </thead>
            <tbody>
              {availability.map((room, index) => (
                <tr key={room.id}>
                  <td className="border border-gray-400 px-4 py-2 text-center font-semibold">
                    {String(index + 1).padStart(2, "0")}
                  </td>
                  <td className="border border-gray-400 px-4 py-2 font-semibold">
                    {room.name}
                  </td>
                  <td className="border border-gray-400 px-4 py-2 text-center">
                    {room.capacity}
                  </td>

                  {(["SESSION_1", "SESSION_2", "FULLDAY"] as const).map(
                    (session) => {
                      const session1Status = room.sessionAvailability.SESSION_1;
                      const session2Status = room.sessionAvailability.SESSION_2;
                      const fullDayStatus = room.sessionAvailability.FULLDAY;

                      let displayStatus = room.sessionAvailability[session];

                      // Jika FULLDAY sudah RESERVED, SESSION_1 dan SESSION_2 jadi RESERVED
                      if (fullDayStatus === "RESERVED") {
                        if (
                          session === "SESSION_1" ||
                          session === "SESSION_2"
                        ) {
                          displayStatus = "RESERVED";
                        }
                      }

                      // Jika SESSION_1 atau SESSION_2 sudah RESERVED, FULLDAY jadi DISABLED
                      if (
                        (session1Status === "RESERVED" ||
                          session2Status === "RESERVED") &&
                        session === "FULLDAY"
                      ) {
                        displayStatus = "DISABLED";
                      }

                      return (
                        <td
                          key={`${room.id}-${session}`}
                          className={`border border-gray-400 px-4 py-2 text-center ${getStatusStyle(displayStatus)} whitespace-pre-wrap`}
                          onClick={() =>
                            handleCellClick(room.id, session, displayStatus)
                          }
                        >
                          {displayStatus}
                        </td>
                      );
                    },
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
