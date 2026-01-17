"use client";

import type React from "react";

import { useState } from "react";
import {
  createFood,
  deleteFood,
  createSnack,
  deleteSnack,
} from "@/app/actions/admin-actions";

type FoodsSnacksManagementProps = {
  foods: any[];
  snacks: any[];
};

export default function FoodsSnacksManagementClient({
  foods,
  snacks,
}: FoodsSnacksManagementProps) {
  const [foodList, setFoodList] = useState(foods);
  const [snackList, setSnackList] = useState(snacks);
  const [loading, setLoading] = useState(false);
  const [newFoodName, setNewFoodName] = useState("");
  const [newSnackName, setNewSnackName] = useState("");

  const handleCreateFood = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFoodName.trim()) return;

    setLoading(true);
    try {
      const food = await createFood(newFoodName);
      setFoodList((prev) => [food, ...prev]);
      setNewFoodName("");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFood = async (foodId: string) => {
    if (!confirm("Delete this food?")) return;

    setLoading(true);
    try {
      await deleteFood(foodId);
      setFoodList((prev) => prev.filter((f) => f.id !== foodId));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSnack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSnackName.trim()) return;

    setLoading(true);
    try {
      const snack = await createSnack(newSnackName);
      setSnackList((prev) => [snack, ...prev]);
      setNewSnackName("");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSnack = async (snackId: string) => {
    if (!confirm("Delete this snack?")) return;

    setLoading(true);
    try {
      await deleteSnack(snackId);
      setSnackList((prev) => prev.filter((s) => s.id !== snackId));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Foods & Snacks Management</h1>
        <a
          href="/admin"
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Back to Admin
        </a>
      </div>

      <div className="grid grid-cols-2 gap-8">
        {/* Foods Section */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Foods</h2>

          <form onSubmit={handleCreateFood} className="mb-6">
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newFoodName}
                onChange={(e) => setNewFoodName(e.target.value)}
                placeholder="Food name..."
                className="flex-1 border rounded px-4 py-2"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                Add
              </button>
            </div>
          </form>

          <div className="space-y-2">
            {foodList.map((food) => (
              <div
                key={food.id}
                className="flex justify-between items-center p-3 border rounded"
              >
                <span>{food.name}</span>
                <button
                  onClick={() => handleDeleteFood(food.id)}
                  disabled={loading}
                  className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Snacks Section */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Snacks</h2>

          <form onSubmit={handleCreateSnack} className="mb-6">
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newSnackName}
                onChange={(e) => setNewSnackName(e.target.value)}
                placeholder="Snack name..."
                className="flex-1 border rounded px-4 py-2"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                Add
              </button>
            </div>
          </form>

          <div className="space-y-2">
            {snackList.map((snack) => (
              <div
                key={snack.id}
                className="flex justify-between items-center p-3 border rounded"
              >
                <span>{snack.name}</span>
                <button
                  onClick={() => handleDeleteSnack(snack.id)}
                  disabled={loading}
                  className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
