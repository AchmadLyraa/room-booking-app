"use client";

import { useState, useEffect } from "react";
import { Plus, Package } from "lucide-react";
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
  createFood,
  deleteFood,
  createSnack,
  deleteSnack,
  getAllFoods,
  getAllSnacks
} from "@/app/actions/admin-actions";

type FoodsSnacksManagementProps = {
  foods: { success: boolean; data?: any[]; error?: string };
  snacks: { success: boolean; data?: any[]; error?: string };
};

export default function FoodsSnacksManagementClient({
  foods: initialFoods,
  snacks: initialSnacks
}: FoodsSnacksManagementProps) {
  const { showError, showSuccess } = useToastNotifications();
  const [foodList, setFoodList] = useState<any[]>(initialFoods?.success && initialFoods.data ? initialFoods.data : []);
  const [snackList, setSnackList] = useState<any[]>(initialSnacks?.success && initialSnacks.data ? initialSnacks.data : []);
  const [editMode, setEditMode] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "makanan",
  });
  const [editingItem, setEditingItem] = useState<any>(null);
  const isMobile = useIsMobile();

  // Refresh data when edit mode changes
  useEffect(() => {
    const refreshData = async () => {
      const foodsResult = await getAllFoods();
      const snacksResult = await getAllSnacks();

      if (foodsResult.success && foodsResult.data) {
        setFoodList(foodsResult.data);
      }
      if (snacksResult.success && snacksResult.data) {
        setSnackList(snacksResult.data);
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
      // Create new item
      let result;
      if (formData.type === "makanan") {
        result = await createFood(formData.name);
      } else {
        result = await createSnack(formData.name);
      }

      if (!result.success) {
        showError(result.error || "Gagal membuat item");
        return;
      }

      if (formData.type === "makanan") {
        setFoodList((prev) => [result.data, ...prev]);
      } else {
        setSnackList((prev) => [result.data, ...prev]);
      }
      showSuccess(`${formData.type === "makanan" ? "Makanan" : "Snack"} berhasil dibuat`);

      // Reset form and close dialog
      setFormData({ name: "", type: "makanan" });
      setIsAddDialogOpen(false);
    } catch (error) {
      showError("Gagal menyimpan item");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (itemId: string, type: "makanan" | "snack") => {
    if (!confirm(`Apakah Anda yakin ingin menghapus ${type === "makanan" ? "makanan" : "snack"} ini?`)) return;

    setLoading(true);
    try {
      let result;
      if (type === "makanan") {
        result = await deleteFood(itemId);
      } else {
        result = await deleteSnack(itemId);
      }

      if (!result.success) {
        showError(result.error || "Gagal menghapus item");
        return;
      }

      if (type === "makanan") {
        setFoodList((prev) => prev.filter((f) => f.id !== itemId));
      } else {
        setSnackList((prev) => prev.filter((s) => s.id !== itemId));
      }
      showSuccess(`${type === "makanan" ? "Makanan" : "Snack"} berhasil dihapus`);
    } catch (error) {
      showError("Gagal menghapus item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar - Sticky position */}
      <div className="hidden md:block md:w-64">
        <div className="sticky top-0 h-screen">
          <Sidebar currentView="foods-snacks" />
        </div>
      </div>

      {/* Mobile Sidebar Sheet */}
      {isMobile && (
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="p-0 w-64">
            <Sidebar currentView="foods-snacks" />
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
              <h1 className="text-2xl font-bold uppercase">MAKANAN & SNACK</h1>
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
                        {editingItem ? "EDIT MENU" : "TAMBAH MENU BARU"}
                      </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <label className="text-sm font-bold uppercase block">NAMA MENU</label>
                          <input
                            placeholder="Nama menu"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            className="w-full h-12 px-4 border-3 border-black bg-white font-mono outline-none transition-all focus:shadow-[4px_4px_0_0_#000] focus:translate-x-[-2px] focus:translate-y-[-2px]"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold uppercase block">TIPE</label>
                          <select
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value as "makanan" | "snack" })}
                            required
                            className="w-full h-12 px-4 border-3 border-black bg-white font-mono outline-none cursor-pointer focus:shadow-[4px_4px_0_0_#000] focus:translate-x-[-2px] focus:translate-y-[-2px]"
                          >
                            <option value="makanan">Makanan</option>
                            <option value="snack">Snack</option>
                          </select>
                        </div>
                      </div>
                      <DialogFooter className="gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddDialogOpen(false);
                            setEditingItem(null);
                            setFormData({ name: "", type: "makanan" });
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

            {/* Food Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Foods Section */}
              <div className="col-span-1">

                <div className="grid grid-cols-1 gap-4">
                  {foodList.map((food) => (
                    <div key={food.id} className="bg-white border-3 border-black brutal-shadow p-6 flex items-center justify-between hover:shadow-[6px_6px_0_0_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all cursor-pointer group">
                      <div>
                        <h3 className="text-xl font-bold leading-tight uppercase">{food.name}</h3>
                        <span className="text-xs font-bold uppercase px-2 py-1 border-2 border-black inline-block mt-2 bg-[#22c55e] text-white">
                          MAKANAN
                        </span>
                      </div>
                      <Package className="w-12 h-12 text-black" />
                      {editMode && (
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => handleDelete(food.id, "makanan")}
                            disabled={loading}
                            className="px-4 py-2 bg-[#FF5E5B] text-white font-bold uppercase border-2 border-black hover:shadow-[4px_4px_0_0_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all disabled:opacity-50"
                          >
                            HAPUS
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Snacks Section */}
              <div className="col-span-1">
                <div className="grid grid-cols-1 gap-4">
                  {snackList.map((snack) => (
                    <div key={snack.id} className="bg-white border-3 border-black brutal-shadow p-6 flex items-center justify-between hover:shadow-[6px_6px_0_0_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all cursor-pointer group">
                      <div>
                        <h3 className="text-xl font-bold leading-tight uppercase">{snack.name}</h3>
                        <span className="text-xs font-bold uppercase px-2 py-1 border-2 border-black inline-block mt-2 bg-[#facc15] text-black">
                          SNACK
                        </span>
                      </div>
                      <Package className="w-12 h-12 text-black" />
                      {editMode && (
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => handleDelete(snack.id, "snack")}
                            disabled={loading}
                            className="px-4 py-2 bg-[#FF5E5B] text-white font-bold uppercase border-2 border-black hover:shadow-[4px_4px_0_0_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all disabled:opacity-50"
                          >
                            HAPUS
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {(foodList.length === 0 || snackList.length === 0) && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🍽️</div>
                <h3 className="text-xl font-bold mb-2">Belum Ada Menu</h3>
                <p className="text-black/60">Tambahkan menu baru untuk memulai</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}