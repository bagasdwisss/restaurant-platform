"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Modal } from "@/components/ui/Modal";
import { formatIDR } from "@/lib/utils";
import {
  QrCode,
  Clock,
  Sparkles,
  CheckCircle2,
  Copy,
  Check,
  AlertCircle,
  X,
  Zap,
  ShieldCheck,
  RotateCw,
} from "lucide-react";

interface DynamicQrisModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  orderNumber?: string;
  orderId?: number;
  customerName?: string;
  onPaymentSuccess: (session: any) => void;
}

export function DynamicQrisModal({
  isOpen,
  onClose,
  amount,
  orderNumber,
  orderId,
  customerName,
  onPaymentSuccess,
}: DynamicQrisModalProps) {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(900); // 15 mins = 900s
  const [isSettled, setIsSettled] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [simulatingWebhook, setSimulatingWebhook] = useState(false);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Play a pleasant luxury synthesized sound using Web Audio API on settlement
  const playSettlementChime = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = "sine";
      osc2.type = "triangle";
      osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc1.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

      osc2.frequency.setValueAtTime(880, ctx.currentTime); // A5
      osc2.frequency.exponentialRampToValueAtTime(1174.66, ctx.currentTime + 0.25); // D6

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 0.6);
      osc2.stop(ctx.currentTime + 0.6);
    } catch {
      // AudioContext not allowed or unsupported
    }
  }, []);

  // Initialize or fetch dynamic QRIS session
  useEffect(() => {
    if (!isOpen) {
      if (pollingRef.current) clearInterval(pollingRef.current);
      setSession(null);
      setIsSettled(false);
      return;
    }

    let active = true;
    setLoading(true);
    setError(null);

    fetch("/api/v1/payment/qris/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount,
        orderNumber,
        orderId,
        customerName,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!active) return;
        if (data.success && data.session) {
          setSession(data.session);
          setTimeLeft(900);
        } else {
          setError(data.message || "Gagal membuat sesi QRIS.");
        }
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message || "Gangguan jaringan saat memuat QRIS.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [isOpen, amount, orderNumber, orderId, customerName]);

  // 1-Second Fast Polling for Automatic Webhook Detection
  useEffect(() => {
    if (!session || isSettled || !isOpen) return;

    pollingRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/v1/payment/qris/status?referenceNo=${session.referenceNo}`);
        const data = await res.json();
        if (data.success && data.status === "SETTLED") {
          setIsSettled(true);
          playSettlementChime();
          if (pollingRef.current) clearInterval(pollingRef.current);
          setTimeout(() => {
            onPaymentSuccess(data.session);
          }, 1500);
        }
      } catch {
        // Continue polling silently
      }
    }, 1000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [session, isSettled, isOpen, onPaymentSuccess, playSettlementChime]);

  // Timer Countdown
  useEffect(() => {
    if (!isOpen || timeLeft <= 0 || isSettled) return;
    const t = setInterval(() => setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [isOpen, timeLeft, isSettled]);

  // Trigger WebHook Simulation
  const handleSimulateWebhook = async () => {
    if (!session || simulatingWebhook) return;
    setSimulatingWebhook(true);
    try {
      const res = await fetch("/api/v1/payment/qris/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          referenceNo: session.referenceNo,
          status: "settlement",
          paymentMethod: "BCA QRIS / GoPay Direct",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsSettled(true);
        playSettlementChime();
        if (pollingRef.current) clearInterval(pollingRef.current);
        setTimeout(() => {
          onPaymentSuccess(data.session);
        }, 1200);
      }
    } catch (err: any) {
      setError(err?.message || "Gagal memicu webhook.");
    } finally {
      setSimulatingWebhook(false);
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-[#14281D] text-white rounded-3xl border border-white/15 p-5 sm:p-7 max-w-lg w-full space-y-5 shadow-2xl relative animate-in fade-in zoom-in-95 my-auto max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EA580C]/20 border border-[#EA580C]/30 text-[#FB923C] text-[11px] font-mono font-bold tracking-wider uppercase mb-1">
            <Zap className="w-3.5 h-3.5 animate-pulse text-[#EA580C]" />
            <span>Dynamic QRIS Direct Settlement</span>
          </div>
          <h3 className="font-serif text-2xl font-bold text-white">
            Pembayaran QRIS Standar BI
          </h3>
          <p className="text-xs text-slate-300">
            Pindai QR dengan BCA, Mandiri, GoPay, OVO, DANA, ShopeePay atau LinkAja
          </p>
        </div>

        {loading ? (
          <div className="py-16 text-center space-y-3">
            <RotateCw className="w-8 h-8 animate-spin mx-auto text-[#EA580C]" />
            <p className="text-xs text-slate-300 font-mono">
              Menghasilkan QRIS Dinamis & Kode Verifikasi Otomatis...
            </p>
          </div>
        ) : error ? (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-center space-y-2">
            <AlertCircle className="w-6 h-6 text-rose-400 mx-auto" />
            <p className="text-xs text-rose-300">{error}</p>
          </div>
        ) : isSettled ? (
          /* SUCCESS STATE */
          <div className="py-10 text-center space-y-4 animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-12 h-12 stroke-[2.5] animate-bounce" />
            </div>
            <div className="space-y-1">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-3 py-0.5 rounded-full border border-emerald-500/30">
                Terverifikasi Otomatis &lt; 1 Detik
              </span>
              <h4 className="font-serif text-2xl font-bold text-white pt-1">
                Pembayaran Lunas Diterima!
              </h4>
              <p className="text-xs text-slate-300 max-w-xs mx-auto">
                Dana sebesar <strong className="text-emerald-400">{formatIDR(session?.totalWithCode || amount)}</strong> telah masuk ke rekening SAVORIA.
              </p>
            </div>
            <div className="p-3 bg-black/30 rounded-2xl border border-white/10 text-left text-xs space-y-1 font-mono text-slate-300">
              <div className="flex justify-between">
                <span>Ref Transaksi:</span>
                <span className="text-white font-bold">{session?.referenceNo}</span>
              </div>
              <div className="flex justify-between">
                <span>Metode:</span>
                <span className="text-emerald-400">{session?.paymentMethod || "QRIS Direct"}</span>
              </div>
            </div>
          </div>
        ) : (
          /* PENDING QRIS VIEW */
          <div className="space-y-4">
            {/* Countdown Badge */}
            <div className="flex items-center justify-between bg-black/40 px-3.5 py-2 rounded-2xl border border-white/10 text-xs">
              <div className="flex items-center gap-1.5 text-slate-300 font-mono">
                <Clock className="w-4 h-4 text-[#FB923C]" />
                <span>Berlaku hingga:</span>
              </div>
              <span className="font-mono font-extrabold text-[#FB923C] text-sm">
                {timeFormatted}
              </span>
            </div>

            {/* QR Card */}
            <div className="bg-white rounded-2xl p-4 text-center text-slate-900 shadow-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2 px-1">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 bg-[#EA580C] text-white rounded flex items-center justify-center font-bold text-[10px]">
                    S
                  </div>
                  <span className="font-bold text-xs tracking-tight text-slate-800">SAVORIA RESTAURANT</span>
                </div>
                <span className="text-[10px] font-mono font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                  NMID: ID10293847561
                </span>
              </div>

              {/* QR Image Graphic with Logo in Center */}
              <div className="relative inline-block mx-auto p-2 bg-white rounded-xl border border-slate-200">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=00020101021226${encodeURIComponent(
                    session?.referenceNo || "SAVORIA-QRIS"
                  )}52045812530336054${session?.totalWithCode || amount}5802ID5916SAVORIA_RESTAURANT6007JAKARTA`}
                  alt="Dynamic QRIS Code"
                  className="w-44 h-44 sm:w-48 sm:h-48 mx-auto"
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-10 h-10 bg-white rounded-full p-1 shadow-md border border-slate-200 flex items-center justify-center">
                    <span className="font-serif font-black text-xs text-[#EA580C]">SVR</span>
                  </div>
                </div>
              </div>

              {/* Supported payment icons row */}
              <div className="flex items-center justify-center gap-2 pt-1 border-t border-slate-100 text-[10px] text-slate-500 font-semibold">
                <span>BCA</span>
                <span>•</span>
                <span>Mandiri</span>
                <span>•</span>
                <span>GoPay</span>
                <span>•</span>
                <span>OVO</span>
                <span>•</span>
                <span>DANA</span>
                <span>•</span>
                <span>ShopeePay</span>
              </div>
            </div>

            {/* Exact Nominal with Verification Code */}
            <div className="bg-black/35 rounded-2xl p-3.5 border border-white/10 space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span>Nominal Pokok:</span>
                <span className="font-mono">{formatIDR(session?.amount || amount)}</span>
              </div>
              <div className="flex items-center justify-between text-[#FB923C]">
                <span className="flex items-center gap-1">
                  <span>Kode Verifikasi Unik:</span>
                  <span className="text-[9px] bg-[#EA580C]/20 px-1.5 py-0.2 rounded font-mono font-bold">Otomatis</span>
                </span>
                <span className="font-mono font-bold">+{session?.verificationCode || 0}</span>
              </div>
              <div className="border-t border-white/10 pt-1.5 flex items-center justify-between">
                <span className="font-bold text-white">Total Tepat Harus Ditransfer:</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-extrabold text-[#FB923C] text-sm sm:text-base">
                    {formatIDR(session?.totalWithCode || amount)}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (navigator.clipboard) {
                        navigator.clipboard.writeText(String(session?.totalWithCode || amount));
                      }
                      setCopiedCode(true);
                      setTimeout(() => setCopiedCode(false), 2000);
                    }}
                    className="p-1 rounded bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white cursor-pointer"
                    title="Salin Total Tepat"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Real-time Status Radar Banner */}
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/20 text-[11px] text-emerald-300">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
              <span>Sistem mendengarkan sinyal WebHook perbankan secara real-time (deteksi &lt; 1 detik).</span>
            </div>

            {/* Test Simulation Webhook Trigger */}
            <button
              type="button"
              disabled={simulatingWebhook}
              onClick={handleSimulateWebhook}
              className="w-full py-3 px-4 rounded-full bg-gradient-to-r from-[#EA580C] to-[#C2410C] hover:brightness-110 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#EA580C]/25 cursor-pointer active:scale-98 transition-all disabled:opacity-60"
            >
              {simulatingWebhook ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>Memverifikasi Settlement Bank...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-white text-white" />
                  <span>Simulasikan Pembayaran Bank (WebHook 1-Detik)</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}
