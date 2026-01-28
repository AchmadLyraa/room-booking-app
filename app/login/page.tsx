"use client";

import { LoginForm } from "./login-form";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";

export default function LoginPage() {
  const isMobile = useIsMobile();
  const [showLoginForm, setShowLoginForm] = useState(false);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 login-page-container">
      {/* Mobile-only: Direct login form display */}
      {isMobile ? (
        <div className="mobile-login-form">
          <div className="login-form-wrapper">
            <LoginForm />
          </div>
        </div>
      ) : (
        // Desktop: Keep the original card-based layout
        <div className="login-card-container" data-show-login={showLoginForm}>
          {/* Profile Card (visible initially) */}
          <div className="profile-card">
            <div className="profile-logo">
                <img src="./PLNSPACE_logo.png" alt="logo pln" />
            </div>
            <div className="profile-content">
              <h1 className="text-3xl md:text-4xl font-bold uppercase mb-4 text-center">Selamat Datang DI</h1>
              <p className="text-lg md:text-xl font-semibold text-center mb-6">SISTEM BOOKING RUANGAN</p>
              <p className="text-base md:text-lg text-center">PT PLN NUSANTARA POWER UP KALTIM TELUK</p>
              {isMobile && (
                <button
                  className="mobile-masuk-btn"
                  onClick={() => setShowLoginForm(true)}
                >
                  MASUK
                </button>
              )}
            </div>
          </div>

          {/* Login Form Card (hidden initially) */}
          <div className="login-form-card">
            <div className="login-form-wrapper">
              <LoginForm />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}