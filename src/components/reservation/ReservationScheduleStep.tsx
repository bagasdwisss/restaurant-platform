"use client";

import React, { useMemo, useEffect } from "react";
import { Calendar, Clock, Users, ArrowRight, ShieldCheck, AlertCircle } from "lucide-react";
import { TimeSlotOption } from "./types";
import { LuxuryCalendarPicker } from "./LuxuryCalendarPicker";

interface ReservationScheduleStepProps {
  selectedDate: string;
  onChangeDate: (date: string) => void;
  selectedTimeSlot: string;
  onChangeTimeSlot: (slot: string) => void;
  timeSlots: TimeSlotOption[];
  guestCount: number;
  onChangeGuestCount: (count: number) => void;
  specialRequests: string;
  onChangeSpecialRequests: (req: string) => void;
  customerName: string;
  onChangeCustomerName: (name: string) => void;
  customerPhone: string;
  onChangeCustomerPhone: (phone: string) => void;
  onNext: () => void;
}

/**
 * Helper to parse time string like "12:00 PM - Luncheon Soirée" or "07:30 PM" into minutes from midnight (0 - 1439).
 */
function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const match12 = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (match12) {
    let hours = parseInt(match12[1], 10);
    const minutes = parseInt(match12[2], 10);
    const meridiem = match12[3].toUpperCase();
    if (meridiem === "PM" && hours < 12) hours += 12;
    if (meridiem === "AM" && hours === 12) hours = 0;
    return hours * 60 + minutes;
  }

  const match24 = timeStr.match(/(\d{1,2}):(\d{2})/);
  if (match24) {
    const hours = parseInt(match24[1], 10);
    const minutes = parseInt(match24[2], 10);
    return hours * 60 + minutes;
  }

  return 0;
}

export function ReservationScheduleStep({
  selectedDate,
  onChangeDate,
  selectedTimeSlot,
  onChangeTimeSlot,
  timeSlots,
  guestCount,
  onChangeGuestCount,
  specialRequests,
  onChangeSpecialRequests,
  customerName,
  onChangeCustomerName,
  customerPhone,
  onChangeCustomerPhone,
  onNext,
}: ReservationScheduleStepProps) {
  const minDate = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const todayStr = minDate;
  const isSelectedDateToday = selectedDate === todayStr;

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // If selected date is today, evaluate which slots have passed
  const availableUpcomingSlots = useMemo(() => {
    return timeSlots.map((slot) => {
      const slotMinutes = parseTimeToMinutes(slot.label);
      const isPassed = isSelectedDateToday && slotMinutes <= currentMinutes;
      return {
        ...slot,
        isPassed,
        slotMinutes,
      };
    });
  }, [timeSlots, isSelectedDateToday, currentMinutes]);

  // If today is chosen and the currently selected slot has already passed, auto-select first upcoming available slot
  useEffect(() => {
    if (isSelectedDateToday) {
      const currentSlotMinutes = parseTimeToMinutes(selectedTimeSlot);
      if (currentSlotMinutes <= currentMinutes) {
        const firstAvailable = availableUpcomingSlots.find((s) => !s.isPassed);
        if (firstAvailable) {
          onChangeTimeSlot(firstAvailable.label);
        }
      }
    }
  }, [isSelectedDateToday, currentMinutes, selectedTimeSlot, availableUpcomingSlots, onChangeTimeSlot]);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      {/* Step Banner */}
      <div className="bg-white border border-[#E2E8F0] rounded-3xl p-5 sm:p-7 shadow-xs">
        <div className="max-w-2xl">
          <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-[#EA580C] bg-[#EA580C]/10 px-2.5 py-0.5 rounded-full inline-block mb-2">
            Langkah 1 dari 5
          </span>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#18181B]">
            Pilih Waktu Kedatangan & Jumlah Tamu
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1 leading-relaxed">
            Pilih tanggal melalui kalender eksklusif, sesi jamuan makan, dan jumlah orang. Kapasitas denah meja akan otomatis disesuaikan secara presisi dengan jumlah tamu yang Anda tentukan.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Date, Time, Pax */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Custom Luxury Calendar Picker */}
          <div className="bg-white border border-[#E2E8F0] rounded-3xl p-5 sm:p-6 shadow-xs space-y-3">
            <label className="text-xs font-bold text-[#18181B] flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#EA580C]" />
                <span>Pilih Tanggal Reservasi Jamuan</span>
              </span>
              <span className="text-[10px] font-mono font-bold text-slate-400">
                (Tidak dapat memilih tanggal lampau)
              </span>
            </label>

            <LuxuryCalendarPicker
              selectedDate={selectedDate}
              onSelectDate={onChangeDate}
              minDate={minDate}
            />
          </div>

          {/* 2. Time Slots with Pass-Time Protection */}
          <div className="bg-white border border-[#E2E8F0] rounded-3xl p-5 sm:p-6 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#18181B] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#EA580C]" />
                <span>Sesi Waktu Bersantap (Dining Session)</span>
              </label>
              {isSelectedDateToday && (
                <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                  Slot Waktu Nyata (Live Filter)
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {availableUpcomingSlots.map((slot) => {
                const isSelected = selectedTimeSlot === slot.label;
                const isPassed = slot.isPassed;

                if (isPassed) {
                  return (
                    <div
                      key={slot.label}
                      title="Sesi ini telah berlalu untuk hari ini dan tidak dapat dipesan lagi."
                      className="p-3.5 rounded-2xl border border-slate-200/60 bg-slate-50/70 text-slate-400 opacity-60 cursor-not-allowed select-none"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-xs font-bold line-through truncate">{slot.label}</p>
                        <span className="text-[9px] font-mono font-bold bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-md shrink-0">
                          Sesi Berakhir
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Jam telah lewat pada hari ini
                      </p>
                    </div>
                  );
                }

                return (
                  <button
                    key={slot.label}
                    type="button"
                    onClick={() => onChangeTimeSlot(slot.label)}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#EA580C]/10 border-[#EA580C] text-[#EA580C] shadow-xs ring-1 ring-[#EA580C]"
                        : "bg-white border-slate-200/80 hover:border-slate-300 text-[#18181B]"
                    }`}
                  >
                    <p className="text-xs font-bold truncate">{slot.label}</p>
                    <p className="text-[10px] text-[#64748B] mt-0.5">{slot.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Guest Count Selector */}
          <div className="bg-white border border-[#E2E8F0] rounded-3xl p-5 sm:p-6 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#18181B] flex items-center gap-2">
                <Users className="w-4 h-4 text-[#EA580C]" />
                <span>Jumlah Tamu (Guests)</span>
              </label>
              <span className="text-xs font-mono font-bold text-[#EA580C] bg-[#EA580C]/10 px-2.5 py-0.5 rounded-full">
                {guestCount} Orang
              </span>
            </div>
            <p className="text-[11px] text-[#64748B]">
              *Aturan sistem: Meja berkapasitas 2 orang hanya untuk 1-2 tamu. Tamu 3-4 orang untuk meja kapasitas 4. Tamu 5-6 orang untuk meja kapasitas 6.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {[1, 2, 3, 4, 5, 6, 8, 10].map((num) => {
                const isSelected = guestCount === num;
                return (
                  <button
                    key={num}
                    type="button"
                    onClick={() => onChangeGuestCount(num)}
                    className={`w-11 h-11 rounded-2xl font-mono text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                      isSelected
                        ? "bg-[#EA580C] text-white shadow-md shadow-[#EA580C]/30 scale-105"
                        : "bg-slate-100 hover:bg-slate-200 text-[#18181B]"
                    }`}
                  >
                    {num}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Col: Contact & Special Requests */}
        <div className="space-y-6">
          <div className="bg-white border border-[#E2E8F0] rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-[#18181B] uppercase tracking-wider font-mono">
              Identitas Pemesan
            </h3>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#18181B]">
                Nama Tamu Utama <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Nama Lengkap"
                value={customerName}
                onChange={(e) => onChangeCustomerName(e.target.value)}
                className="w-full text-xs p-3 bg-slate-50/50 border border-slate-200/80 rounded-2xl focus:ring-2 focus:ring-[#EA580C] focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#18181B]">
                Nomor Telepon / WhatsApp <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                placeholder="0812xxxxxxxx"
                value={customerPhone}
                onChange={(e) => onChangeCustomerPhone(e.target.value)}
                className="w-full text-xs p-3 bg-slate-50/50 border border-slate-200/80 rounded-2xl focus:ring-2 focus:ring-[#EA580C] focus:outline-none"
              />
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-medium text-[#18181B]">
                Permintaan Khusus (Opsional)
              </label>
              <textarea
                rows={3}
                placeholder="Contoh: Meja dekat jendela, dekorasi ulang tahun, candle light setup..."
                value={specialRequests}
                onChange={(e) => onChangeSpecialRequests(e.target.value)}
                className="w-full text-xs p-3 bg-slate-50/50 border border-slate-200/80 rounded-2xl focus:ring-2 focus:ring-[#EA580C] focus:outline-none"
              />
            </div>

            <button
              type="button"
              onClick={onNext}
              className="w-full py-3.5 px-4 bg-[#EA580C] hover:bg-[#C2410C] text-white rounded-full text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-[#EA580C]/25 transition-all cursor-pointer"
            >
              <span>Lanjut ke Pilih Menu</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-[#14281D]/5 border border-[#14281D]/15 rounded-3xl p-4 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-[#14281D] shrink-0 mt-0.5" />
            <p className="text-[11px] text-[#14281D] leading-relaxed">
              <strong>Jaminan Meja VIP:</strong> Konfirmasi reservasi langsung terhubung ke sistem kasir POS dan koki dapur Savoria secara otomatis.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
