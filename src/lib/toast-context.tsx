"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { AlertCircle, CheckCircle2, AlertTriangle, Sparkles, X } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastContextType {
  toasts: ToastItem[];
  showToast: (options: { type: ToastType; message: string; title?: string; duration?: number }) => void;
  toast: {
    success: (message: string, title?: string) => void;
    error: (message: string, title?: string) => void;
    warning: (message: string, title?: string) => void;
    info: (message: string, title?: string) => void;
  };
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    ({ type, message, title, duration = 4000 }: { type: ToastType; message: string; title?: string; duration?: number }) => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const newToast: ToastItem = { id, type, title, message, duration };

      setToasts((prev) => {
        // Prevent duplicate toast with identical message
        const isDuplicate = prev.some((t) => t.message === message && t.type === type);
        if (isDuplicate) return prev;
        const next = [...prev, newToast];
        return next.slice(-3); // Limit max 3 visible toasts
      });

      if (duration > 0) {
        setTimeout(() => {
          dismissToast(id);
        }, duration);
      }
    },
    [dismissToast]
  );

  const toast = React.useMemo(
    () => ({
      success: (message: string, title?: string) => showToast({ type: "success", message, title: title || "Berhasil" }),
      error: (message: string, title?: string) => showToast({ type: "error", message, title: title || "Terjadi Kendala" }),
      warning: (message: string, title?: string) => showToast({ type: "warning", message, title: title || "Perhatian" }),
      info: (message: string, title?: string) => showToast({ type: "info", message, title: title || "Informasi" }),
    }),
    [showToast]
  );

  return (
    <ToastContext.Provider value={{ toasts, showToast, toast, dismissToast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

function ToastContainer({ toasts, onDismiss }: { toasts: ToastItem[]; onDismiss: (id: string) => void }) {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed top-4 right-4 sm:top-6 sm:right-6 z-[99999] flex flex-col gap-2.5 pointer-events-none max-w-sm sm:max-w-md w-[calc(100vw-2rem)] select-none"
    >
      {toasts.map((item) => {
        const isError = item.type === "error";
        const isSuccess = item.type === "success";
        const isWarning = item.type === "warning";

        const borderColor = isError
          ? "border-rose-500/40"
          : isSuccess
          ? "border-emerald-500/40"
          : isWarning
          ? "border-amber-500/40"
          : "border-[#EA580C]/40";

        const iconBg = isError
          ? "bg-rose-500/15 text-rose-400 border-rose-500/30"
          : isSuccess
          ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
          : isWarning
          ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
          : "bg-[#EA580C]/15 text-[#EA580C] border-[#EA580C]/30";

        const badgeColor = isError
          ? "text-rose-400"
          : isSuccess
          ? "text-emerald-400"
          : isWarning
          ? "text-amber-400"
          : "text-[#EA580C]";

        const IconComponent = isError
          ? AlertCircle
          : isSuccess
          ? CheckCircle2
          : isWarning
          ? AlertTriangle
          : Sparkles;

        return (
          <div
            key={item.id}
            role="status"
            className={`pointer-events-auto bg-[#14281D]/95 backdrop-blur-md rounded-2xl border ${borderColor} p-3.5 sm:p-4 shadow-2xl flex items-start gap-3 transition-all duration-300 animate-in fade-in slide-in-from-top-3 group`}
          >
            {/* Status Icon */}
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${iconBg}`}>
              <IconComponent className="w-4 h-4 stroke-[2.2]" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pr-1">
              <div className="flex items-center gap-2 mb-0.5">
                <span className={`text-[10px] font-mono uppercase tracking-widest font-bold ${badgeColor}`}>
                  {item.title || (isError ? "Error" : isSuccess ? "Success" : isWarning ? "Notice" : "Savoria")}
                </span>
              </div>
              <p className="text-xs text-stone-200 font-sans leading-relaxed break-words">
                {item.message}
              </p>
            </div>

            {/* Dismiss Button */}
            <button
              onClick={() => onDismiss(item.id)}
              className="text-stone-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer shrink-0"
              title="Tutup Notifikasi"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
