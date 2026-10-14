import Link from "next/link";
import { Sparkles, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0c10] text-slate-100 flex flex-col items-center justify-center p-6 text-center selection:bg-amber-500 selection:text-black">
      <div className="max-w-md w-full bg-[#11141c] border border-amber-500/20 rounded-3xl p-8 space-y-6 shadow-2xl">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto font-serif font-black text-2xl">
          404
        </div>
        <div className="space-y-2">
          <span className="text-[10px] uppercase tracking-widest text-amber-400 font-mono font-bold block">
            L&apos;Étoile Royale
          </span>
          <h2 className="font-serif text-2xl font-bold text-white">Halaman Tidak Ditemukan</h2>
          <p className="text-xs text-slate-400 font-light leading-relaxed">
            Halaman atau salon yang Anda tuju tidak tersedia atau telah dipindahkan.
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all"
        >
          <Home className="w-4 h-4" />
          <span>Kembali ke Beranda Utama</span>
        </Link>
      </div>
    </div>
  );
}
