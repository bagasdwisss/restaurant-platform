"use client";

import React, { useState, useEffect } from "react";
import QRCode from "qrcode";
import { X } from "lucide-react";
import { Modal } from "@/components/ui/Modal";

interface UserBoardingPassModalProps {
  order: any;
  user: any;
  onClose: () => void;
}

export function UserBoardingPassModal({
  order,
  user,
  onClose,
}: UserBoardingPassModalProps) {
  const [boardingPassQrUrl, setBoardingPassQrUrl] = useState<string>("");

  useEffect(() => {
    if (order) {
      const payload = JSON.stringify({
        bookingCode: order.orderNumber,
        guest: order.customerName || user?.name,
        table: order.table?.tableNumber || "VIP",
        date: order.reservationDate,
        time: order.reservationTime,
        pax: order.guestCount,
        securityHash: `SAV-VERIFIED-${order.id}`,
      });

      QRCode.toDataURL(payload, {
        width: 280,
        margin: 2,
        color: { dark: "#14281D", light: "#FFFFFF" },
      })
        .then((url) => setBoardingPassQrUrl(url))
        .catch(() => {});
    } else {
      setBoardingPassQrUrl("");
    }
  }, [order, user]);

  return (
    <Modal isOpen={Boolean(order)} onClose={onClose}>
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 max-w-sm w-full space-y-5 text-center shadow-2xl relative my-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-[#EA580C] bg-[#EA580C]/10 px-2.5 py-0.5 rounded-full inline-block">
            Boarding Pass Digital
          </span>
          <h3 className="font-serif font-bold text-xl text-[#18181B]">
            Verifikasi Meja Reservasi
          </h3>
          <p className="text-xs text-[#64748B]">
            #{order.orderNumber}
          </p>
        </div>

        {/* QR Image Box */}
        <div className="p-4 bg-[#FDFBF7] rounded-2xl border border-slate-200/80 inline-block">
          {boardingPassQrUrl ? (
            <img
              src={boardingPassQrUrl}
              alt="Boarding Pass QR"
              className="w-48 h-48 mx-auto object-contain"
            />
          ) : (
            <div className="w-48 h-48 bg-slate-100 flex items-center justify-center text-xs text-slate-400 font-mono">
              Membuat QR...
            </div>
          )}
        </div>

        <div className="text-xs space-y-1 bg-slate-50 p-3 rounded-2xl border border-slate-200/60 font-mono">
          <div className="flex justify-between">
            <span className="text-slate-400">Meja:</span>
            <span className="font-bold text-[#18181B]">
              {order.table?.tableNumber || "VIP"} ({order.table?.area || "Indoor"})
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Jadwal:</span>
            <span className="font-bold text-[#18181B]">
              {order.reservationDate || "Hari Ini"} • {order.reservationTime || "19:00"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Jumlah Tamu:</span>
            <span className="font-bold text-[#18181B]">
              {order.guestCount || 2} Orang
            </span>
          </div>
        </div>

        <p className="text-[11px] text-slate-500 leading-relaxed">
          Tunjukkan QR ini ke staf resepsionis saat Anda tiba di SAVORIA untuk dipandu langsung ke meja Anda.
        </p>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 rounded-full bg-[#14281D] hover:bg-[#14281D]/90 text-white font-bold text-xs cursor-pointer shadow-md"
        >
          Tutup Boarding Pass
        </button>
      </div>
    </Modal>
  );
}
