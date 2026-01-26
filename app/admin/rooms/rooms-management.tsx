"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Package } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToastNotifications } from "@/hooks/use-toast-notifications";
import { Sidebar, Header } from "@/components/admin-layout";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  createRoom,
  updateRoom,
  deleteRoom,
  getAllRooms
} from "@/app/actions/admin-actions";

type RoomsManagementProps = {
  rooms: { success: boolean; data?: any[]; error?: string };
};

export default function RoomsManagementClient({ rooms: initialRooms }: RoomsManagementProps) {
  const { showError, showSuccess } = useToastNotifications();
  const [roomList, setRoomList] = useState<any[]>(initialRooms?.data ?? []);
  const [editMode, setEditMode] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    capacity: 10,
  });
  const [editingRoom, setEditingRoom] = useState<any>(null);
  const isMobile = useIsMobile();

  // Refresh data when edit mode changes
  useEffect(() => {
    const refreshData = async () => {
      const result = await getAllRooms();
      if (result.success && result.data) {
        setRoomList(result.data);
      }
    };

    if (!editMode) {
      refreshData();
    }
  }, [editMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingRoom) {
        // Update existing room
        const result = await updateRoom(
          editingRoom.id,
          formData.name,
          formData.description,
          formData.capacity
        );

        if (!result.success) {
          if (result.error === "ROOM_NAME_EXISTS") {
            showError("Nama ruangan sudah ada");
          } else {
            showError("Gagal update ruangan");
          }
          return;
        }

        setRoomList((prev) =>
          prev.map((r) => (r.id === result.data.id ? result.data : r))
        );
        showSuccess("Ruangan berhasil diupdate");
      } else {
        // Create new room
        const result = await createRoom(
          formData.name,
          formData.description,
          formData.capacity
        );

        if (!result.success) {
          if (result.error === "ROOM_NAME_EXISTS") {
            showError("Nama ruangan sudah ada");
          } else {
            showError("Gagal membuat ruangan");
          }
          return;
        }

        setRoomList((prev) => [result.data, ...prev]);
        showSuccess("Ruangan berhasil dibuat");
      }

      // Reset form and close dialog
      setFormData({ name: "", description: "", capacity: 10 });
      setEditingRoom(null);
      setIsAddDialogOpen(false);
    } catch (error) {
      showError("Gagal menyimpan ruangan");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (room: any) => {
    setEditingRoom(room);
    setFormData({
      name: room.name,
      description: room.description || "",
      capacity: room.capacity,
    });
    setIsAddDialogOpen(true);
  };

  const handleDelete = async (roomId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus ruangan ini?")) return;

    setLoading(true);
    try {
      const result = await deleteRoom(roomId);

      if (!result.success) {
        showError("Gagal menghapus ruangan");
        return;
      }

      setRoomList((prev) => prev.filter((r) => r.id !== roomId));
      showSuccess("Ruangan berhasil dihapus");
    } catch (error) {
      showError("Gagal menghapus ruangan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar - Sticky position */}
      <div className="hidden md:block md:w-64">
        <div className="sticky top-0 h-screen">
          <Sidebar currentView="rooms" />
        </div>
      </div>

      {/* Mobile Sidebar Sheet */}
      {isMobile && (
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="p-0 w-64">
            <Sidebar currentView="rooms" />
          </SheetContent>
        </Sheet>
      )}

      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0 h-full">
        <Header onMenuClick={isMobile ? () => setSidebarOpen(true) : undefined} />

        {/* Scrollable content */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 md:p-8">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold uppercase">DAFTAR RUANGAN</h1>
              <div className="flex gap-3">
                <button
                  onClick={() => setEditMode(!editMode)}
                  className={`px-6 py-3 font-bold uppercase border-3 border-black transition-all brutal-shadow hover:shadow-[6px_6px_0_0_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] ${
                    editMode ? "bg-[#facc15] text-black" : "bg-white text-black"
                  }`}
                >
                  {editMode ? "SELESAI" : "EDIT"}
                </button>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <button className="px-6 py-3 bg-[#22c55e] text-white font-bold uppercase border-3 border-black brutal-shadow hover:shadow-[6px_6px_0_0_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all flex items-center gap-2">
                      <Plus className="w-5 h-5" />
                      TAMBAH
                    </button>
                  </DialogTrigger>
                  <DialogContent className="border-3 border-black brutal-shadow-lg bg-white max-w-md">
                    <DialogHeader>
                      <DialogTitle className="font-bold uppercase text-xl">
                        {editingRoom ? "EDIT RUANGAN" : "TAMBAH RUANGAN BARU"}
                      </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <label className="text-sm font-bold uppercase block">NAMA RUANGAN</label>
                          <input
                            placeholder="Nama ruangan"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            className="w-full h-12 px-4 border-3 border-black bg-white font-mono outline-none transition-all focus:shadow-[4px_4px_0_0_#000] focus:translate-x-[-2px] focus:translate-y-[-2px]"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold uppercase block">KAPASITAS</label>
                          <input
                            type="number"
                            placeholder="20"
                            value={formData.capacity}
                            onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                            required
                            min="1"
                            className="w-full h-12 px-4 border-3 border-black bg-white font-mono outline-none transition-all focus:shadow-[4px_4px_0_0_#000] focus:translate-x-[-2px] focus:translate-y-[-2px]"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold uppercase block">DESKRIPSI</label>
                          <textarea
                            placeholder="Deskripsi ruangan"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full h-24 px-4 py-2 border-3 border-black bg-white font-mono outline-none transition-all focus:shadow-[4px_4px_0_0_#000] focus:translate-x-[-2px] focus:translate-y-[-2px] resize-none"
                          />
                        </div>
                      </div>
                      <DialogFooter className="gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddDialogOpen(false);
                            setEditingRoom(null);
                            setFormData({ name: "", description: "", capacity: 10 });
                          }}
                          className="px-6 py-3 bg-white font-bold uppercase border-3 border-black hover:shadow-[4px_4px_0_0_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all"
                        >
                          BATAL
                        </button>
                        <button
                          type="submit"
                          disabled={loading}
                          className="px-6 py-3 bg-[#22c55e] text-white font-bold uppercase border-3 border-black hover:shadow-[4px_4px_0_0_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all disabled:opacity-50"
                        >
                          {loading ? "MEMPROSES..." : "SIMPAN"}
                        </button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Room Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {roomList.map((room) => (
                <div key={room.id} className="bg-white border-3 border-black brutal-shadow overflow-hidden group relative hover:shadow-[6px_6px_0_0_#000] transition-all">
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg uppercase mb-2">{room.name}</h3>
                        <div className="text-sm">
                          <p className="font-bold uppercase text-black/80">KAPASITAS: <span className="text-black font-bold">{room.capacity}</span> ORANG</p>
                        </div>
                      </div>
                      <Package className="w-12 h-12 text-black/60 ml-4 flex-shrink-0" />
                    </div>
                    {editMode && (
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => handleEdit(room)}
                          disabled={loading}
                          className="flex-1 px-4 py-2 bg-[#facc15] text-black font-bold uppercase border-2 border-black hover:shadow-[4px_4px_0_0_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all disabled:opacity-50"
                        >
                          EDIT
                        </button>
                        <button
                          onClick={() => handleDelete(room.id)}
                          disabled={loading}
                          className="flex-1 px-4 py-2 bg-[#FF5E5B] text-white font-bold uppercase border-2 border-black hover:shadow-[4px_4px_0_0_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all disabled:opacity-50"
                        >
                          HAPUS
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {roomList.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🏢</div>
                <h3 className="text-xl font-bold mb-2">Belum Ada Ruangan</h3>
                <p className="text-black/60">Tambahkan ruangan baru untuk memulai</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}