"use client"

import { useState } from "react"
import { Search, Settings, User, LogOut, Menu } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { logoutUser } from "@/app/actions/logout-action"

interface HeaderProps {
  showSearch?: boolean
  onMenuClick?: () => void
}

export function Header({ showSearch = true, onMenuClick }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <header className="h-16 border-b-3 border-black bg-white flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center gap-3 flex-1 md:flex-none">
        {/* Mobile Menu Button */}
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="md:hidden w-10 h-10 border-2 border-black flex items-center justify-center hover:bg-[#f5f5f5] hover:shadow-[4px_4px_0_0_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Search Bar - Hidden on mobile */}
        {showSearch && (
          <div className="relative hidden md:block w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black" />
            <input
              type="search"
              placeholder="CARI.."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 border-2 border-black bg-white font-mono text-sm uppercase outline-none transition-all focus:shadow-[4px_4px_0_0_#000] focus:translate-x-[-2px] focus:translate-y-[-2px]"
            />
          </div>
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
