"use client";

import React from "react";
import { formatIDR, formatDate } from "@/lib/utils";

interface PosThermalReceiptProps {
  printData: { type: "customer" | "kitchen"; order: any } | null;
  currentShift: any;
}

export function PosThermalReceipt({ printData, currentShift }: PosThermalReceiptProps) {
  if (!printData) return null;

  return (
    <div id="printable-receipt" className="hidden print:block">
      {printData.type === "customer" ? (
        /* Struk Pelanggan ESC/POS 58mm/80mm */
        <div className="text-center font-mono text-xs">
          <h2 className="font-bold text-base uppercase">SAVORIA RESTAURANT</h2>
          <p className="text-[10px]">Grand Boulevard No. 88, Jakarta Selatan</p>
          <p className="text-[10px]">Telp: (021) 8899-0000</p>
          <div className="border-t border-dashed border-black my-2" />

          <div className="text-left text-[10px] space-y-0.5">
            <p>No: {printData.order.orderNumber}</p>
            <p>Waktu: {formatDate(new Date())}</p>
            <p>Meja: {printData.order.table?.tableNumber || "Takeaway"}</p>
            <p>Kasir: {currentShift?.cashierName || "Kasir Utama"}</p>
            <p>Pelanggan: {printData.order.customerName}</p>
          </div>

          <div className="border-t border-dashed border-black my-2" />

          {/* Items */}
          <div className="text-left text-[10px] space-y-1">
            {printData.order.items?.map((it: any) => (
              <div key={it.id} className="flex justify-between">
                <div>
                  <span>
                    {it.quantity}x {it.menu?.name || it.name}
                  </span>
                  {it.notes && <p className="text-[9px] italic">({it.notes})</p>}
                </div>
                <span>{formatIDR(it.subtotal)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-dashed border-black my-2" />

          <div className="text-left text-[10px] space-y-0.5">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatIDR(printData.order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>PB1 (10%)</span>
              <span>{formatIDR(printData.order.taxAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span>Service (5%)</span>
              <span>{formatIDR(printData.order.serviceCharge)}</span>
            </div>
            <div className="flex justify-between font-bold text-xs pt-1 border-t border-black">
              <span>TOTAL</span>
              <span>{formatIDR(printData.order.totalAmount)}</span>
            </div>
            <div className="flex justify-between pt-1">
              <span>Metode Bayar</span>
              <span className="uppercase">{printData.order.paymentMethod || "Tunai"}</span>
            </div>
          </div>

          <div className="border-t border-dashed border-black my-2" />
          <p className="text-[10px] font-bold">TERIMA KASIH ATAS KUNJUNGAN ANDA</p>
          <p className="text-[9px]">Simpan struk ini sebagai bukti pembayaran sah.</p>
        </div>
      ) : (
        /* Tiket Dapur ESC/POS */
        <div className="text-left font-mono">
          <h2 className="font-bold text-sm uppercase text-center border-b border-black pb-1">
            *** SAVORIA TIKET DAPUR / BAR ***
          </h2>
          <div className="text-[11px] my-1 font-bold">
            <p>MEJA: {printData.order.table?.tableNumber || "TAKEAWAY"}</p>
            <p>ORDER: {printData.order.orderNumber}</p>
            <p>WAKTU: {formatDate(new Date())}</p>
          </div>

          <div className="border-t-2 border-black my-2" />

          <div className="space-y-2 text-xs font-bold">
            {printData.order.items?.map((it: any) => (
              <div key={it.id}>
                <p className="text-sm">
                  [{it.quantity}X] {it.menu?.name || it.name}
                </p>
                {it.notes && (
                  <p className="text-[11px] italic underline">
                    NOTE: {it.notes}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="border-t-2 border-black my-2" />
          <p className="text-[10px] text-center font-bold">-- SEGERA PROSES MAKANAN --</p>
        </div>
      )}
    </div>
  );
}
