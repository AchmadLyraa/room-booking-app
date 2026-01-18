"use client";

import type React from "react";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Email dan password wajib diisi");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      if (data.error === "USER_NOT_FOUND") {
        setError("User tidak ditemukan");
      } else if (data.error === "WRONG_PASSWORD") {
        setError("Password salah");
      } else {
        setError("Login gagal");
      }
      setLoading(false);
      return;
    }

    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    router.push("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg space-y-5"
      >
        <h1 className="text-3xl font-bold text-center">Login</h1>

        {error && (
          <div className="rounded-md bg-red-100 text-red-700 px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-1">
          <label className="text-sm font-semibold">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="admin@booking.com"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-semibold">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-blue-600 py-2 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
        <div className="mt-6 p-4 bg-blue-50 rounded text-sm">
          <p className="font-semibold mb-2">Demo Credentials:</p>
          <p>Admin: admin@booking.com / admin123</p>
          <p>PIC: pic1@booking.com / pic123</p>
        </div>
      </form>
    </div>
  );
}
