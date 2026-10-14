"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  LogIn,
  Sparkles,
  Info,
  CheckCircle2,
} from "lucide-react";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect");
  const errorParam = searchParams.get("error");

  const { login } = useAuth();
  const { toast } = useToast();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (errorParam === "admin_role_required") {
      setErrorMsg("Akses Ditolak: Halaman Manajemen hanya dapat diakses oleh akun dengan wewenang Administrator.");
      toast.error("Wewenang akun Anda bukan Administrator.", "Akses Terbatas");
    } else if (errorParam === "pos_role_required") {
      setErrorMsg("Akses Ditolak: Terminal POS hanya dapat diakses oleh Staff Kasir atau Administrator.");
      toast.error("Wewenang akun Anda bukan Kasir.", "Akses Terbatas");
    } else if (errorParam === "session_required") {
      setErrorMsg("Sesi Anda belum aktif atau telah berakhir. Harap masuk terlebih dahulu.");
    }
  }, [errorParam, toast]);

  const navigateBasedOnRole = (role: string) => {
    if (redirectUrl) {
      router.push(redirectUrl);
      return;
    }
    if (role === "admin") {
      router.push("/admin");
    } else if (role === "kasir") {
      router.push("/pos");
    } else {
      router.push("/user");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setErrorMsg("Harap masukkan Username/Email dan Password Anda.");
      toast.warning("Harap lengkapi semua kolom login.", "Data Belum Lengkap");
      return;
    }

    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    const res = await login(identifier.trim(), password);
    setLoading(false);

    if (res.success && res.user) {
      const roleDisplay =
        res.user.role === "admin"
          ? "Administrator"
          : res.user.role === "kasir"
          ? "Staff Kasir"
          : "Pelanggan VIP";

      setSuccessMsg(`Selamat datang, ${res.user.name}! Terotorisasi sebagai ${roleDisplay}.`);
      toast.success(
        `Otorisasi berhasil sebagai ${roleDisplay}. Mengarahkan ke portal...`,
        "Masuk Berhasil"
      );

      setTimeout(() => {
        navigateBasedOnRole(res.user!.role);
      }, 700);
    } else {
      setErrorMsg(res.message);
      toast.error(res.message, "Gagal Masuk");
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
                <span className="hidden xs:inline-block text-[10px] bg-[#14281D]/10 text-[#14281D] border border-[#14281D]/20 px-2 py-0.5 rounded-full font-mono uppercase font-semibold">
                  Secure Portal
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-[#64748B] font-normal uppercase tracking-wider truncate">
                Role-Based Access Control
              </p>
            </div>
          </Link>

          <Link
            href="/"
            className="text-xs text-[#64748B] hover:text-[#EA580C] border border-[#E2E8F0] bg-white px-3 sm:px-4 py-2 rounded-full transition-all shadow-sm font-semibold shrink-0"
          >
            <span className="hidden sm:inline">← Kembali ke Beranda</span>
            <span className="sm:hidden">← Beranda</span>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-xl mx-auto px-3.5 sm:px-4 py-8 sm:py-12 w-full flex-1 flex flex-col justify-center">
        <div className="text-center max-w-lg mx-auto mb-6 sm:mb-8 space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-1 rounded-full bg-[#EA580C]/10 border border-[#EA580C]/20 text-[#EA580C] text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Otorisasi Berbasis Peran</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#18181B]">
            Masuk ke Portal SAVORIA
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
            Sistem secara otomatis mengarahkan akses Anda sesuai wewenang peran:{" "}
            <span className="font-semibold text-[#18181B]">Administrator</span>,{" "}
            <span className="font-semibold text-[#18181B]">Staff Kasir</span>, atau{" "}
            <span className="font-semibold text-[#18181B]">Pelanggan VIP</span>.
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-white border border-[#E2E8F0] rounded-card p-5 sm:p-9 shadow-float space-y-6">
          {/* Status Banners */}
          {errorMsg && (
            <div className="p-3.5 sm:p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 sm:gap-3">
              <ShieldAlert className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
              <div>
                <span className="font-bold block text-rose-900">Perhatian:</span>
                <span className="leading-relaxed">{errorMsg}</span>
              </div>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5 sm:gap-3">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" />
              <div>
                <span className="font-bold block text-emerald-900">Otorisasi Berhasil!</span>
                <span className="leading-relaxed">{successMsg}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#18181B] mb-1.5 uppercase font-mono tracking-wider">
                Username atau Alamat Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="admin@savoria.com / kasir1 / username"
                  className="w-full pl-10 pr-4 py-3 bg-[#FDFBF7] border border-[#E2E8F0] rounded-xl text-xs sm:text-sm text-[#18181B] placeholder:text-stone-400 focus:outline-none focus:border-[#EA580C] transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-[#18181B] uppercase font-mono tracking-wider">
                  Kata Sandi (Password)
                </label>
                <span className="text-[11px] text-[#64748B]">Tersandi Kuat</span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi akun Anda"
                  className="w-full pl-10 pr-10 py-3 bg-[#FDFBF7] border border-[#E2E8F0] rounded-xl text-xs sm:text-sm text-[#18181B] placeholder:text-stone-400 focus:outline-none focus:border-[#EA580C] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-600 cursor-pointer"
                  title={showPassword ? "Sembunyikan" : "Tampilkan"}
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
                <span>Memverifikasi Otorisasi Akun...</span>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Masuk & Buka Portal Otorisasi</span>
                </>
              )}
            </button>
          </form>

          {/* Role Access Guide */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-[#FDFBF7] border border-[#E2E8F0] space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#18181B]">
              <Info className="w-3.5 h-3.5 text-[#EA580C]" />
              <span>Tingkat Otorisasi Peran Sistem:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
              <div className="p-2.5 rounded-xl bg-white border border-[#E2E8F0]">
                <div className="font-bold text-[#14281D] font-mono">ADMIN</div>
                <div className="text-[#64748B] text-[10px] mt-0.5">
                  Dashboard manajemen, menu, staf, meja & laporan penjualan.
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-[#E2E8F0]">
                <div className="font-bold text-[#EA580C] font-mono">KASIR</div>
                <div className="text-[#64748B] text-[10px] mt-0.5">
                  Terminal POS kasir, pembayaran tunai/QRIS & status pesanan.
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-[#E2E8F0]">
                <div className="font-bold text-stone-700 font-mono">PEMBELI</div>
                <div className="text-[#64748B] text-[10px] mt-0.5">
                  Reservasi meja, riwayat pesanan, dan struk digital QR.
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#64748B]">
            <div>
              Belum memiliki akun Pelanggan?{" "}
              <Link href="/register" className="font-bold text-[#EA580C] hover:underline">
                Daftar VIP Patron
              </Link>
            </div>
            <Link href="/reservation" className="text-stone-500 hover:text-[#EA580C] underline">
              Lihat Denah Reservasi Meja
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E2E8F0] px-6 py-4 text-center text-xs text-[#64748B] bg-white">
        <p>© 2026 SAVORIA Haute Gastronomie • Sistem Otorisasi Terenkripsi</p>
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center text-xs text-[#64748B]">
          Memuat Portal SAVORIA...
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
