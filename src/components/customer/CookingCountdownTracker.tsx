"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Flame,
  ChefHat,
  UtensilsCrossed,
  CheckCircle2,
  Sparkles,
  Timer,
  Clock,
} from "lucide-react";

interface CookingCountdownTrackerProps {
  order: {
    id: number;
    orderNumber: string;
    createdAt: string;
    updatedAt?: string;
    status: string; // 'pending' | 'confirmed' | 'preparing' | 'served' | 'completed' | 'cancelled'
    reservationTime?: string;
    reservationDate?: string;
    items?: Array<{
      id: number;
      quantity: number;
      menu?: { name: string; price: number };
      name?: string;
    }>;
  };
}

export function CookingCountdownTracker({ order }: CookingCountdownTrackerProps) {
  // Prep duration calculation: base 12 mins + 2 mins per dish quantity, capped at 30 mins
  const totalDishesCount = useMemo(() => {
    return order.items?.reduce((sum, it) => sum + (it.quantity || 1), 0) || 2;
  }, [order.items]);

  const estimatedMinutes = useMemo(() => {
    return Math.min(30, Math.max(12, 12 + totalDishesCount * 2));
  }, [totalDishesCount]);

  const estimatedTotalSeconds = estimatedMinutes * 60;

  // Active state remaining seconds
  const [secondsRemaining, setSecondsRemaining] = useState<number>(() => {
    if (order.status === "served" || order.status === "completed") return 0;
    if (order.status === "pending") return estimatedTotalSeconds;

    try {
      const refTime = new Date(order.updatedAt || order.createdAt).getTime();
      const elapsed = Math.floor((Date.now() - refTime) / 1000);
      const remaining = estimatedTotalSeconds - elapsed;
      // If elapsed exceeds estimated while still 'preparing', keep a realistic plating grace buffer of 90s
      return Math.max(90, remaining);
    } catch {
      return estimatedTotalSeconds;
    }
  });

  // Ticking effect when actively cooking
  useEffect(() => {
    if (order.status === "served" || order.status === "completed" || order.status === "cancelled") {
      setSecondsRemaining(0);
      return;
    }
    if (order.status === "pending") {
      setSecondsRemaining(estimatedTotalSeconds);
      return;
    }

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 90) return 90; // Grace buffer during plating until marked served
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [order.status, estimatedTotalSeconds]);

  const elapsedSeconds = estimatedTotalSeconds - secondsRemaining;
  const progressPercent = useMemo(() => {
    if (order.status === "served" || order.status === "completed") return 100;
    if (order.status === "pending") return 15;
    if (order.status === "confirmed") return 30;
    const computed = Math.round((elapsedSeconds / estimatedTotalSeconds) * 100);
    return Math.min(94, Math.max(35, computed));
  }, [order.status, elapsedSeconds, estimatedTotalSeconds]);

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const formattedTime = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  // Stage details matching Savoria luxury tone
  let stageLabel = "Antrean Konfirmasi Dapur";
  let stageDesc = "Pesanan jamuan Anda telah tercatat dan sedang diantrekan ke stasiun dapur chef.";
  let stageColor = "text-amber-800 bg-amber-50 border-amber-200";

  if (order.status === "confirmed") {
    stageLabel = "Mise en Place & Pengecekan Bahan";
    stageDesc = "Chef memeriksa ketersediaan bahan baku segar dan menyiapkan resep hidangan pesanan Anda.";
    stageColor = "text-blue-800 bg-blue-50 border-blue-200";
  } else if (order.status === "preparing") {
    if (progressPercent < 60) {
      stageLabel = "Proses Searing & Pemasakan Utama";
      stageDesc = "Dapur chef sedang memanggang hidangan dengan temperatur presisi untuk cita rasa bintang lima.";
      stageColor = "text-[#EA580C] bg-[#EA580C]/10 border-[#EA580C]/20";
    } else {
      stageLabel = "Sentuhan Akhir Plating & Quality Check";
      stageDesc = "Sentuhan akhir penataan piring (plating gourmet) dan pemeriksaan suhu saji sebelum dihantar.";
      stageColor = "text-purple-800 bg-purple-50 border-purple-200";
    }
  } else if (order.status === "served" || order.status === "completed") {
    stageLabel = "Hidangan Telah Disajikan di Meja";
    stageDesc = "Seluruh hidangan jamuan Anda telah lengkap dihidangkan. Selamat menikmati kelezatan SAVORIA!";
    stageColor = "text-emerald-800 bg-emerald-50 border-emerald-200";
  }

  const isCooking = ["confirmed", "preparing"].includes(order.status);

  return (
    <div className="bg-[#FDFBF7] rounded-3xl border border-amber-200/70 p-4 sm:p-5 shadow-sm space-y-4 relative overflow-hidden">
      {/* Top Banner: Status Header & Countdown Clock */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-200/50">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-[#EA580C] animate-ping" />
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-[#EA580C]">
              Live Kitchen Progress Tracker
            </span>
          </div>
          <h4 className="font-serif font-bold text-sm sm:text-base text-[#18181B] flex items-center gap-1.5">
            <ChefHat className="w-4 h-4 text-[#EA580C]" />
            <span>{stageLabel}</span>
          </h4>
        </div>

        {/* Countdown Badge / Finished Badge */}
        {isCooking ? (
          <div className="bg-white border border-amber-300 rounded-2xl px-3.5 py-1.5 flex items-center gap-2.5 shadow-xs self-start sm:self-auto">
            <Flame className="w-4 h-4 text-[#EA580C] animate-bounce shrink-0" />
            <div>
              <span className="text-[9px] uppercase tracking-wider text-[#64748B] block font-mono">
                Estimasi Siap Saji
              </span>
              <span className="font-mono text-base font-black text-[#EA580C] tracking-wider">
                {formattedTime}
              </span>
            </div>
          </div>
        ) : order.status === "pending" ? (
          <div className="bg-white border border-slate-200 rounded-2xl px-3 py-1.5 flex items-center gap-2 text-xs font-mono text-[#64748B] self-start sm:self-auto">
            <Clock className="w-3.5 h-3.5 text-[#EA580C]" />
            <span>Est. Masak ~{estimatedMinutes} Menit</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold font-mono self-start sm:self-auto">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            <span>Selesai Disajikan</span>
          </div>
        )}
      </div>

      {/* Progress Bar in Savoria Warm Style */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-[11px] font-mono text-[#64748B]">
          <span>Progres Dapur Restoran</span>
          <span className="font-bold text-[#EA580C]">{progressPercent}%</span>
        </div>
        <div className="w-full h-2.5 bg-slate-200/80 rounded-full overflow-hidden p-0.5 border border-slate-200">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-500 via-[#EA580C] to-emerald-600 transition-all duration-700 shadow-xs"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* 4 Visual Steps in Savoria Palette */}
      <div className="grid grid-cols-4 gap-1 text-center pt-1">
        {[
          { key: "received", label: "Pesanan Masuk", icon: CheckCircle2, step: 1 },
          { key: "prep", label: "Peracikan Resep", icon: ChefHat, step: 2 },
          { key: "cook", label: "Searing & Cook", icon: Flame, step: 3 },
          { key: "plating", label: "Plating & Saji", icon: UtensilsCrossed, step: 4 },
        ].map((stg) => {
          let isPassed = false;
          let isCurrent = false;

          if (order.status === "served" || order.status === "completed") {
            isPassed = true;
          } else if (order.status === "preparing") {
            if (stg.step === 1) isPassed = true;
            if (stg.step === 2) isPassed = progressPercent >= 50;
            if (stg.step === 3) isPassed = progressPercent >= 80;
            if (stg.step === 4) isPassed = progressPercent >= 95;

            if (progressPercent < 50 && stg.step === 2) isCurrent = true;
            if (progressPercent >= 50 && progressPercent < 80 && stg.step === 3) isCurrent = true;
            if (progressPercent >= 80 && stg.step === 4) isCurrent = true;
          } else if (order.status === "confirmed") {
            if (stg.step === 1) isPassed = true;
            if (stg.step === 2) isCurrent = true;
          } else {
            if (stg.step === 1) isCurrent = true;
          }

          const IconComponent = stg.icon;

          return (
            <div key={stg.key} className="flex flex-col items-center space-y-1">
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  isPassed
                    ? "bg-emerald-600 text-white shadow-xs"
                    : isCurrent
                    ? "bg-[#EA580C] text-white ring-2 ring-[#EA580C]/30 shadow-xs animate-pulse"
                    : "bg-white text-slate-400 border border-slate-200"
                }`}
              >
                <IconComponent className="w-3.5 h-3.5" />
              </div>
              <span
                className={`text-[9px] sm:text-[10px] leading-tight font-medium ${
                  isCurrent
                    ? "text-[#EA580C] font-bold"
                    : isPassed
                    ? "text-emerald-800 font-semibold"
                    : "text-slate-400"
                }`}
              >
                {stg.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Chef Note Card */}
      <div className="p-3 rounded-2xl bg-white border border-amber-200/80 text-[11px] text-[#64748B] flex items-start gap-2 shadow-2xs leading-relaxed">
        <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
        <p className="flex-1">{stageDesc}</p>
      </div>
    </div>
  );
}
