"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || toasts.length === 0) return null;

  return createPortal(
    <div
      aria-live="polite"
      className="fixed top-5 right-3 sm:top-6 sm:right-6 z-[999999] flex flex-col gap-3 pointer-events-none max-w-sm sm:max-w-md w-[calc(100vw-1.5rem)] select-none"
    >
      {toasts.map((item) => {
        const isError = item.type === "error";
        const isSuccess = item.type === "success";
        const isWarning = item.type === "warning";

        const cardBorder = isError
          ? "border-slate-200 border-l-[6px] border-l-rose-600"
          : isSuccess
          ? "border-slate-200 border-l-[6px] border-l-emerald-600"
          : isWarning
          ? "border-slate-200 border-l-[6px] border-l-amber-500"
          : "border-slate-200 border-l-[6px] border-l-[#EA580C]";

        const iconContainer = isError
          ? "bg-rose-50 text-rose-600 border border-rose-200/80"
          : isSuccess
          ? "bg-emerald-50 text-emerald-700 border border-emerald-200/80"
          : isWarning
          ? "bg-amber-50 text-amber-700 border border-amber-200/80"
          : "bg-orange-50 text-[#EA580C] border border-orange-200/80";

        const badgeColor = isError
          ? "text-rose-700"
          : isSuccess
          ? "text-emerald-700"
          : isWarning
          ? "text-amber-800"
          : "text-[#EA580C]";

        const defaultTitle = isError
          ? "Peringatan / Kendala"
          : isSuccess
          ? "Berhasil"
          : isWarning
          ? "Perhatian"
          : "Informasi SAVORIA";

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
            style={{ backgroundColor: "#ffffff", opacity: 1 }}
            className={`pointer-events-auto rounded-2xl border ${cardBorder} p-4 shadow-[0_20px_45px_rgba(0,0,0,0.22)] flex items-start gap-3.5 transition-all duration-300 animate-toast`}
          >
            {/* Status Icon */}
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconContainer}`}>
              <IconComponent className="w-5 h-5 stroke-[2.5]" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pr-1">
              <div className="flex items-center gap-2 mb-0.5">
                <span className={`text-[11px] font-mono uppercase tracking-wider font-extrabold ${badgeColor}`}>
                  {item?.title || defaultTitle}
                </span>
              </div>
              <p className="text-xs sm:text-[13px] text-slate-900 font-medium font-sans leading-snug break-words">
                {item?.message || ""}
              </p>
            </div>

            {/* Dismiss Button */}
            <button
              onClick={() => onDismiss(item?.id)}
              className="text-slate-400 hover:text-slate-700 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer shrink-0"
              title="Tutup Notifikasi"
            >
              <X className="w-4 h-4 stroke-[2.2]" />
            </button>
          </div>
        );
      })}
    </div>,
    document.body
  );
}
