"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, DoorOpen, UtensilsCrossed } from "lucide-react"
import { cn } from "@/lib/utils"

export function Sidebar({ currentView }: { currentView?: string }) {
  const pathname = usePathname()

  const adminMenuItems = [
    { href: "/admin", label: "BERANDA", icon: Home },
    { href: "/admin/rooms", label: "RUANGAN", icon: DoorOpen },
    { href: "/admin/foods-snacks", label: "MAKANAN", icon: UtensilsCrossed },
  ]

  return (
    <aside className="w-64 min-h-screen bg-white border-r-3 border-black flex flex-col">
      <div className="p-4 border-b-3 border-black">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-[#facc15] border-2 border-black flex items-center justify-center brutal-shadow">
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-black" fill="currentColor">
              <path d="M13 3L4 14h7l-2 7 9-11h-7l2-7z" />
            </svg>
          </div>
          <div>
            <span className="font-bold text-lg text-black uppercase">PLNSPACE</span>
            <p className="text-[9px] text-black leading-tight uppercase font-bold">
              BY PT PLN NUSANTARA POWER UP KALTIM TELUK
            </p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {adminMenuItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href))

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 border-2 border-black transition-all font-bold uppercase text-sm",
                isActive
                  ? "bg-[#22c55e] text-white brutal-shadow"
                  : "bg-white text-black hover:bg-[#f5f5f5] hover:shadow-[4px_4px_0_0_#000] hover:translate-x-[-2px] hover:translate-y-[-2px]"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
