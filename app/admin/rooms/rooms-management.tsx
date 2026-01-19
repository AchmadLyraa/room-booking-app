"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createRoom,
  updateRoom,
  deleteRoom,
} from "@/app/actions/admin-actions";
import { useToastNotifications } from "@/hooks/use-toast-notifications";

type RoomsManagementProps = {
  rooms: any[];
};

export default function RoomsManagementClient({ rooms }: RoomsManagementProps) {
  const router = useRouter();
  const [roomList, setRoomList] = useState<any[]>(rooms?.data ?? []);
  const [showForm, setShowForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    capacity: 10,
  });

  const { showError, showSuccess } = useToastNotifications();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingRoom) {
        const result = await updateRoom(
          editingRoom.id,
          formData.name,
          formData.description,
          formData.capacity,
        );

        if (!result.success) {
  if (result.error === "ROOM_NAME_EXISTS") {
    showError("Nama ruangan sudah ada, jangan tolol ngulang");
  } else {
    showError("Gagal membuat ruangan");
  }
  return;
}

        setRoomList((prev) =>
          prev.map((r) => (r.id === result.data.id ? result.data : r)),
        );

        showSuccess("Room berhasil diupdate");
      } else {
        const result = await createRoom(
          formData.name,
          formData.description,
          formData.capacity,
        );

        if (!result.success) {
  if (result.error === "ROOM_NAME_EXISTS") {
    showError("Nama ruangan sudah ada, jangan tolol ngulang");
  } else {
    showError("Gagal membuat ruangan");
  }
  return;
}

        setRoomList((prev) => [result.data, ...prev]);
        showSuccess("Room berhasil dibuat");
      }

      setFormData({ name: "", description: "", capacity: 10 });
      setEditingRoom(null);
      setShowForm(false);
    } catch (error) {
      showError("Gagal menyimpan room");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (room: any) => {
    setEditingRoom(room);
    setFormData({
      name: room.name,
      description: room.description,
      capacity: room.capacity,
    });
    setShowForm(true);
  };

  const handleDelete = async (roomId: string) => {
    if (!confirm("Are you sure you want to delete this room?")) return;

    setLoading(true);
    try {
      const result = await deleteRoom(roomId);

      if (!result.success) {
        showError("Gagal delete room");
        return;
      }

      setRoomList((prev) => prev.filter((r) => r.id !== roomId));
      showSuccess("Room berhasil dihapus");
    } catch (error) {
      showError("Gagal delete room");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Rooms Management</h1>
        <a
          href="/admin"
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Back to Admin
        </a>
      </div>

      <button
        onClick={() => {
          setEditingRoom(null);
          setFormData({ name: "", description: "", capacity: 10 });
          setShowForm(!showForm);
        }}
        className="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600 mb-8"
      >
        {showForm ? "Cancel" : "Add New Room"}
      </button>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="max-w-md mb-8 p-4 border rounded"
        >
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">
              Room Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full border rounded px-4 py-2"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full border rounded px-4 py-2 h-20"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">
              Capacity *
            </label>
            <input
              type="number"
              required
              min="1"
              value={formData.capacity}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  capacity: Number.parseInt(e.target.value),
                })
              }
              className="w-full border rounded px-4 py-2"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            {loading
              ? "Saving..."
              : editingRoom
                ? "Update Room"
                : "Create Room"}
          </button>
        </form>
      )}

      <div className="grid gap-4">
        {roomList.map((room) => (
          <div key={room.id} className="border rounded p-6 bg-white">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold">{room.name}</h3>
                <p className="text-gray-600">{room.description}</p>
              </div>
              <span className="px-3 py-1 bg-blue-100 rounded text-sm font-semibold">
                Capacity: {room.capacity}
              </span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(room)}
                disabled={loading}
                className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(room.id)}
                disabled={loading}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
