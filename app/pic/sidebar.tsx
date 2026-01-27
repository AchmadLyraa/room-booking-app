"use client"

import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Home, DoorOpen, UtensilsCrossed, CalendarCheck } from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarProps {
  role: "admin" | "user"
  currentView?: string
}

const adminMenuItems = [
  { href: "/admin", label: "BERANDA", icon: Home },
  { href: "/admin/ruangan", label: "RUANGAN", icon: DoorOpen },
  { href: "/admin/makanan", label: "MAKANAN", icon: UtensilsCrossed },
]

const userMenuItems = [
  { href: "/pic", label: "BERANDA", icon: Home },
  { href: "/pic/bookings", label: "BOOKING SAYA", icon: CalendarCheck },
]

export function Sidebar({ role, currentView }: SidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const menuItems = role === "admin" ? adminMenuItems : userMenuItems

  const handleUserMenuClick = (index: number) => {
    if (index === 0) { // BERANDA
      router.push("/pic")
    } else if (index === 1) { // BOOKING AKTIF
      router.push("/pic/bookings")
    }
  }

  return (
    <aside className="w-64 min-h-screen bg-white border-r-3 border-black flex flex-col">
      <div className="p-4 border-b-3 border-black">
        <Link href={role === "admin" ? "/admin" : "/pic"} className="flex items-center gap-2">
          <img src="/PLNSPACE_logo2.png" alt="PLNSPACE Logo" className="object-contain" />
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item, index) => {
          let isActive = false

          if (role === "admin") {
            isActive = pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href))
          } else {
            // For user role, check based on pathname
            if (index === 0) { // BERANDA
              isActive = pathname === "/pic"
            } else if (index === 1) { // BOOKING AKTIF
              isActive = pathname === "/pic/bookings"
            }
          }

          if (role === "user") {
            return (
              <button
                key={item.href}
                onClick={() => handleUserMenuClick(index)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 border-2 border-black transition-all font-bold uppercase text-sm w-full text-left",
                  isActive
                    ? "bg-[#22c55e] text-white brutal-shadow"
                    : "bg-white text-black hover:bg-[#f5f5f5] hover:shadow-[4px_4px_0_0_#000] hover:translate-x-[-2px] hover:translate-y-[-2px]"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            )
          }

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
