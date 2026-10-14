"use client";

import React, { useState } from "react";
import QRCode from "qrcode";
import { QrCode, Plus, RefreshCw, Download, X } from "lucide-react";

interface TablesTabProps {
  tables: any[];
  onCreateTable: (form: any) => Promise<boolean>;
  onRegenerateQr: (tableId: number) => Promise<void>;
}

export function TablesTab({ tables, onCreateTable, onRegenerateQr }: TablesTabProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [tableForm, setTableForm] = useState({ tableNumber: "", capacity: "4", area: "Indoor" });

  const [selectedTableQr, setSelectedTableQr] = useState<any>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  const handleOpenQrModal = async (table: any) => {
    setSelectedTableQr(table);
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const tableUrl = `${origin}/table/${table.qrToken}`;
      const url = await QRCode.toDataURL(tableUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: "#14281D",
          light: "#FFFFFF",
        },
      });
      setQrDataUrl(url);
    } catch (err) {
      console.error("Failed to generate QR code", err);
    }
  };

  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    setIsCreating(true);
    try {
      const success = await onCreateTable(tableForm);
      if (success) {
        setShowAddModal(false);
        setTableForm({ tableNumber: "", capacity: "4", area: "Indoor" });
      }
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#18181B]">
            Manajemen Meja & Generator QR Code
          </h2>
          <p className="text-xs text-[#64748B]">
            Atur denah meja makan, kapasitas pax, serta cetak standee QR Code pemesanan instan per meja.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-2.5 bg-[#EA580C] hover:bg-[#C2410C] text-white rounded-full text-xs font-bold flex items-center gap-1.5 shadow-md shadow-[#EA580C]/25 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Meja Baru</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {tables.map((table) => (
          <div
            key={table.id}
            className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm space-y-3 flex flex-col justify-between hover:shadow-md transition-all"
          >
            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-serif font-bold text-base text-[#18181B]">{table.tableNumber}</h3>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-[#64748B] font-mono">
                  {table.area}
                </span>
              </div>
              <p className="text-xs text-[#64748B] mt-0.5">
                Kapasitas: {table.capacity} Orang • Status:{" "}
                <span className="font-semibold text-[#18181B]">{table.status}</span>
              </p>
              <p className="text-[10px] text-slate-400 font-mono truncate mt-2 bg-[#FDFBF7] p-2 rounded-xl border border-slate-200/60">
                Token: {table.qrToken}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex gap-2">
              <button
                onClick={() => handleOpenQrModal(table)}
                className="flex-1 py-2 bg-[#EA580C] hover:bg-[#C2410C] text-white rounded-full text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm shadow-[#EA580C]/20 transition-all cursor-pointer"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Unduh QR Pass</span>
              </button>
              <button
                onClick={() => onRegenerateQr(table.id)}
                title="Regenerate QR Token"
                className="p-2 bg-slate-100 hover:bg-slate-200 text-[#64748B] rounded-full text-xs cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL: ADD TABLE */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto my-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-serif font-bold text-[#18181B] text-base">Tambah Meja Restoran</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[#64748B] hover:text-[#18181B] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[#18181B] block mb-1">Nomor / Nama Meja</label>
                <input
                  type="text"
                  placeholder="Contoh: Meja 12 atau VIP Suite 01"
                  value={tableForm.tableNumber}
                  onChange={(e) => setTableForm({ ...tableForm, tableNumber: e.target.value })}
                  className="w-full text-xs p-3 border border-slate-200/80 rounded-2xl"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#18181B] block mb-1">Kapasitas Tamu (Pax)</label>
                <input
                  type="number"
                  value={tableForm.capacity}
                  onChange={(e) => setTableForm({ ...tableForm, capacity: e.target.value })}
                  className="w-full text-xs p-3 border border-slate-200/80 rounded-2xl"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#18181B] block mb-1">Area Meja</label>
                <select
                  value={tableForm.area}
                  onChange={(e) => setTableForm({ ...tableForm, area: e.target.value })}
                  className="w-full text-xs p-3 border border-slate-200/80 rounded-2xl bg-white"
                >
                  <option value="Indoor">Indoor (Main Hall)</option>
                  <option value="Outdoor">Outdoor (Terrace)</option>
                  <option value="Lantai 2">Lantai 2 (VIP Suite)</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleCreate}
              disabled={isCreating}
              className="w-full bg-[#EA580C] hover:bg-[#C2410C] disabled:bg-slate-300 text-white font-bold py-3 rounded-full text-xs transition-all shadow-md shadow-[#EA580C]/25 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isCreating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Membuat Meja & Token...</span>
                </>
              ) : (
                <span>Buat Meja & Generate Token</span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* MODAL: VIEW & DOWNLOAD HIGH-RESOLUTION QR CODE */}
      {selectedTableQr && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 text-center max-h-[90vh] overflow-y-auto my-auto">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-[#64748B]">SAVORIA QR Pass Generator</span>
              <button
                onClick={() => setSelectedTableQr(null)}
                className="text-[#64748B] hover:text-[#18181B] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Standee Preview Card for Table */}
            <div className="bg-[#FDFBF7] p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#EA580C] text-white flex items-center justify-center font-bold text-lg mx-auto shadow-sm">
                S
              </div>
              <div>
                <h4 className="font-serif font-bold text-lg text-[#18181B]">
                  {selectedTableQr.tableNumber}
                </h4>
                <p className="text-xs text-[#64748B]">
                  {selectedTableQr.area} • Pindai untuk Pemesanan Meja
                </p>
              </div>

              {qrDataUrl && (
                <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-200/80 inline-block">
                  <img src={qrDataUrl} alt="QR Code" className="w-48 h-48 mx-auto" />
                </div>
              )}

              <p className="text-[10px] text-slate-400 font-mono">
                {typeof window !== "undefined" ? window.location.origin : ""}/table/{selectedTableQr.qrToken}
              </p>
            </div>

            <div className="flex gap-2">
              <a
                href={qrDataUrl}
                download={`SAVORIA-QR-${selectedTableQr.tableNumber}.png`}
                className="flex-1 py-3 bg-[#EA580C] hover:bg-[#C2410C] text-white rounded-full text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-[#EA580C]/25"
              >
                <Download className="w-4 h-4" />
                <span>Unduh PNG</span>
              </a>
              <a
                href={`/table/${selectedTableQr.qrToken}`}
                target="_blank"
                rel="noreferrer"
                className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-[#18181B] rounded-full text-xs font-bold"
              >
                Buka Tab ↗
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
