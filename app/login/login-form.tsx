"use client";

import type React from "react";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!email || !password) {
        setError("Email and password are required");
        return;
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (!result?.ok) {
        // Handle auth errors
        if (result?.error === "CredentialsSignin") {
          setError("Invalid email or password");
        } else if (result?.error === "AccessDenied") {
          setError("Access denied. Please contact administrator");
        } else {
          setError(result?.error || "Login failed. Please try again");
        }
        return;
      }

      // Login berhasil, redirect
      router.push("/");
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage || "An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded shadow p-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Room Booking</h1>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border rounded px-4 py-2"
            placeholder="admin@booking.com"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border rounded px-4 py-2"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <div className="mt-6 p-4 bg-blue-50 rounded text-sm">
        <p className="font-semibold mb-2">Demo Credentials:</p>
        <p>Admin: admin@booking.com / admin123</p>
        <p>PIC: pic1@booking.com / pic123</p>
      </div>
    </div>
  );
}
