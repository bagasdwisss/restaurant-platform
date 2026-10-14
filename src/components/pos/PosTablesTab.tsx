"use client";

import React from "react";
import { MapPin, ArrowRightLeft, CreditCard, UtensilsCrossed, CheckCircle2 } from "lucide-react";
import { VisualFloorPlan } from "@/components/tables/VisualFloorPlan";
import { formatIDR } from "@/lib/utils";

interface PosTablesTabProps {
  tables: any[];
  selectedTableId: number | null;
  onSelectTable: (table: any) => void;
  activeOrders: any[];
  onOpenPayModalForOrder: (order: any) => void;
  onOpenMoveTableModal: (table: any) => void;
}

export function PosTablesTab({
  tables,
  selectedTableId,
  onSelectTable,
  activeOrders,
  onOpenPayModalForOrder,
  onOpenMoveTableModal,
}: PosTablesTabProps) {
  const selectedTable = tables.find((t) => t.id === selectedTableId);
  const activeOrderForTable = selectedTable
    ? activeOrders.find((o) => o.tableId === selectedTable.id && o.paymentStatus !== "paid")
    : null;

  return (
    <div className="flex-1 p-3.5 sm:p-6 overflow-y-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-1">
        <div>
          <h2 className="font-serif text-lg sm:text-xl font-bold text-[#18181B]">
            Denah Meja Restoran Terpadu
          </h2>
          <p className="text-xs text-[#64748B]">
            Status ketersediaan meja terhubung langsung dengan sistem reservasi & pemesanan.
          </p>
        </div>
      </div>

      {/* Visual Floor Plan Canvas */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-4 sm:p-6 shadow-xs overflow-hidden">
        <VisualFloorPlan
          tables={tables}
          mode="pos"
          selectedTable={selectedTable}
          onSelectTable={onSelectTable}
          onOpenBill={(tbl) => {
            if (activeOrderForTable) onOpenPayModalForOrder(activeOrderForTable);
          }}
          onPayOrder={onOpenPayModalForOrder}
          onMoveTable={onOpenMoveTableModal}
        />
      </div>

      {/* Selected Table Action Drawer */}
      {selectedTable && (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#EA580C] text-white flex items-center justify-center font-bold text-sm shrink-0">
              {selectedTable.tableNumber}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-sm sm:text-base text-[#18181B]">
                  Meja {selectedTable.tableNumber}
                </h3>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                    selectedTable.status === "available"
                      ? "bg-emerald-100 text-emerald-800"
                      : selectedTable.status === "occupied"
                      ? "bg-rose-100 text-rose-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {selectedTable.status}
                </span>
              </div>
              <p className="text-xs text-[#64748B]">
                Area: {selectedTable.area} • Kapasitas: {selectedTable.capacity} Tamu
                {activeOrderForTable && ` • Tamu: ${activeOrderForTable.customerName}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            {activeOrderForTable ? (
              <>
                <button
                  type="button"
                  onClick={() => onOpenMoveTableModal(selectedTable)}
                  className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-[#18181B] rounded-full text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5 text-[#EA580C]" />
                  <span>Pindah Meja</span>
                </button>
                <button
                  type="button"
                  onClick={() => onOpenPayModalForOrder(activeOrderForTable)}
                  className="px-5 py-2.5 bg-[#EA580C] hover:bg-[#C2410C] text-white rounded-full text-xs font-bold flex items-center gap-1.5 shadow-md shadow-[#EA580C]/25 cursor-pointer"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Bayar ({formatIDR(activeOrderForTable.totalAmount)})</span>
                </button>
              </>
            ) : (
              <span className="text-xs text-slate-400 font-medium">
                Meja ini siap digunakan (tidak ada tagihan tertunda).
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
