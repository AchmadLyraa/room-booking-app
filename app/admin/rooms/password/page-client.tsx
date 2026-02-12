"use client";

import * as React from "react";
import { resetUserPassword } from "@/app/actions/change-password-action";
import { useToastNotifications } from "@/hooks/use-toast-notifications";
import { Sidebar, Header } from "@/components/admin-layout";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { Copy, Key, RefreshCw } from "lucide-react";

type User = {
  id: string;
  name: string;
  email: string;
};

type Props = {
  users: User[];
};

export default function ResetPasswordPageClient({ users }: Props) {
  const { showError, showSuccess } = useToastNotifications();
  const [selectedUserId, setSelectedUserId] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [generatedPassword, setGeneratedPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [showDropdown, setShowDropdown] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const isMobile = useIsMobile();

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".relative")) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter users based on search
  const filteredUsers = React.useMemo(() => {
    if (!searchQuery.trim()) return users;

    const query = searchQuery.toLowerCase();
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query),
    );
  }, [users, searchQuery]);

  const handleReset = async () => {
    if (!selectedUserId) {
      showError("Pilih user terlebih dahulu");
      return;
    }

    setIsLoading(true);
    setGeneratedPassword("");
    setShowPassword(false);

    const result = await resetUserPassword(selectedUserId);

    setIsLoading(false);

    if (result.error) {
      showError(result.error);
    } else if (result.success && result.newPassword) {
      showSuccess("Password berhasil direset");
      setGeneratedPassword(result.newPassword);
      setShowPassword(true);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPassword);
    showSuccess("Password berhasil dicopy");
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar - Desktop */}
      <div className="hidden md:block md:w-64">
        <div className="sticky top-0 h-screen">
          <Sidebar currentView="password" />
        </div>
      </div>

      {/* Mobile Sidebar Sheet */}
      {isMobile && (
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="p-0 w-64">
            <Sidebar currentView="password" />
          </SheetContent>
        </Sheet>
      )}

      {/* Main Content */}
      <div className="flex flex-col flex-1 min-w-0 h-full">
        <Header
          onMenuClick={isMobile ? () => setSidebarOpen(true) : undefined}
        />

        {/* Scrollable Content */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 md:p-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold uppercase mb-2">
              RESET PASSWORD PIC
            </h1>
            <p className="text-black/60">
              Generate password baru untuk PIC yang lupa password
            </p>
          </div>

          {/* Main Form Card */}
          <div className="max-w-2xl">
            <div className="bg-white border-3 border-black brutal-shadow p-6 space-y-6">
              {/* Icon Header */}
              <div className="flex items-center gap-3 pb-4 border-b-2 border-black">
                <div className="p-3 bg-[#22c55e] border-2 border-black">
                  <Key className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="font-bold uppercase text-lg">
                    RESET PASSWORD
                  </h2>
                  <p className="text-sm text-black/60">
                    Pilih PIC dan generate password baru
                  </p>
                </div>
              </div>

              {/* Select User */}
              {/* Select User dengan Autocomplete */}
              <div className="space-y-2">
                <label className="block font-bold uppercase text-sm text-black/60">
                  PILIH PIC:
                </label>

                {/* Combobox Input */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Ketik nama atau email PIC..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowDropdown(true);
                    }}
                    onFocus={() => setShowDropdown(true)}
                    className="w-full border-2 border-black px-4 py-3 font-medium brutal-shadow focus:outline-none focus:shadow-[4px_4px_0_0_#000] focus:translate-x-[-2px] focus:translate-y-[-2px] transition-all"
                  />

                  {/* Dropdown Results */}
                  {showDropdown && filteredUsers.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border-2 border-black brutal-shadow max-h-60 overflow-y-auto">
                      {filteredUsers.map((user) => (
                        <button
                          key={user.id}
                          type="button"
                          onClick={() => {
                            setSelectedUserId(user.id);
                            setSearchQuery(`${user.name} (${user.email})`);
                            setShowDropdown(false);
                            setShowPassword(false);
                            setGeneratedPassword("");
                          }}
                          className={`w-full text-left px-4 py-3 hover:bg-[#22c55e] hover:text-white transition-colors border-b border-black last:border-b-0 ${
                            selectedUserId === user.id
                              ? "bg-[#22c55e] text-white"
                              : ""
                          }`}
                        >
                          <div className="font-bold">{user.name}</div>
                          <div className="text-sm opacity-70">{user.email}</div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* No Results */}
                  {showDropdown &&
                    searchQuery &&
                    filteredUsers.length === 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border-2 border-black brutal-shadow px-4 py-3 text-black/60">
                        Tidak ada PIC yang cocok
                      </div>
                    )}
                </div>

                {/* Selected User Info */}
                {selectedUserId && (
                  <div className="flex items-center justify-between bg-[#22c55e]/10 border-2 border-[#22c55e] px-4 py-2">
                    <span className="text-sm font-bold">
                      ✓ {users.find((u) => u.id === selectedUserId)?.name}
                    </span>
                    <button
                      onClick={() => {
                        setSelectedUserId("");
                        setSearchQuery("");
                        setShowPassword(false);
                        setGeneratedPassword("");
                      }}
                      className="text-xs font-bold hover:text-red-600"
                    >
                      HAPUS
                    </button>
                  </div>
                )}
              </div>

              {/* Reset Button */}
              <button
                onClick={handleReset}
                disabled={!selectedUserId || isLoading}
                className="w-full px-6 py-3 bg-black text-white font-bold uppercase border-3 border-black brutal-shadow disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[6px_6px_0_0_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    MERESET...
                  </>
                ) : (
                  <>
                    <Key className="w-5 h-5" />
                    RESET PASSWORD
                  </>
                )}
              </button>

              {/* Generated Password Display */}
              {showPassword && generatedPassword && (
                <div className="bg-[#22c55e]/10 border-3 border-[#22c55e] p-6 space-y-4">
                  <div className="flex items-center gap-2 text-[#22c55e]">
                    <div className="w-2 h-2 bg-[#22c55e] rounded-full animate-pulse" />
                    <p className="font-bold uppercase text-sm">
                      PASSWORD BARU BERHASIL DIGENERATE!
                    </p>
                  </div>

                  <div className="bg-white border-2 border-black p-4 flex items-center justify-between gap-4">
                    <code className="text-xl md:text-2xl font-mono font-bold break-all">
                      {generatedPassword}
                    </code>
                    <button
                      onClick={copyToClipboard}
                      className="flex-shrink-0 px-4 py-2 bg-[#22c55e] text-white font-bold uppercase border-2 border-black hover:shadow-[4px_4px_0_0_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all flex items-center gap-2"
                    >
                      <Copy className="w-4 h-4" />
                      COPY
                    </button>
                  </div>

                  <div className="bg-[#FFF000] border-2 border-black p-4">
                    <p className="font-bold uppercase text-sm mb-2">
                      ⚠️ PENTING!
                    </p>
                    <p className="text-sm">
                      Simpan password ini dan berikan ke PIC yang bersangkutan.
                      Password ini tidak akan ditampilkan lagi setelah halaman
                      ini ditutup.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Info Card */}
            <div className="mt-6 bg-white border-3 border-black brutal-shadow p-4">
              <p className="font-bold uppercase text-sm mb-2 text-black/60">
                📋 CARA KERJA:
              </p>
              <ol className="space-y-2 text-sm">
                <li className="flex gap-2">
                  <span className="font-bold">1.</span>
                  <span>Pilih PIC yang ingin direset passwordnya</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold">2.</span>
                  <span>Klik tombol "RESET PASSWORD"</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold">3.</span>
                  <span>Password baru akan digenerate secara otomatis</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold">4.</span>
                  <span>Copy password dan berikan ke PIC</span>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
