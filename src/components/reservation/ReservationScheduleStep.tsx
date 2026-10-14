"use client";

import React from "react";
import { Calendar, Clock, Users, ArrowRight, ShieldCheck } from "lucide-react";
import { TimeSlotOption } from "./types";

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
  const minDate = new Date().toISOString().slice(0, 10);

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
            Pilih tanggal, sesi jamuan makan malam, dan jumlah orang. Kapasitas denah meja akan otomatis disesuaikan secara presisi dengan jumlah tamu yang Anda tentukan.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Date, Time, Pax */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Date Picker */}
          <div className="bg-white border border-[#E2E8F0] rounded-3xl p-5 sm:p-6 shadow-xs space-y-3">
            <label className="text-xs font-bold text-[#18181B] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#EA580C]" />
              <span>Tanggal Reservasi Jamuan</span>
            </label>
            <input
              type="date"
              min={minDate}
              value={selectedDate}
              onChange={(e) => onChangeDate(e.target.value)}
              className="w-full sm:w-auto p-3 text-xs sm:text-sm font-semibold border border-slate-200 rounded-2xl bg-slate-50/50 focus:ring-2 focus:ring-[#EA580C] focus:outline-none cursor-pointer"
            />
          </div>

          {/* 2. Time Slots */}
          <div className="bg-white border border-[#E2E8F0] rounded-3xl p-5 sm:p-6 shadow-xs space-y-3">
            <label className="text-xs font-bold text-[#18181B] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#EA580C]" />
              <span>Sesi Waktu Bersantap (Dining Session)</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {timeSlots.map((slot) => {
                const isSelected = selectedTimeSlot === slot.label;
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
