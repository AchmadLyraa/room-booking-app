"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

export function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasInput, setHasInput] = useState(false);

  // Track if user has started typing
  useEffect(() => {
    if (email || password) {
      setHasInput(true);
    } else {
      setHasInput(false);
    }
  }, [email, password]);

  // Add hasInput to the container data attribute for CSS targeting
  useEffect(() => {
    const container = document.querySelector('.login-card-container');
    if (container) {
      if (hasInput) {
        container.setAttribute('data-has-input', 'true');
      } else {
        container.setAttribute('data-has-input', 'false');
      }
    }
  }, [hasInput]);

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
      <div className="login-form-wrapper">
        <div className="login-form-container">
          <h1 className="login-heading">MASUK</h1>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-field">
              <label htmlFor="email" className="login-label">EMAIL</label>
              <input
                id="email"
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="login-input"
                required
              />
            </div>

            <div className="login-field">
              <label htmlFor="password" className="login-label">PASSWORD</label>
              <div className="login-password-container">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="login-input login-password-input"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="login-toggle-btn"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="login-submit-btn"
            >
              {loading ? "MEMPROSES..." : "MASUK"}
            </button>

          </form>
          <div className="divider">Coba Akun Demo</div>
           <div className="mt-6 p-4 bg-green-50 rounded text-sm">
          <p>Admin: admin@booking.com / admin123</p>
          <p>PIC: pic1@booking.com / pic123</p>
          <p>PIC: pic2@booking.com / pic123</p>
        </div>

        </div>
      </div>
  )
}