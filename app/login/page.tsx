import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white border-3 border-black brutal-shadow">
        <div className="flex flex-col md:flex-row">
          {/* Left side - Welcome section (green) */}
          <div className="md:w-1/2 bg-[#22c55e] p-8 md:p-12 flex flex-col justify-center items-center text-white md:border-r-3 md:border-black">
            <div className="w-24 h-24 bg-yellow-400 border-3 border-black flex items-center justify-center mb-6">
              <svg viewBox="0 0 24 24" className="w-12 h-12 text-black" fill="currentColor">
                <path d="M13 3L4 14h7l-2 7 9-11h-7l2-7z" />
              </svg>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold uppercase mb-4 text-center">Selamat Datang</h1>
            <p className="text-lg md:text-xl font-semibold text-center mb-6">SISTEM BOOKING RUANGAN</p>
            <p className="text-base md:text-lg text-center">PT PLN NUSANTARA POWER UP KALTIM TELUK</p>
          </div>

          {/* Right side - Login form (white) */}
          <div className="md:w-1/2 p-8 md:p-12">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}
