"use client";

import React, { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Sparkles, Check } from "lucide-react";

interface LuxuryCalendarPickerProps {
  selectedDate: string; // "YYYY-MM-DD"
  onSelectDate: (dateStr: string) => void;
  minDate?: string; // "YYYY-MM-DD"
}

const MONTH_NAMES_ID = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const DAY_NAMES_ID = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

export function LuxuryCalendarPicker({
  selectedDate,
  onSelectDate,
  minDate = new Date().toISOString().slice(0, 10),
}: LuxuryCalendarPickerProps) {
  // Current view date (year & month)
  const [viewDate, setViewDate] = useState<Date>(() => {
    if (selectedDate) {
      const parts = selectedDate.split("-").map(Number);
      return new Date(parts[0], parts[1] - 1, parts[2] || 1);
    }
    return new Date();
  });

  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const viewYear = viewDate.getFullYear();
  const viewMonth = viewDate.getMonth();

  // Can we go back to previous month?
  const canGoPrevMonth = useMemo(() => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    return viewYear > currentYear || (viewYear === currentYear && viewMonth > currentMonth);
  }, [viewYear, viewMonth]);

  const handlePrevMonth = () => {
    if (!canGoPrevMonth) return;
    setViewDate(new Date(viewYear, viewMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewYear, viewMonth + 1, 1));
  };

  // Generate days in month with weekday alignment (Monday = 0 ... Sunday = 6)
  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1);
    const lastDay = new Date(viewYear, viewMonth + 1, 0);
    const totalDays = lastDay.getDate();

    // In JS, Sunday is 0. Convert to Monday = 0, Sunday = 6
    let startingDayOfWeek = firstDay.getDay() - 1;
    if (startingDayOfWeek === -1) startingDayOfWeek = 6;

    const days: Array<{
      dayNumber: number;
      dateStr: string;
      isCurrentMonth: boolean;
      isPast: boolean;
      isToday: boolean;
      isSelected: boolean;
    }> = [];

    // Empty offset cells before day 1
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({
        dayNumber: 0,
        dateStr: "",
        isCurrentMonth: false,
        isPast: true,
        isToday: false,
        isSelected: false,
      });
    }

    // Days of current month
    for (let d = 1; d <= totalDays; d++) {
      const mStr = String(viewMonth + 1).padStart(2, "0");
      const dStr = String(d).padStart(2, "0");
      const dateStr = `${viewYear}-${mStr}-${dStr}`;
      const isPast = dateStr < minDate;
      const isToday = dateStr === todayStr;
      const isSelected = dateStr === selectedDate;

      days.push({
        dayNumber: d,
        dateStr,
        isCurrentMonth: true,
        isPast,
        isToday,
        isSelected,
      });
    }

    return days;
  }, [viewYear, viewMonth, minDate, todayStr, selectedDate]);

  // Quick Date Shortcut Helpers
  const handleQuickSelect = (offsetDays: number) => {
    const target = new Date();
    target.setDate(target.getDate() + offsetDays);
    const mStr = String(target.getMonth() + 1).padStart(2, "0");
    const dStr = String(target.getDate()).padStart(2, "0");
    const dateStr = `${target.getFullYear()}-${mStr}-${dStr}`;
    setViewDate(new Date(target.getFullYear(), target.getMonth(), 1));
    onSelectDate(dateStr);
  };

  const handleSelectWeekend = () => {
    const target = new Date();
    const day = target.getDay(); // 0 is Sun, 6 is Sat
    const diff = day === 6 ? 0 : (6 - day + 7) % 7;
    target.setDate(target.getDate() + (diff === 0 ? 7 : diff));
    const mStr = String(target.getMonth() + 1).padStart(2, "0");
    const dStr = String(target.getDate()).padStart(2, "0");
    const dateStr = `${target.getFullYear()}-${mStr}-${dStr}`;
    setViewDate(new Date(target.getFullYear(), target.getMonth(), 1));
    onSelectDate(dateStr);
  };

  // Formatted date string for banner
  const formattedSelectedDate = useMemo(() => {
    if (!selectedDate) return "";
    const parts = selectedDate.split("-").map(Number);
    if (parts.length < 3) return selectedDate;
    const dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
    const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const dayName = dayNames[dateObj.getDay()];
    return `${dayName}, ${parts[2]} ${MONTH_NAMES_ID[parts[1] - 1]} ${parts[0]}`;
  }, [selectedDate]);

  return (
    <div className="space-y-3.5">
      {/* Quick Select Shortcut Buttons */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        <button
          type="button"
          onClick={() => handleQuickSelect(0)}
          className={`px-3 py-1.5 rounded-full font-bold transition-all cursor-pointer whitespace-nowrap ${
            selectedDate === todayStr
              ? "bg-[#EA580C] text-white shadow-xs"
              : "bg-slate-100 hover:bg-slate-200 text-[#18181B]"
          }`}
        >
          Hari Ini
        </button>

        <button
          type="button"
          onClick={() => handleQuickSelect(1)}
          className="px-3 py-1.5 rounded-full font-semibold bg-slate-100 hover:bg-slate-200 text-[#18181B] transition-all cursor-pointer whitespace-nowrap"
        >
          Besok
        </button>

        <button
          type="button"
          onClick={handleSelectWeekend}
          className="px-3 py-1.5 rounded-full font-semibold bg-slate-100 hover:bg-slate-200 text-[#18181B] transition-all cursor-pointer whitespace-nowrap"
        >
          Akhir Pekan (Sabtu)
        </button>

        <button
          type="button"
          onClick={() => handleQuickSelect(7)}
          className="px-3 py-1.5 rounded-full font-semibold bg-slate-100 hover:bg-slate-200 text-[#18181B] transition-all cursor-pointer whitespace-nowrap"
        >
          Minggu Depan (+7 Hari)
        </button>
      </div>

      {/* Main Luxury Calendar Box */}
      <div className="bg-[#FDFBF7] border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs select-none">
        {/* Month Navigator Header */}
        <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-200/70">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-[#EA580C]" />
            <span className="font-serif font-bold text-sm sm:text-base text-[#18181B]">
              {MONTH_NAMES_ID[viewMonth]} {viewYear}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePrevMonth}
              disabled={!canGoPrevMonth}
              className="p-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed text-[#18181B] transition-all cursor-pointer"
              title="Bulan Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-[#18181B] transition-all cursor-pointer"
              title="Bulan Berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Day Name Columns */}
        <div className="grid grid-cols-7 gap-1 text-center font-mono text-[11px] font-bold text-slate-400 py-1">
          {DAY_NAMES_ID.map((name, i) => (
            <div key={i} className={i >= 5 ? "text-amber-800" : ""}>
              {name}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1 pt-1">
          {calendarDays.map((cell, idx) => {
            if (!cell.isCurrentMonth) {
              return <div key={idx} className="h-9 sm:h-10" />;
            }

            if (cell.isPast) {
              return (
                <div
                  key={idx}
                  title="Tanggal telah lewat (tidak dapat dipesan)"
                  className="h-9 sm:h-10 flex items-center justify-center font-mono text-xs text-stone-300 line-through cursor-not-allowed select-none"
                >
                  {cell.dayNumber}
                </div>
              );
            }

            return (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectDate(cell.dateStr)}
                className={`h-9 sm:h-10 rounded-xl font-mono text-xs transition-all flex flex-col items-center justify-center cursor-pointer relative ${
                  cell.isSelected
                    ? "bg-[#EA580C] text-white font-bold shadow-md shadow-[#EA580C]/35 scale-105 z-10"
                    : cell.isToday
                    ? "bg-amber-50 text-amber-900 border border-amber-300 font-bold hover:bg-amber-100"
                    : "hover:bg-white hover:shadow-xs text-[#18181B] font-semibold"
                }`}
              >
                <span>{cell.dayNumber}</span>
                {cell.isToday && !cell.isSelected && (
                  <span className="w-1 h-1 rounded-full bg-[#EA580C] absolute bottom-1" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Date Confirmation Banner */}
      {selectedDate && (
        <div className="bg-white border border-slate-200/90 rounded-xl p-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px]">
              <Check className="w-3 h-3" />
            </span>
            <div>
              <span className="text-slate-400 block text-[10px] font-mono">TANGGAL TERPILIH:</span>
              <span className="font-serif font-bold text-sm text-[#18181B]">
                {formattedSelectedDate}
              </span>
            </div>
          </div>
          <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md font-semibold">
            {selectedDate === todayStr ? "Hari Ini" : "Sesuai Jadwal"}
          </span>
        </div>
      )}
    </div>
  );
}
