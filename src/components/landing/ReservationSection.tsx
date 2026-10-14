"use client";

import React from "react";
import { Users, Calendar, Clock, ArrowRight } from "lucide-react";

interface ReservationSectionProps {
  resGuests: string;
  setResGuests: (val: string) => void;
  resDate: string;
  setResDate: (val: string) => void;
  resTime: string;
  setResTime: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function ReservationSection({
  resGuests,
  setResGuests,
  resDate,
  setResDate,
  resTime,
  setResTime,
  onSubmit,
}: ReservationSectionProps) {
  return (
    <section className="py-12 sm:py-20 bg-[#FDFBF7]">
      <div className="max-w-[1280px] mx-auto px-3.5 sm:px-6 lg:px-12">
        <div className="bg-[#14281D] text-white rounded-2xl sm:rounded-section p-5 sm:p-10 lg:p-14 shadow-2xl relative overflow-hidden">
          {/* Background Accent Circle */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#EA580C]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto text-center space-y-4 mb-8">
            <span className="text-xs font-bold uppercase tracking-widest text-[#F59E0B] font-mono">
              INSTANT RESERVATION
            </span>
            <h2 className="font-display text-3xl sm:text-5xl font-bold text-white">
              Reserve Your Table For Tonight
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 max-w-xl mx-auto font-light">
              Pesan meja favorit Anda lebih awal untuk makan malam romantis, perjamuan keluarga, atau rapat bisnis eksekutif tanpa antrean.
            </p>
          </div>

          {/* 4 Inputs Modern Form Widget */}
          <form
            onSubmit={onSubmit}
            className="relative z-10 max-w-4xl mx-auto bg-white/10 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-white/15 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {/* 1. Guests */}
            <div className="space-y-1 text-left">
              <label className="text-[11px] font-bold uppercase tracking-wider text-stone-300 flex items-center gap-1.5 font-mono">
                <Users className="w-3.5 h-3.5 text-[#F59E0B]" />
                <span>Jumlah Tamu</span>
              </label>
              <select
                value={resGuests}
                onChange={(e) => setResGuests(e.target.value)}
                className="w-full text-xs font-semibold text-white bg-white/10 border border-white/20 rounded-xl px-3.5 py-3 focus:outline-none focus:border-[#EA580C] cursor-pointer"
              >
                <option value="1 Person" className="text-black">1 Person</option>
                <option value="2 People" className="text-black">2 People (Romantic)</option>
                <option value="4 People" className="text-black">4 People (Family Table)</option>
                <option value="6 People" className="text-black">6 People</option>
                <option value="8+ People" className="text-black">8+ People (VIP Chamber)</option>
              </select>
            </div>

            {/* 2. Date */}
            <div className="space-y-1 text-left">
              <label className="text-[11px] font-bold uppercase tracking-wider text-stone-300 flex items-center gap-1.5 font-mono">
                <Calendar className="w-3.5 h-3.5 text-[#F59E0B]" />
                <span>Tanggal</span>
              </label>
              <input
                type="date"
                value={resDate}
                onChange={(e) => setResDate(e.target.value)}
                className="w-full text-xs font-semibold text-white bg-white/10 border border-white/20 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#EA580C]"
              />
            </div>

            {/* 3. Time */}
            <div className="space-y-1 text-left">
              <label className="text-[11px] font-bold uppercase tracking-wider text-stone-300 flex items-center gap-1.5 font-mono">
                <Clock className="w-3.5 h-3.5 text-[#F59E0B]" />
                <span>Waktu Santap</span>
              </label>
              <select
                value={resTime}
                onChange={(e) => setResTime(e.target.value)}
                className="w-full text-xs font-semibold text-white bg-white/10 border border-white/20 rounded-xl px-3.5 py-3 focus:outline-none focus:border-[#EA580C] cursor-pointer"
              >
                <option value="12:00 PM" className="text-black">12:00 PM (Lunch)</option>
                <option value="01:00 PM" className="text-black">01:00 PM (Lunch)</option>
                <option value="06:30 PM" className="text-black">06:30 PM (Dinner)</option>
                <option value="07:30 PM" className="text-black">07:30 PM (Peak Dinner)</option>
                <option value="08:30 PM" className="text-black">08:30 PM (Evening)</option>
              </select>
            </div>

            {/* 4. Action Button */}
            <div className="space-y-1 flex flex-col justify-end">
              <button
                type="submit"
                className="w-full h-[44px] bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold text-xs rounded-xl shadow-cta transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Book a Table Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
