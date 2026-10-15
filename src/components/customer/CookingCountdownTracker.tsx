"use client";

import React, { useState, useEffect } from "react";
import {
  Clock,
  Flame,
  ChefHat,
  UtensilsCrossed,
  CheckCircle2,
  Sparkles,
  Timer,
  AlertCircle,
} from "lucide-react";

interface CookingCountdownTrackerProps {
  order: {
    id: number;
    orderNumber: string;
    createdAt: string;
    status: string; // 'pending' | 'confirmed' | 'preparing' | 'served' | 'completed' | 'cancelled'
    items?: Array<{
      id: number;
      quantity: number;
      menu?: { name: string; price: number };
      name?: string;
    }>;
  };
}

export function CookingCountdownTracker({ order }: CookingCountdownTrackerProps) {
  // Total prep time calculation: base 15 mins + 2 mins per item count, max 30 mins
  const totalItemsCount = order.items?.reduce((sum, it) => sum + it.quantity, 0) || 2;
  const estimatedTotalMinutes = Math.min(30, Math.max(12, 12 + totalItemsCount * 2));
  const estimatedTotalSeconds = estimatedTotalMinutes * 60;

  const [secondsRemaining, setSecondsRemaining] = useState<number>(() => {
    try {
      const createdTime = new Date(order.createdAt).getTime();
      const targetTime = createdTime + estimatedTotalSeconds * 1000;
      const diff = Math.floor((targetTime - Date.now()) / 1000);
      return Math.max(0, diff);
    } catch {
      return estimatedTotalSeconds;
    }
  });

  // Tick timer every second if cooking
  useEffect(() => {
    if (order.status === "served" || order.status === "completed" || order.status === "cancelled") {
      setSecondsRemaining(0);
      return;
    }

    const interval = setInterval(() => {
      try {
        const createdTime = new Date(order.createdAt).getTime();
        const targetTime = createdTime + estimatedTotalSeconds * 1000;
        const diff = Math.floor((targetTime - Date.now()) / 1000);
        setSecondsRemaining(Math.max(0, diff));
      } catch {
        setSecondsRemaining((prev) => Math.max(0, prev - 1));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [order.createdAt, order.status, estimatedTotalSeconds]);

  const elapsedSeconds = estimatedTotalSeconds - secondsRemaining;
  const progressPercent =
    order.status === "served" || order.status === "completed"
      ? 100
      : Math.min(95, Math.max(8, Math.round((elapsedSeconds / estimatedTotalSeconds) * 100)));

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const formattedCountdown = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  // Current cooking phase details
  let phaseTitle = "Antrean Pesanan Dapur";
  let phaseDescription = "Pesanan telah dikonfirmasi dan sedang menunggu giliran peracikan oleh tim koki.";
  let badgeColor = "bg-amber-100 text-amber-900 border-amber-200";

  if (order.status === "preparing") {
    if (progressPercent < 45) {
      phaseTitle = "Peracikan Bahan & Prep Station";
      phaseDescription = "Koki sedang menyiapkan potongan daging segar, rempah organik, dan saus fondasi.";
      badgeColor = "bg-orange-100 text-orange-900 border-orange-200";
    } else if (progressPercent < 80) {
      phaseTitle = "Pemasakan Utama & Searing Panas";
      phaseDescription = "Dapur sedang memanggang hidangan dengan temperatur presisi untuk cita rasa bintang lima.";
      badgeColor = "bg-rose-100 text-rose-900 border-rose-200";
    } else {
      phaseTitle = "Plating Mewah & Quality Control";
      phaseDescription = "Sentuhan akhir garnishing, pengecekan suhu hidangan, dan siap dihantar ke meja.";
      badgeColor = "bg-teal-100 text-teal-900 border-teal-200";
    }
  } else if (order.status === "served") {
    phaseTitle = "Hidangan Telah Disajikan di Meja";
    phaseDescription = "Seluruh sajian telah dihidangkan lengkap. Selamat menikmati jamuan istimewa Anda!";
    badgeColor = "bg-emerald-100 text-emerald-900 border-emerald-200";
  } else if (order.status === "completed") {
    phaseTitle = "Jamuan Selesai";
    phaseDescription = "Terima kasih atas kunjungan Anda ke SAVORIA Haute Cuisine.";
    badgeColor = "bg-slate-100 text-slate-800 border-slate-200";
  }

  const isCooking = ["pending", "confirmed", "preparing"].includes(order.status);

  return (
    <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-slate-900 via-stone-900 to-black text-white border border-stone-800 shadow-xl space-y-4 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-[#EA580C]/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header: Status & Live Countdown Clock */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10 border-b border-stone-800/80 pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-[#EA580C] animate-ping" />
            <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 font-bold">
              Live Kitchen Progress Tracker
            </span>
          </div>
          <h3 className="font-serif text-sm sm:text-base font-bold text-white flex items-center gap-1.5">
            <ChefHat className="w-4 h-4 text-[#EA580C]" />
            <span>{phaseTitle}</span>
          </h3>
        </div>

        {/* Big Countdown Badge */}
        {isCooking ? (
          <div className="bg-stone-800/90 border border-stone-700/80 rounded-2xl px-3.5 py-1.5 flex items-center gap-2.5 shadow-inner self-start sm:self-auto">
            <Flame className="w-5 h-5 text-[#EA580C] animate-bounce shrink-0" />
            <div>
              <span className="text-[9px] uppercase tracking-wider text-stone-400 block font-mono">
                Estimasi Siap Saji
              </span>
              <span className="font-mono text-base sm:text-lg font-black text-amber-300 tracking-wider">
                {formattedCountdown}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold font-mono self-start sm:self-auto">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Selesai Disajikan</span>
          </div>
        )}
      </div>

      {/* Live Animated Progress Bar */}
      <div className="space-y-1.5 relative z-10">
        <div className="flex justify-between text-[11px] text-stone-400 font-mono">
          <span>Progres Dapur</span>
          <span className="text-amber-300 font-bold">{progressPercent}%</span>
        </div>
        <div className="w-full h-2.5 bg-stone-800 rounded-full overflow-hidden p-0.5 border border-stone-700">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#EA580C] via-amber-500 to-emerald-400 transition-all duration-700 shadow-sm"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* 4 Interactive Visual Stages */}
      <div className="grid grid-cols-4 gap-1 text-center pt-1 relative z-10">
        {[
          { key: "received", label: "Pesanan Masuk", icon: CheckCircle2, stepNo: 1 },
          { key: "prep", label: "Peracikan Resep", icon: ChefHat, stepNo: 2 },
          { key: "cook", label: "Searing & Cook", icon: Flame, stepNo: 3 },
          { key: "plating", label: "Plating & Saji", icon: UtensilsCrossed, stepNo: 4 },
        ].map((stage) => {
          let isPassed = false;
          let isCurrent = false;

          if (order.status === "served" || order.status === "completed") {
            isPassed = true;
          } else if (order.status === "preparing") {
            if (stage.stepNo === 1) isPassed = true;
            if (stage.stepNo === 2 && progressPercent >= 45) isPassed = true;
            if (stage.stepNo === 3 && progressPercent >= 80) isPassed = true;
            if (stage.stepNo === 4 && progressPercent >= 95) isPassed = true;

            if (progressPercent < 45 && stage.stepNo === 2) isCurrent = true;
            if (progressPercent >= 45 && progressPercent < 80 && stage.stepNo === 3) isCurrent = true;
            if (progressPercent >= 80 && stage.stepNo === 4) isCurrent = true;
          } else {
            if (stage.stepNo === 1) isCurrent = true;
          }

          const StageIcon = stage.icon;

          return (
            <div key={stage.key} className="flex flex-col items-center space-y-1">
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  isPassed
                    ? "bg-emerald-500 text-white shadow-xs"
                    : isCurrent
                    ? "bg-[#EA580C] text-white ring-2 ring-[#EA580C]/50 animate-pulse"
                    : "bg-stone-800 text-stone-500 border border-stone-700"
                }`}
              >
                <StageIcon className="w-3.5 h-3.5" />
              </div>
              <span
                className={`text-[9px] sm:text-[10px] leading-tight font-medium ${
                  isCurrent
                    ? "text-[#EA580C] font-bold"
                    : isPassed
                    ? "text-stone-300 font-semibold"
                    : "text-stone-600"
                }`}
              >
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Chef Note Description Box */}
      <div className="p-2.5 sm:p-3 rounded-xl bg-stone-800/60 border border-stone-700/60 text-[11px] text-stone-300 flex items-start gap-2 relative z-10 leading-relaxed">
        <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
        <p>{phaseDescription}</p>
      </div>
    </div>
  );
}
