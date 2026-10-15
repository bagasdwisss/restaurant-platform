"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Modal } from "@/components/ui/Modal";
import {
  Fingerprint,
  KeyRound,
  Users,
  Clock,
  Coffee,
  LogOut,
  CheckCircle2,
  AlertCircle,
  X,
  RotateCw,
  ShieldCheck,
  UserCheck,
} from "lucide-react";

interface StaffAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function StaffAttendanceModal({ isOpen, onClose }: StaffAttendanceModalProps) {
  const [roster, setRoster] = useState<any[]>([]);
  const [records, setRecords] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({ totalRoster: 0, onDutyCount: 0, onBreakCount: 0 });
  const [loading, setLoading] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState<string>("");
  const [pinInput, setPinInput] = useState<string>("");
  const [authMode, setAuthMode] = useState<"pin" | "biometric">("pin");
  const [isScanningBiometric, setIsScanningBiometric] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Load roster & attendance data
  const loadData = useCallback(() => {
    setLoading(true);
    fetch("/api/v1/pos/staff-attendance")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setRoster(data.roster || []);
          setRecords(data.records || []);
          setStats(data.stats || {});
          if (!selectedStaffId && data.roster && data.roster.length > 0) {
            setSelectedStaffId(data.roster[0].id);
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedStaffId]);

  useEffect(() => {
    if (isOpen) {
      loadData();
      setPinInput("");
      setFeedback(null);
    }
  }, [isOpen, loadData]);

  const selectedStaff = roster.find((s) => s.id === selectedStaffId);
  const currentAttendance = records.find(
    (r) => r.staffId === selectedStaffId && r.status !== "clocked_out"
  );

  // Play audio click feedback
  const playClickSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch {}
  };

  const handleKeypadPress = (val: string) => {
    playClickSound();
    if (val === "C") {
      setPinInput("");
      return;
    }
    if (val === "DEL") {
      setPinInput((prev) => prev.slice(0, -1));
      return;
    }
    if (pinInput.length < 6) {
      setPinInput((prev) => prev + val);
    }
  };

  // Submit Clock In
  const handleClockIn = async (method: "pin" | "biometric" = "pin") => {
    if (!selectedStaffId) return;
    if (method === "pin" && !pinInput) {
      setFeedback({ type: "error", message: "Masukkan PIN karyawan Anda terlebih dahulu." });
      return;
    }

    setFeedback(null);
    try {
      const res = await fetch("/api/v1/pos/staff-attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "clock_in",
          staffId: selectedStaffId,
          pin: pinInput,
          method,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({ type: "success", message: data.message });
        setPinInput("");
        loadData();
      } else {
        setFeedback({ type: "error", message: data.message });
      }
    } catch {
      setFeedback({ type: "error", message: "Gagal menghubungkan ke server presensi." });
    }
  };

  // Trigger Biometric Scan Simulation
  const handleBiometricScan = () => {
    setIsScanningBiometric(true);
    setFeedback(null);
    setTimeout(() => {
      setIsScanningBiometric(false);
      handleClockIn("biometric");
    }, 1200);
  };

  // Toggle Break or Clock Out
  const handleAction = async (action: "toggle_break" | "clock_out") => {
    if (!selectedStaffId) return;
    setFeedback(null);
    try {
      const res = await fetch("/api/v1/pos/staff-attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          staffId: selectedStaffId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({ type: "success", message: data.message });
        loadData();
      } else {
        setFeedback({ type: "error", message: data.message });
      }
    } catch {
      setFeedback({ type: "error", message: "Gangguan koneksi presensi." });
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-[#14281D] text-white rounded-3xl border border-white/15 p-5 sm:p-7 max-w-2xl w-full space-y-5 shadow-2xl relative animate-in fade-in zoom-in-95 my-auto max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono font-bold tracking-wider uppercase mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Biometric &amp; PIN Attendance Terminal</span>
            </div>
            <h3 className="font-serif text-2xl font-bold text-white">
              Presensi Staf Restoran SAVORIA
            </h3>
            <p className="text-xs text-slate-300">
              Absensi waktu riil kru dapur, barista, kasir, dan floor captain
            </p>
          </div>

          {/* Quick stats badge */}
          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/30 text-center">
              <p className="text-[10px] font-mono text-emerald-400 font-bold">AKTIF BERTUGAS</p>
              <p className="font-serif font-black text-lg text-white">{stats.onDutyCount || 0} Staf</p>
            </div>
            <div className="px-3 py-1.5 rounded-2xl bg-amber-950/60 border border-amber-500/30 text-center">
              <p className="text-[10px] font-mono text-amber-400 font-bold">ISTIRAHAT</p>
              <p className="font-serif font-black text-lg text-white">{stats.onBreakCount || 0} Staf</p>
            </div>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`p-3 rounded-2xl border text-xs flex items-center gap-2.5 animate-in fade-in duration-200 ${
              feedback.type === "success"
                ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-200"
                : "bg-rose-500/20 border-rose-500/40 text-rose-200"
            }`}
          >
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Content Layout: Left Staff Picker & Status, Right Keypad & Biometric */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left: Staff Selector & Active Status */}
          <div className="space-y-3">
            <label className="text-xs font-mono font-bold text-slate-300 flex items-center justify-between">
              <span>PILIH NAMA KARYAWAN:</span>
              <button
                type="button"
                onClick={loadData}
                className="text-[11px] text-[#FB923C] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCw className="w-3 h-3" />
                <span>Refresh</span>
              </button>
            </label>

            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {roster.map((s) => {
                const isSelected = s.id === selectedStaffId;
                const att = records.find((r) => r.staffId === s.id && r.status !== "clocked_out");
                const isOnDuty = att?.status === "on_duty";
                const isOnBreak = att?.status === "on_break";

                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setSelectedStaffId(s.id);
                      setPinInput("");
                      setFeedback(null);
                    }}
                    className={`w-full p-2.5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#EA580C]/20 border-[#EA580C] text-white shadow-md shadow-[#EA580C]/20"
                        : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={s.avatar}
                        alt={s.name}
                        className="w-8 h-8 rounded-full object-cover border border-white/20 shrink-0"
                      />
                      <div className="min-w-0 truncate">
                        <p className="text-xs font-bold truncate leading-tight">{s.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono truncate">{s.role}</p>
                      </div>
                    </div>

                    <span
                      className={`text-[9px] font-mono uppercase font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        isOnDuty
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : isOnBreak
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          : "bg-slate-700/50 text-slate-400"
                      }`}
                    >
                      {isOnDuty ? "On Duty" : isOnBreak ? "Break" : "Offline"}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Selected Staff Active Shift Card */}
            {selectedStaff && (
              <div className="bg-black/40 rounded-2xl p-3.5 border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-mono">STATUS SHIFT:</span>
                  <span
                    className={`font-mono font-extrabold text-[11px] uppercase ${
                      currentAttendance?.status === "on_duty"
                        ? "text-emerald-400"
                        : currentAttendance?.status === "on_break"
                        ? "text-amber-400"
                        : "text-slate-400"
                    }`}
                  >
                    {currentAttendance?.status === "on_duty"
                      ? "Sedang Bertugas"
                      : currentAttendance?.status === "on_break"
                      ? "Sedang Istirahat"
                      : "Belum Masuk Shift"}
                  </span>
                </div>

                {currentAttendance ? (
                  <div className="space-y-2 pt-1 border-t border-white/10 text-xs">
                    <div className="flex justify-between text-slate-300 text-[11px] font-mono">
                      <span>Jam Masuk:</span>
                      <strong className="text-white">
                        {new Date(currentAttendance.clockInTime).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })} WIB
                      </strong>
                    </div>

                    {/* Action buttons for active staff */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleAction("toggle_break")}
                        className="py-2 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-95"
                      >
                        <Coffee className="w-3.5 h-3.5" />
                        <span>{currentAttendance.status === "on_break" ? "Selesai Break" : "Mulai Break"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAction("clock_out")}
                        className="py-2 px-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-95"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Clock Out</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 pt-1">
                    Silakan gunakan PIN atau pemindai biometrik di sisi kanan untuk memulai shift kerja.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Right: Keypad PIN & Biometric Terminal */}
          <div className="bg-black/40 rounded-2xl p-4 border border-white/10 space-y-3 flex flex-col justify-between">
            {/* Mode Switcher */}
            <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 text-xs">
              <button
                type="button"
                onClick={() => setAuthMode("pin")}
                className={`flex-1 py-1.5 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  authMode === "pin" ? "bg-[#EA580C] text-white shadow-sm" : "text-slate-400 hover:text-white"
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Input PIN Pad</span>
              </button>
              <button
                type="button"
                onClick={() => setAuthMode("biometric")}
                className={`flex-1 py-1.5 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  authMode === "biometric" ? "bg-emerald-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
                }`}
              >
                <Fingerprint className="w-3.5 h-3.5" />
                <span>Sidik Jari Biometrik</span>
              </button>
            </div>

            {authMode === "pin" ? (
              /* PIN KEYPAD */
              <div className="space-y-3">
                {/* Pin Mask Dots Display */}
                <div className="bg-black/60 rounded-xl p-2.5 border border-white/15 text-center">
                  <div className="flex justify-center items-center gap-2.5 h-7">
                    {[0, 1, 2, 3].map((idx) => (
                      <div
                        key={idx}
                        className={`w-3.5 h-3.5 rounded-full transition-all duration-150 ${
                          pinInput.length > idx
                            ? "bg-[#EA580C] ring-4 ring-[#EA580C]/30 scale-110"
                            : "bg-slate-700"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 mt-1 block">
                    (PIN Demo: Chef Antoine = 1234, Kasir = 8888, Barista = 5555)
                  </span>
                </div>

                {/* Touch Keypad Grid */}
                <div className="grid grid-cols-3 gap-2">
                  {["1", "2", "3", "4", "5", "6", "7", "8", "9", "C", "0", "DEL"].map((k) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => handleKeypadPress(k)}
                      className="h-11 rounded-xl bg-white/5 hover:bg-white/15 active:scale-95 text-sm font-mono font-bold text-white border border-white/10 transition-all flex items-center justify-center cursor-pointer"
                    >
                      {k}
                    </button>
                  ))}
                </div>

                {/* Submit Clock-In Button */}
                <button
                  type="button"
                  disabled={pinInput.length === 0}
                  onClick={() => handleClockIn("pin")}
                  className="w-full py-2.5 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-[#EA580C]/25 cursor-pointer active:scale-98 transition-all disabled:opacity-40"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Presensi Masuk (Clock In PIN)</span>
                </button>
              </div>
            ) : (
              /* BIOMETRIC TOUCH SCANNER */
              <div className="py-4 text-center space-y-4">
                <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
                  <button
                    type="button"
                    disabled={isScanningBiometric}
                    onClick={handleBiometricScan}
                    className={`w-24 h-24 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all duration-300 shadow-xl ${
                      isScanningBiometric
                        ? "bg-emerald-500/30 border-emerald-400 text-emerald-300 scale-105 shadow-emerald-500/40"
                        : "bg-white/5 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/20 active:scale-95"
                    }`}
                  >
                    <Fingerprint className={`w-14 h-14 ${isScanningBiometric ? "animate-pulse" : ""}`} />
                  </button>

                  {/* Laser Scan Line Animation */}
                  {isScanningBiometric && (
                    <div className="absolute top-2 left-4 right-4 h-1 bg-emerald-400 shadow-[0_0_12px_#34D399] animate-bounce pointer-events-none rounded-full" />
                  )}
                </div>

                <div className="space-y-1">
                  <h4 className="font-serif font-bold text-sm text-white">
                    {isScanningBiometric ? "Memindai Sidik Jari Karyawan..." : "Ketuk Ikon untuk Pindai Sidik Jari"}
                  </h4>
                  <p className="text-[11px] text-slate-300 max-w-xs mx-auto">
                    Karyawan: <strong className="text-emerald-400">{selectedStaff?.name}</strong>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
