"use client";

import React from "react";
import { Calendar, UtensilsCrossed, MapPin, CreditCard, Receipt } from "lucide-react";

interface ReservationStepsNavProps {
  currentStep: number;
  onSelectStep: (step: number) => void;
  canNavigateTo: (step: number) => boolean;
}

const STEPS = [
  { step: 1, label: "Jadwal & Tamu", icon: Calendar },
  { step: 2, label: "Pilih Menu", icon: UtensilsCrossed },
  { step: 3, label: "Pilih Meja", icon: MapPin },
  { step: 4, label: "Pembayaran", icon: CreditCard },
  { step: 5, label: "Struk & QR Pass", icon: Receipt },
];

export function ReservationStepsNav({
  currentStep,
  onSelectStep,
  canNavigateTo,
}: ReservationStepsNavProps) {
  return (
    <div className="border-b border-[#E2E8F0] bg-white px-3 sm:px-6 py-3 sm:py-4 shadow-sm overflow-x-auto scrollbar-none">
      <div className="max-w-4xl mx-auto flex items-center justify-between min-w-[280px]">
        {STEPS.map((s, idx) => {
          const Icon = s.icon;
          const isActive = currentStep === s.step;
          const isDone = currentStep > s.step;
          const isAccessible = canNavigateTo(s.step);

          return (
            <React.Fragment key={s.step}>
              <button
                type="button"
                onClick={() => isAccessible && onSelectStep(s.step)}
                disabled={!isAccessible}
                className={`flex items-center gap-2 text-xs font-semibold py-1 px-2.5 rounded-full transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#EA580C] text-white shadow-md shadow-[#EA580C]/25"
                    : isDone
                    ? "text-[#EA580C] hover:bg-[#EA580C]/10"
                    : "text-[#64748B] hover:text-[#18181B] opacity-70"
                } ${!isAccessible ? "cursor-not-allowed opacity-50" : ""}`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                    isActive
                      ? "bg-white text-[#EA580C]"
                      : isDone
                      ? "bg-[#EA580C]/20 text-[#EA580C]"
                      : "bg-slate-100 text-[#64748B]"
                  }`}
                >
                  {isDone ? "✓" : s.step}
                </div>
                <span className="hidden md:inline font-sans font-medium">{s.label}</span>
              </button>
              {idx < STEPS.length - 1 && (
                <div
                  className={`h-0.5 flex-1 mx-2 transition-all ${
                    currentStep > s.step ? "bg-[#EA580C]" : "bg-slate-200"
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
