"use client";

import { useState } from "react";
import { Settings, User, LogOut, Menu, Home, CalendarCheck } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { logoutUser } from "@/app/actions/logout-action";
import { useIsMobile } from "@/hooks/use-mobile";

interface PICLayoutProps {
  children: React.ReactNode;
  currentView?: string;
  onMenuClick: (index: number) => void;
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function PICLayout({ children, currentView, onMenuClick, sidebarOpen, setSidebarOpen }: PICLayoutProps) {
  const isMobile = useIsMobile();
  const pathname = usePathname();
  const router = useRouter();

  const menuItems = [
    { href: "/pic", label: "BERANDA", icon: Home },
    { href: "/pic/bookings", label: "BOOKING SAYA", icon: CalendarCheck },
  ];

  const handleMenuClick = (index: number) => {
    onMenuClick(index);
  };

  return (
    <div className="flex min-h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed top-0 left-0 bottom-0 w-64 flex-col bg-white border-r-3 border-black">
        <div className="p-4 border-b-3 border-black">
          <Link href="/pic" className="flex items-center gap-2">
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
          {menuItems.map((item, index) => {
            const isActive = pathname === item.href;
            return (
              <button
                key={item.href}
                onClick={() => handleMenuClick(index)}
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
            );
          })}
        </nav>
      </aside>

      {/* Mobile Sidebar */}
      {isMobile && (
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="p-0 w-64">
            <div className="flex flex-col min-h-screen bg-white border-r-3 border-black">
              <div className="p-4 border-b-3 border-black">
                <Link href="/pic" className="flex items-center gap-2">
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
                {menuItems.map((item, index) => {
                  const isActive = pathname === item.href;
                  return (
                    <button
                      key={item.href}
                      onClick={() => handleMenuClick(index)}
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
                  );
                })}
              </nav>
            </div>
          </SheetContent>
        </Sheet>
      )}

      {/* Header + Main Content */}
      <div className="flex flex-col flex-1 md:pl-64 h-full min-w-0">
        <header className="h-16 border-b-3 border-black bg-white flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3 flex-1 md:flex-none">
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(true)}
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
                    <User className="w-4 h-4" /> PROFIL
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-black h-[2px]" />
                <DropdownMenuItem asChild>
                  <form action={logoutUser}>
                    <button type="submit" className="flex items-center gap-2 cursor-pointer font-bold uppercase text-sm w-full text-left">
                      <LogOut className="w-4 h-4" /> KELUAR
                    </button>
                  </form>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-8 min-h-0">
          {children}
        </main>
      </div>
    </div>
  );
}