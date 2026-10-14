"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  KeyRound,
  ShieldCheck,
  ShieldAlert,
  Lock,
  User,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  LogIn,
  ChevronRight,
  Copy,
  Check,
  Sparkles,
} from "lucide-react";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect");

  const { loginWithKey, login } = useAuth();

  // Mode: "key" (Premier Unique Key Authentication) or "credential" (Manual Username/Password)
  const [authMode, setAuthMode] = useState<"key" | "credential">("key");

  // Unique Key state
  const [uniqueKeyInput, setUniqueKeyInput] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Credential state
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Feedback states
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

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

  // 1. UNIQUE KEY AUTHENTICATION
  const handleKeyLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uniqueKeyInput.trim()) {
      setErrorMsg("Harap masukkan Unique Key otorisasi Anda.");
      return;
    }

    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    const res = await loginWithKey(uniqueKeyInput.trim());
    setLoading(false);

    if (res.success && res.user) {
      setSuccessMsg(res.message);
      setTimeout(() => {
        navigateBasedOnRole(res.user!.role);
      }, 700);
    } else {
      setErrorMsg(res.message);
    }
  };

  // Helper to prefill unique key
  const handleSelectKeyPreset = (key: string) => {
    setUniqueKeyInput(key);
    setErrorMsg("");
    setSuccessMsg("");
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // 2. MANUAL CREDENTIAL AUTHENTICATION
  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    const res = await login(identifier, password);
    setLoading(false);

    if (res.success && res.user) {
      setSuccessMsg(res.message);
      setTimeout(() => {
        navigateBasedOnRole(res.user!.role);
      }, 600);
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#18181B] flex flex-col justify-between selection:bg-[#EA580C] selection:text-white font-sans">
      {/* Header */}
      <header className="border-b border-[#E2E8F0] px-6 lg:px-12 py-4 bg-white/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-[1280px] mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-full bg-[#EA580C] text-white flex items-center justify-center font-display font-black text-xl shadow-cta group-hover:scale-105 transition-transform">
              S
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-xl font-bold tracking-tight text-[#18181B]">
                  SAVOR<span className="text-[#EA580C]">IA</span>
                </span>
                <span className="text-[10px] bg-[#EA580C]/10 text-[#EA580C] border border-[#EA580C]/20 px-2 py-0.5 rounded-full font-mono uppercase font-semibold">
                  Unique Key Access
                </span>
              </div>
              <p className="text-[11px] text-[#64748B] font-normal uppercase tracking-wider">
                Modern Restaurant Security Gateway
              </p>
            </div>
          </Link>

          <Link
            href="/"
            className="text-xs text-[#64748B] hover:text-[#EA580C] border border-[#E2E8F0] bg-white px-4 py-2 rounded-full transition-all shadow-sm font-semibold"
          >
            ← Kembali ke Beranda
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-3xl mx-auto px-4 py-12 w-full flex-1 flex flex-col justify-center">
        <div className="text-center max-w-lg mx-auto mb-8 space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#EA580C]/10 border border-[#EA580C]/20 text-[#EA580C] text-xs font-semibold">
            <KeyRound className="w-3.5 h-3.5" />
            <span>Role-Based Key Access Control</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#18181B]">
            Portal Otorisasi Restoran
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
            Sistem secara otomatis mengidentifikasi peran Anda berdasarkan tingkat wewenang <strong className="text-[#EA580C] font-semibold">Unique Key</strong>.
          </p>
        </div>

        {/* Tab Selection: Unique Key vs Kredensial */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <button
            type="button"
            onClick={() => {
              setAuthMode("key");
              setErrorMsg("");
              setSuccessMsg("");
            }}
            className={`px-6 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              authMode === "key"
                ? "bg-[#EA580C] text-white shadow-cta"
                : "bg-white text-[#64748B] hover:text-[#18181B] border border-[#E2E8F0]"
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Masuk dengan Unique Key</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthMode("credential");
              setErrorMsg("");
              setSuccessMsg("");
            }}
            className={`px-6 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              authMode === "credential"
                ? "bg-[#EA580C] text-white shadow-cta"
                : "bg-white text-[#64748B] hover:text-[#18181B] border border-[#E2E8F0]"
            }`}
          >
            <User className="w-4 h-4" />
            <span>Username & Password</span>
          </button>
        </div>

        {/* Card Form */}
        <div className="bg-white border border-[#E2E8F0] rounded-card p-6 sm:p-10 shadow-float space-y-6">
          {/* Status Banners */}
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
              <div>
                <span className="font-bold block text-rose-900">Verifikasi Gagal:</span>
                <span className="leading-relaxed">{errorMsg}</span>
              </div>
            </div>
          )}

          {successMsg && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" />
              <div>
                <span className="font-bold block text-emerald-900">Otorisasi Berhasil!</span>
                <span className="leading-relaxed">{successMsg}</span>
              </div>
            </div>
          )}

          {/* MODE 1: UNIQUE KEY AUTHENTICATION */}
          {authMode === "key" && (
            <form onSubmit={handleKeyLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#18181B] uppercase tracking-wider font-mono">
                  Masukkan Unique Security Key
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#EA580C]">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    required
                    value={uniqueKeyInput}
                    onChange={(e) => setUniqueKeyInput(e.target.value)}
                    placeholder="Contoh: ROYALE-ADMIN-SECRET-KEY"
                    className="w-full pl-11 pr-4 py-3.5 bg-[#FDFBF7] border border-[#E2E8F0] rounded-xl text-xs sm:text-sm text-[#18181B] placeholder:text-[#64748B]/50 focus:outline-none focus:border-[#EA580C] transition-colors font-mono tracking-wider font-semibold"
                  />
                </div>
                <p className="text-[11px] text-[#64748B] font-normal leading-relaxed">
                  Kunci unik mengidentifikasi peran Anda secara otomatis: Admin General Manager diarahkan ke Dashboard Manajemen, Kasir diarahkan ke POS Terminal, dan Tamu diarahkan ke VIP Guest Portal.
                </p>
              </div>

              {/* Unique Key Presets for Quick Testing */}
              <div className="p-4 rounded-2xl bg-[#FDFBF7] border border-[#E2E8F0] space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#18181B]">Daftar Unique Key Resmi:</span>
                  <span className="text-[10px] text-[#64748B]">Klik untuk menyalin / mengisi langsung</span>
                </div>

                <div className="space-y-2">
                  {/* Admin Key */}
                  <div
                    onClick={() => handleSelectKeyPreset("ROYALE-ADMIN-SECRET-KEY")}
                    className="p-3 rounded-xl bg-white border border-[#E2E8F0] hover:border-[#14281D] cursor-pointer flex items-center justify-between group transition-all shadow-sm"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#14281D]/15 text-[#14281D] font-bold uppercase">
                        ADMIN
                      </span>
                      <div>
                        <span className="font-mono text-xs text-[#18181B] group-hover:text-[#14281D] font-bold block">
                          ROYALE-ADMIN-SECRET-KEY
                        </span>
                        <span className="text-[10px] text-[#64748B] font-light">
                          General Manager & Executive Chef (Akses Admin)
                        </span>
                      </div>
                    </div>
                    {copiedKey === "ROYALE-ADMIN-SECRET-KEY" ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-stone-400 group-hover:text-[#14281D]" />
                    )}
                  </div>

                  {/* Kasir Key */}
                  <div
                    onClick={() => handleSelectKeyPreset("ROYALE-CASHIER-ACCESS-KEY")}
                    className="p-3 rounded-xl bg-white border border-[#E2E8F0] hover:border-[#EA580C] cursor-pointer flex items-center justify-between group transition-all shadow-sm"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#EA580C]/15 text-[#EA580C] font-bold uppercase">
                        KASIR
                      </span>
                      <div>
                        <span className="font-mono text-xs text-[#18181B] group-hover:text-[#EA580C] font-bold block">
                          ROYALE-CASHIER-ACCESS-KEY
                        </span>
                        <span className="text-[10px] text-[#64748B] font-light">
                          Head Maître D&apos; & Cashier (Terminal POS)
                        </span>
                      </div>
                    </div>
                    {copiedKey === "ROYALE-CASHIER-ACCESS-KEY" ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-stone-400 group-hover:text-[#EA580C]" />
                    )}
                  </div>

                  {/* User VIP Key */}
                  <div
                    onClick={() => handleSelectKeyPreset("ROYALE-VIP-CUSTOMER-KEY")}
                    className="p-3 rounded-xl bg-white border border-[#E2E8F0] hover:border-[#F59E0B] cursor-pointer flex items-center justify-between group transition-all shadow-sm"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#F59E0B]/20 text-[#F59E0B] font-bold uppercase">
                        USER
                      </span>
                      <div>
                        <span className="font-mono text-xs text-[#18181B] group-hover:text-[#F59E0B] font-bold block">
                          ROYALE-VIP-CUSTOMER-KEY
                        </span>
                        <span className="text-[10px] text-[#64748B] font-light">
                          Lord Aditya Pratama (VIP Customer Guest Portal)
                        </span>
                      </div>
                    </div>
                    {copiedKey === "ROYALE-VIP-CUSTOMER-KEY" ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-stone-400 group-hover:text-[#F59E0B]" />
                    )}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold rounded-full text-xs sm:text-sm flex items-center justify-center gap-2 shadow-cta transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <span>Memverifikasi Otorisasi...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verifikasi Unique Key & Masuk</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* MODE 2: MANUAL CREDENTIAL LOGIN */}
          {authMode === "credential" && (
            <form onSubmit={handleManualLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#18181B] mb-1.5">
                  Username atau Email
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
                    placeholder="admin, kasir, atau user@savoria.com"
                    className="w-full pl-10 pr-4 py-3 bg-[#FDFBF7] border border-[#E2E8F0] rounded-xl text-xs text-[#18181B] placeholder:text-stone-400 focus:outline-none focus:border-[#EA580C] transition-colors"
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
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 bg-[#FDFBF7] border border-[#E2E8F0] rounded-xl text-xs text-[#18181B] placeholder:text-stone-400 focus:outline-none focus:border-[#EA580C] transition-colors"
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
                className="w-full py-3.5 bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold rounded-full text-xs flex items-center justify-center gap-2 shadow-cta transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <span>Memproses...</span>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Masuk ke Akun</span>
                  </>
                )}
              </button>

              <div className="pt-3 border-t border-[#E2E8F0] text-center text-xs text-[#64748B]">
                Belum memiliki akun?{" "}
                <Link
                  href="/register"
                  className="font-bold text-[#EA580C] hover:underline"
                >
                  Daftar Akun Baru (User)
                </Link>
              </div>
            </form>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E2E8F0] px-6 py-4 text-center text-xs text-[#64748B] bg-white">
        <p>© 2026 Savoria Modern Restaurant • Unique Key Security System</p>
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center text-[#18181B]">
          <div className="flex items-center gap-3">
            <span className="w-4 h-4 rounded-full border-2 border-[#EA580C] border-t-transparent animate-spin" />
            <span className="text-xs">Memuat portal otorisasi...</span>
          </div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
