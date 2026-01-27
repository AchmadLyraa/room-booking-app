"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { getRoomAvailability } from "@/app/actions/pic-actions";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

function getStatusButton(status: string, roomId: number, session: string, selectedDate: Date, session1Status?: string, session2Status?: string) {
  const dateString = selectedDate.toLocaleDateString("en-CA");

  // Logic for full session (FULLDAY)
  if (session === "FULLDAY") {
    // If either session 1 or session 2 is booked, full becomes restricted (database sets to "DISABLED")
    if (status === "DISABLED") {
      return (
        <button className="h-8 px-3 bg-[#FFF000] text-black font-bold uppercase border-2 border-black text-xs cursor-not-allowed" disabled>
          DIBATASI
        </button>
      );
    }
    // Otherwise check the actual status
    if (status === "TERSEDIA") {
      return (
        <Link href={`/pic/booking?date=${dateString}&roomId=${roomId}&session=${session}`}>
          <button className="h-8 px-3 bg-[#22c55e] text-white font-bold uppercase border-2 border-black text-xs hover:shadow-[4px_4px_0_0_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all">
            TERSEDIA
          </button>
        </Link>
      );
    }
    // If full day is booked, show as booked
    return (
      <button className="h-8 px-3 bg-[#FF5E5B] text-white font-bold uppercase border-2 border-black text-xs cursor-not-allowed" disabled>
        TERPAKAI
      </button>
    );
  }

  // Logic for session 1 and session 2
  if (status === "TERSEDIA") {
    return (
      <Link href={`/pic/booking?date=${dateString}&roomId=${roomId}&session=${session}`}>
        <button className="h-8 px-3 bg-[#22c55e] text-white font-bold uppercase border-2 border-black text-xs hover:shadow-[4px_4px_0_0_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all">
          TERSEDIA
        </button>
      </Link>
    );
  }

  // If booked or disabled (time passed), show as booked
  return (
    <button className="h-8 px-3 bg-[#FF5E5B] text-white font-bold uppercase border-2 border-black text-xs cursor-not-allowed" disabled>
      TERPAKAI
    </button>
  );
}

export function RoomAvailabilityTable() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [availability, setAvailability] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadAvailability() {
      setLoading(true);
      try {
        const dateString = currentDate.toLocaleDateString("en-CA");
        const data = await getRoomAvailability(dateString);
        setAvailability(data);
      } finally {
        setLoading(false);
      }
    }

    loadAvailability();
  }, [currentDate]);

  const dayName = format(currentDate, "EEEE", { locale: id }).toUpperCase();
  const dateFormatted = format(currentDate, "dd/MM/yyyy");
  const timeFormatted = format(currentDate, "HH:mm");

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header with date */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-xl md:text-2xl font-bold uppercase">DAFTAR RESERVASI RUANGAN</h1>
        <div className="flex border-3 border-black brutal-shadow overflow-hidden w-full md:w-auto self-end md:self-auto">
          <div className="flex-1 px-3 md:px-4 py-2 bg-white text-black font-bold text-sm md:text-base text-center border-r-3 border-black">{timeFormatted}</div>
          <div className="flex-1 px-3 md:px-4 py-2 bg-white text-black font-bold uppercase border-r-3 border-black text-sm md:text-base text-center">
            {dayName}
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <button className="flex-1 px-3 md:px-4 py-2 bg-[#22c55e] text-white font-bold hover:bg-[#16a34a] transition-colors text-sm md:text-base min-h-[44px] text-center">
                {dateFormatted}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 border-3 border-black brutal-shadow bg-white" align="end">
              <Calendar
                mode="single"
                selected={currentDate}
                onSelect={(date) => date && setCurrentDate(date)}
                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                className="border-0"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Room Availability Table - Desktop */}
      <div className="hidden md:block bg-white border-3 border-black brutal-shadow overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="bg-[#f5f5f5] border-b-3 border-black">
              <th className="px-4 py-3 text-center font-bold uppercase text-sm border-r-2 border-black">NO</th>
              <th className="px-4 py-3 text-left font-bold uppercase text-sm border-r-2 border-black">RUANGAN</th>
              <th className="px-4 py-3 text-center font-bold uppercase text-sm border-r-2 border-black">KAPASITAS</th>
              <th className="px-4 py-3 text-center font-bold uppercase text-sm border-r-2 border-black">
                <div>SESI 1</div>
                <div className="text-xs font-normal text-black/60">08:00-12:00</div>
              </th>
              <th className="px-4 py-3 text-center font-bold uppercase text-sm border-r-2 border-black">
                <div>SESI 2</div>
                <div className="text-xs font-normal text-black/60">13:00-16:00</div>
              </th>
              <th className="px-4 py-3 text-center font-bold uppercase text-sm">
                <div>FULL</div>
                <div className="text-xs font-normal text-black/60">08:00-16:00</div>
              </th>
            </tr>
          </thead>
          <tbody>
            {availability.map((room, index) => {
              const session1Status = room.sessionAvailability.SESSION_1;
              const session2Status = room.sessionAvailability.SESSION_2;
              const fullDayStatus = room.sessionAvailability.FULLDAY;

              return (
                <tr key={room.id} className="border-b-2 border-black last:border-b-0">
                  <td className="px-4 py-4 text-center font-bold border-r-2 border-black">{index + 1}</td>
                  <td className="px-4 py-4 font-bold border-r-2 border-black">{room.name}</td>
                  <td className="px-4 py-4 text-center font-bold border-r-2 border-black">{room.capacity}</td>
                  <td className="px-4 py-4 text-center border-r-2 border-black">
                    {getStatusButton(session1Status, room.id, "SESSION_1", currentDate, session1Status, session2Status)}
                  </td>
                  <td className="px-4 py-4 text-center border-r-2 border-black">
                    {getStatusButton(session2Status, room.id, "SESSION_2", currentDate, session1Status, session2Status)}
                  </td>
                  <td className="px-4 py-4 text-center">
                    {getStatusButton(fullDayStatus, room.id, "FULLDAY", currentDate, session1Status, session2Status)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Room Availability Cards - Mobile */}
      <div className="md:hidden space-y-4">
        {availability.map((room, index) => {
          const session1Status = room.sessionAvailability.SESSION_1;
          const session2Status = room.sessionAvailability.SESSION_2;
          const fullDayStatus = room.sessionAvailability.FULLDAY;

          return (
            <div key={room.id} className="bg-white border-3 border-black brutal-shadow p-4">
              {/* Room Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#22c55e] text-white font-bold flex items-center justify-center text-sm border-2 border-black">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-bold uppercase text-lg">{room.name}</h3>
                    <p className="text-sm text-black/60">Kapasitas: {room.capacity} orang</p>
                  </div>
                </div>
              </div>

              {/* Session Buttons */}
              <div className="space-y-3">
                <div className="grid grid-cols-1 gap-3">
                  {/* Session 1 */}
                  <div className="flex items-center justify-between p-3 bg-[#f5f5f5] border-2 border-black">
                    <div>
                      <div className="font-bold uppercase text-sm">SESI 1</div>
                      <div className="text-xs text-black/60">08:00-12:00</div>
                    </div>
                    <div>
                      {getStatusButton(session1Status, room.id, "SESSION_1", currentDate, session1Status, session2Status)}
                    </div>
                  </div>

                  {/* Session 2 */}
                  <div className="flex items-center justify-between p-3 bg-[#f5f5f5] border-2 border-black">
                    <div>
                      <div className="font-bold uppercase text-sm">SESI 2</div>
                      <div className="text-xs text-black/60">13:00-16:00</div>
                    </div>
                    <div>
                      {getStatusButton(session2Status, room.id, "SESSION_2", currentDate, session1Status, session2Status)}
                    </div>
                  </div>

                  {/* Full Day */}
                  <div className="flex items-center justify-between p-3 bg-[#f5f5f5] border-2 border-black">
                    <div>
                      <div className="font-bold uppercase text-sm">FULL DAY</div>
                      <div className="text-xs text-black/60">08:00-16:00</div>
                    </div>
                    <div>
                      {getStatusButton(fullDayStatus, room.id, "FULLDAY", currentDate, session1Status, session2Status)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
