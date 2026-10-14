"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  User,
  Mail,
  Phone,
  Lock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  UserPlus,
  ArrowRight,
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    const res = await register({
      name,
      username,
      email,
      phone,
      password,
    });

    setLoading(false);

    if (res.success && res.user) {
      setSuccessMsg(res.message);
      setTimeout(() => {
        router.push("/user");
      }, 700);
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#18181B] flex flex-col justify-between selection:bg-[#EA580C] selection:text-white font-sans">
      {/* Header */}
      <header className="border-b border-[#E2E8F0] px-3 sm:px-6 lg:px-12 py-3.5 sm:py-4 bg-white/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-[1280px] mx-auto flex items-center justify-between gap-2">
          <Link href="/" className="flex items-center gap-2 sm:gap-2.5 group min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#EA580C] text-white flex items-center justify-center font-display font-black text-lg sm:text-xl shadow-cta group-hover:scale-105 transition-transform shrink-0">
              S
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-display text-lg sm:text-xl font-bold tracking-tight text-[#18181B]">
                  SAVOR<span className="text-[#EA580C]">IA</span>
                </span>
                <span className="hidden xs:inline-block text-[10px] bg-[#EA580C]/10 text-[#EA580C] border border-[#EA580C]/20 px-2 py-0.5 rounded-full font-mono uppercase font-semibold">
                  Member
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-[#64748B] font-normal uppercase tracking-wider truncate">
                VIP Patron Registration
              </p>
            </div>
          </Link>

          <Link
            href="/login"
            className="text-xs text-[#64748B] hover:text-[#EA580C] border border-[#E2E8F0] bg-white px-3 sm:px-4 py-2 rounded-full transition-all shadow-sm font-semibold shrink-0"
          >
            <span className="hidden sm:inline">Sudah Punya Akun? Masuk</span>
            <span className="sm:hidden">Masuk</span>
          </Link>
        </div>
      </header>

      {/* Main Card */}
      <main className="max-w-md mx-auto px-3.5 sm:px-4 py-8 sm:py-12 w-full flex-1 flex flex-col justify-center">
        <div className="bg-white border border-[#E2E8F0] rounded-card p-4 sm:p-8 shadow-float space-y-6">
          <div className="text-center space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#EA580C]/10 border border-[#EA580C]/20 text-[#EA580C] text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Akun Pelanggan VIP</span>
            </div>
            <h2 className="font-display text-2xl font-bold text-[#18181B]">Buat Akun Pelanggan</h2>
            <p className="text-xs text-[#64748B]">
              Daftar untuk reservasi kilat, melacak live cooking dapur, dan vault struk digital QR.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg} Mengarahkan ke Portal Pelanggan...</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#18181B] mb-1.5">
                Nama Lengkap
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Aditya Pratama"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#FDFBF7] border border-[#E2E8F0] rounded-xl text-xs text-[#18181B] placeholder:text-stone-400 focus:outline-none focus:border-[#EA580C] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#18181B] mb-1.5">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <span className="text-xs font-bold text-stone-400">@</span>
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ""))}
                  placeholder="aditya_p"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#FDFBF7] border border-[#E2E8F0] rounded-xl text-xs text-[#18181B] placeholder:text-stone-400 focus:outline-none focus:border-[#EA580C] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#18181B] mb-1.5">
                Alamat Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="aditya@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#FDFBF7] border border-[#E2E8F0] rounded-xl text-xs text-[#18181B] placeholder:text-stone-400 focus:outline-none focus:border-[#EA580C] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#18181B] mb-1.5">
                Nomor WhatsApp / HP (Opsional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+62 812-3456-7890"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#FDFBF7] border border-[#E2E8F0] rounded-xl text-xs text-[#18181B] placeholder:text-stone-400 focus:outline-none focus:border-[#EA580C] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#18181B] mb-1.5">
                Kata Sandi (Password)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full pl-10 pr-10 py-2.5 bg-[#FDFBF7] border border-[#E2E8F0] rounded-xl text-xs text-[#18181B] placeholder:text-stone-400 focus:outline-none focus:border-[#EA580C] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold rounded-full text-xs sm:text-sm flex items-center justify-center gap-2 shadow-cta transition-all cursor-pointer disabled:opacity-50 mt-2"
            >
              {loading ? (
                <span>Membuat Akun...</span>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Daftar Akun Baru</span>
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-[#E2E8F0] text-center text-xs text-[#64748B]">
            Sudah memiliki Unique Key atau akun?{" "}
            <Link href="/login" className="font-bold text-[#EA580C] hover:underline">
              Masuk di Sini
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E2E8F0] px-6 py-4 text-center text-xs text-[#64748B] bg-white">
        <p>© 2026 Savoria Modern Restaurant • Member Gateway</p>
      </footer>
    </div>
  );
}
