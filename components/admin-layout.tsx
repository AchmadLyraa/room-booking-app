"use client"

import { useState } from "react"
import { Settings, User, LogOut, Menu, Home, DoorOpen, UtensilsCrossed } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { logoutUser } from "@/app/actions/logout-action"
import { cn } from "@/lib/utils"

interface HeaderProps {
  showSearch?: boolean
  onMenuClick?: () => void
}

export function Header({ showSearch = true, onMenuClick }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <header className="sticky top-0 z-20 h-16 border-b-3 border-black bg-white flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center gap-3 flex-1 md:flex-none">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="md:hidden w-10 h-10 border-2 border-black flex items-center justify-center hover:bg-[#f5f5f5] hover:shadow-[4px_4px_0_0_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-3 ml-auto">
        <button className="w-10 h-10 border-2 border-black flex items-center justify-center hover:bg-[#f5f5f5] hover:shadow-[4px_4px_0_0_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all">
          <Settings className="w-5 h-5" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-10 h-10 border-2 border-black flex items-center justify-center hover:bg-[#f5f5f5] hover:shadow-[4px_4px_0_0_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all">
              <User className="w-5 h-5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 border-2 border-black brutal-shadow bg-white">
            <DropdownMenuItem asChild>
              <Link href="/profile" className="flex items-center gap-2 cursor-pointer font-bold uppercase text-sm">
                <User className="w-4 h-4" />
                PROFIL
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-black h-[2px]" />
            <DropdownMenuItem asChild>
              <form action={logoutUser}>
                <button type="submit" className="flex items-center gap-2 cursor-pointer font-bold uppercase text-sm w-full text-left">
                  <LogOut className="w-4 h-4" />
                  KELUAR
                </button>
              </form>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

interface SidebarProps {
  currentView?: string
  menuItems?: { href: string; label: string; icon: any }[]
}

export function Sidebar({ currentView, menuItems }: SidebarProps) {
  const pathname = usePathname()

  const defaultMenuItems = [
    { href: "/admin", label: "BERANDA", icon: Home },
    { href: "/admin/rooms", label: "RUANGAN", icon: DoorOpen },
    { href: "/admin/foods-snacks", label: "MAKANAN", icon: UtensilsCrossed },
  ]

  const items = menuItems || defaultMenuItems

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
        {items.map((item) => {
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