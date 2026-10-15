"use client";

import React from "react";
import { formatIDR, formatDate } from "@/lib/utils";

export type PrintReceiptType =
  | "customer"
  | "kitchen"
  | "kitchen_multi_split"
  | "kitchen_hot"
  | "kitchen_barista"
  | "kitchen_pastry";

interface PosThermalReceiptProps {
  printData: {
    type: PrintReceiptType;
    order: any;
  } | null;
  currentShift: any;
}

// Station Classification Helper
function categorizeItemStation(item: any): "hot_kitchen" | "barista" | "pastry" {
  const catName = (item.menu?.category?.name || item.category || "").toLowerCase();
  const itemName = (item.menu?.name || item.name || "").toLowerCase();

  // 1. Barista & Beverage Station
  if (
    catName.includes("beverage") ||
    catName.includes("drink") ||
    catName.includes("minuman") ||
    catName.includes("wine") ||
    catName.includes("bar") ||
    catName.includes("cocktail") ||
    itemName.includes("coffee") ||
    itemName.includes("latte") ||
    itemName.includes("tea") ||
    itemName.includes("juice") ||
    itemName.includes("jus") ||
    itemName.includes("mocktail") ||
    itemName.includes("wine") ||
    itemName.includes("water") ||
    itemName.includes("cocktail")
  ) {
    return "barista";
  }

  // 2. Pastry & Dessert Station
  if (
    catName.includes("dessert") ||
    catName.includes("pastry") ||
    catName.includes("manis") ||
    itemName.includes("souffle") ||
    itemName.includes("cake") ||
    itemName.includes("tiramisu") ||
    itemName.includes("ice cream") ||
    itemName.includes("gelato") ||
    itemName.includes("pudding") ||
    itemName.includes("crepe") ||
    itemName.includes("chocolate")
  ) {
    return "pastry";
  }

  // 3. Hot Kitchen (Main Chef)
  return "hot_kitchen";
}

export function PosThermalReceipt({ printData, currentShift }: PosThermalReceiptProps) {
  if (!printData) return null;

  const { type, order } = printData;

  // Station Items Partition
  const allItems = order.items || [];
  const hotKitchenItems = allItems.filter((i: any) => categorizeItemStation(i) === "hot_kitchen");
  const baristaItems = allItems.filter((i: any) => categorizeItemStation(i) === "barista");
  const pastryItems = allItems.filter((i: any) => categorizeItemStation(i) === "pastry");

  const renderKitchenTicket = (
    stationTitle: string,
    stationCode: string,
    items: any[],
    isLast: boolean = false
  ) => {
    if (items.length === 0) return null;

    return (
      <div
        key={stationCode}
        className={`text-left font-mono text-black ${!isLast ? "print:break-after-page" : ""}`}
        style={{ breakAfter: isLast ? "auto" : "page", pageBreakAfter: isLast ? "auto" : "always" }}
      >
        <div className="border-b-2 border-dashed border-black pb-2 text-center">
          <h2 className="font-extrabold text-sm uppercase">*** TIKET STASIUN DAPUR ***</h2>
          <div className="mt-1 inline-block bg-black text-white px-2 py-0.5 text-xs font-black uppercase">
            STASIUN: {stationTitle}
          </div>
        </div>

        <div className="text-[11px] my-2 font-bold space-y-0.5">
          <div className="flex justify-between">
            <span>MEJA: {order.table?.tableNumber || "TAKEAWAY"}</span>
            <span>AREA: {order.table?.area || "Indoor"}</span>
          </div>
          <div className="flex justify-between">
            <span>ORDER: #{order.orderNumber}</span>
            <span>TIPE: {order.orderType?.toUpperCase()}</span>
          </div>
          <p>WAKTU TIKET: {formatDate(new Date())}</p>
          <p>PELAYAN / KASIR: {currentShift?.cashierName || "Kasir Utama"}</p>
          {order.customerName && <p>TAMU: {order.customerName}</p>}
        </div>

        {order.specialRequests && (
          <div className="border border-black p-1.5 my-2 text-[10px] font-bold">
            *** CATATAN TAMU: {order.specialRequests} ***
          </div>
        )}

        <div className="border-t-2 border-black my-2" />

        {/* Station Items List */}
        <div className="space-y-2 text-xs font-bold">
          {items.map((it: any) => (
            <div key={it.id} className="pb-1 border-b border-dotted border-black/40">
              <div className="flex justify-between items-baseline">
                <span className="text-sm font-black">
                  [{it.quantity}X] {it.menu?.name || it.name}
                </span>
              </div>
              {it.notes && (
                <p className="text-[11px] italic underline mt-0.5">
                  &gt;&gt; NOTE: {it.notes}
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="border-t-2 border-black mt-3 pt-1 text-center">
          <p className="text-[10px] font-bold">-- SEGERA PROSES STASIUN {stationTitle} --</p>
          <p className="text-[8px] text-gray-700">RestoSync Multi-Printer Routing</p>
        </div>
      </div>
    );
  };

  return (
    <div id="printable-receipt" className="hidden print:block font-mono text-black">
      {type === "customer" ? (
        /* Struk Pelanggan ESC/POS 58mm/80mm */
        <div className="text-center font-mono text-xs">
          <h2 className="font-bold text-base uppercase">SAVORIA RESTAURANT</h2>
          <p className="text-[10px]">Grand Boulevard No. 88, Jakarta Selatan</p>
          <p className="text-[10px]">Telp: (021) 8899-0000</p>
          <div className="border-t border-dashed border-black my-2" />

          <div className="text-left text-[10px] space-y-0.5">
            <p>No: {order.orderNumber}</p>
            <p>Waktu: {formatDate(new Date())}</p>
            <p>Meja: {order.table?.tableNumber || "Takeaway"}</p>
            <p>Kasir: {currentShift?.cashierName || "Kasir Utama"}</p>
            <p>Pelanggan: {order.customerName || "Tamu Terhormat"}</p>
          </div>

          <div className="border-t border-dashed border-black my-2" />

          {/* Items */}
          <div className="text-left text-[10px] space-y-1">
            {order.items?.map((it: any) => (
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
              <span>{formatIDR(order.subtotal)}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between font-bold">
                <span>Diskon Voucher</span>
                <span>-{formatIDR(order.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>PB1 (10%)</span>
              <span>{formatIDR(order.taxAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span>Service (5%)</span>
              <span>{formatIDR(order.serviceCharge)}</span>
            </div>
            <div className="flex justify-between font-bold text-xs pt-1 border-t border-black">
              <span>TOTAL</span>
              <span>{formatIDR(order.totalAmount)}</span>
            </div>
            <div className="flex justify-between pt-1">
              <span>Metode Bayar</span>
              <span className="uppercase">{order.paymentMethod || "Tunai"}</span>
            </div>
          </div>

          <div className="border-t border-dashed border-black my-2" />
          <p className="text-[10px] font-bold">TERIMA KASIH ATAS KUNJUNGAN ANDA</p>
          <p className="text-[9px]">Simpan struk ini sebagai bukti pembayaran sah.</p>
        </div>
      ) : type === "kitchen_hot" ? (
        renderKitchenTicket("HOT KITCHEN / MAIN CHEF", "hot", hotKitchenItems, true)
      ) : type === "kitchen_barista" ? (
        renderKitchenTicket("BARISTA & BEVERAGE BAR", "bar", baristaItems, true)
      ) : type === "kitchen_pastry" ? (
        renderKitchenTicket("PASTRY & DESSERT STATION", "pastry", pastryItems, true)
      ) : type === "kitchen_multi_split" ? (
        /* Multi-Printer Kitchen Routing: Auto-Split All Active Stations */
        <div className="space-y-6">
          {hotKitchenItems.length > 0 &&
            renderKitchenTicket(
              "HOT KITCHEN / MAIN CHEF",
              "hot",
              hotKitchenItems,
              baristaItems.length === 0 && pastryItems.length === 0
            )}
          {baristaItems.length > 0 &&
            renderKitchenTicket(
              "BARISTA & BEVERAGE BAR",
              "bar",
              baristaItems,
              pastryItems.length === 0
            )}
          {pastryItems.length > 0 &&
            renderKitchenTicket("PASTRY & DESSERT STATION", "pastry", pastryItems, true)}
        </div>
      ) : (
        /* Master Kitchen Ticket (All Items) */
        renderKitchenTicket("MASTER KITCHEN (ALL STATIONS)", "master", allItems, true)
      )}
    </div>
  );
}
