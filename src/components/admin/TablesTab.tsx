"use client";

import React, { useState } from "react";
import QRCode from "qrcode";
import {
  QrCode,
  Plus,
  RefreshCw,
  Download,
  X,
  Users,
  Search,
  CheckCircle2,
  Clock,
  Printer,
  Sparkles,
  Edit,
  Eye,
} from "lucide-react";

interface TablesTabProps {
  tables: any[];
  onCreateTable: (form: any) => Promise<boolean>;
  onUpdateTable?: (tableId: number, data: any) => Promise<boolean>;
  onRegenerateQr: (tableId: number) => Promise<void>;
}

export function TablesTab({
  tables,
  onCreateTable,
  onUpdateTable,
  onRegenerateQr,
}: TablesTabProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [tableForm, setTableForm] = useState({ tableNumber: "", capacity: "4", area: "Indoor" });

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTable, setEditingTable] = useState<any>(null);
  const [editForm, setEditForm] = useState({ tableNumber: "", capacity: "4", area: "Indoor", status: "available" });

  const [selectedTableQr, setSelectedTableQr] = useState<any>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArea, setSelectedArea] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updatingTableId, setUpdatingTableId] = useState<number | null>(null);

  // Open QR Standee Preview
  const handleOpenQrModal = async (table: any) => {
    setSelectedTableQr(table);
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const tableUrl = `${origin}/table/${table.qrToken}`;
      const url = await QRCode.toDataURL(tableUrl, {
        width: 320,
        margin: 2,
        color: {
          dark: "#18181B",
          light: "#FFFFFF",
        },
      });
      setQrDataUrl(url);
    } catch (err) {
      console.error("Failed to generate QR code", err);
    }
  };

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

  const handleOpenEdit = (table: any) => {
    setEditingTable(table);
    setEditForm({
      tableNumber: table.tableNumber,
      capacity: String(table.capacity),
      area: table.area,
      status: table.status,
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editingTable || !onUpdateTable) return;
    setIsUpdating(true);
    try {
      const success = await onUpdateTable(editingTable.id, {
        tableNumber: editForm.tableNumber,
        capacity: parseInt(editForm.capacity, 10),
        area: editForm.area,
        status: editForm.status,
      });
      if (success) {
        setShowEditModal(false);
        setEditingTable(null);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handleQuickStatusChange = async (tableId: number, newStatus: string) => {
    if (!onUpdateTable) return;
    setUpdatingTableId(tableId);
    try {
      await onUpdateTable(tableId, { status: newStatus });
    } finally {
      setUpdatingTableId(null);
    }
  };

  // Metrics Calculations
  const totalTables = tables.length;
  const availableTables = tables.filter((t) => t.status === "available").length;
  const occupiedTables = tables.filter((t) => t.status === "occupied").length;
  const reservedTables = tables.filter((t) => t.status === "reserved").length;
  const totalCapacity = tables.reduce((sum, t) => sum + (t.capacity || 0), 0);
  const occupancyRate = totalTables > 0 ? Math.round(((occupiedTables + reservedTables) / totalTables) * 100) : 0;

  // Filter Tables
  const filteredTables = tables.filter((t) => {
    const matchSearch =
      t.tableNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.area.toLowerCase().includes(searchQuery.toLowerCase());
    const matchArea = selectedArea === "all" || t.area.toLowerCase() === selectedArea.toLowerCase();
    const matchStatus = selectedStatus === "all" || t.status.toLowerCase() === selectedStatus.toLowerCase();
    return matchSearch && matchArea && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-2xl font-bold text-[#18181B]">
              Manajemen Meja & Generator QR Standee
            </h2>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold">
              <Sparkles className="w-3 h-3" /> Smart Floor Plan
            </span>
          </div>
          <p className="text-xs text-[#64748B]">
            Kelola tata letak ruang makan, status ketersediaan meja real-time, dan cetak standee akrilik QR Code pemesanan instan.
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

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-[#64748B] block">Total Meja & Pax</span>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-2xl font-bold text-[#18181B]">{totalTables}</span>
            <span className="text-xs text-[#64748B] font-mono">({totalCapacity} Kursi)</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-emerald-700 block">Meja Tersedia</span>
          <div className="flex items-center gap-2">
            <span className="font-serif text-2xl font-bold text-emerald-700">{availableTables}</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
              Ready
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-rose-700 block">Terisi & Reservasi</span>
          <div className="flex items-center gap-2">
            <span className="font-serif text-2xl font-bold text-rose-700">
              {occupiedTables + reservedTables}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold">
              {occupiedTables} Terisi / {reservedTables} Book
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-[#64748B] block">Tingkat Okupansi</span>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-2xl font-bold text-[#18181B]">{occupancyRate}%</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1">
            <div
              style={{ width: `${occupancyRate}%` }}
              className="bg-[#EA580C] h-full rounded-full transition-all"
            />
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nomor meja atau area..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200/80 rounded-full text-xs font-medium focus:outline-hidden focus:border-[#EA580C] focus:bg-white transition-all"
          />
        </div>

        {/* Filter Area & Status Pills */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Area Filters */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-full text-[11px] font-semibold">
            {["all", "Indoor", "Outdoor", "VIP"].map((area) => (
              <button
                key={area}
                type="button"
                onClick={() => setSelectedArea(area)}
                className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                  selectedArea === area
                    ? "bg-white text-[#18181B] shadow-xs"
                    : "text-[#64748B] hover:text-[#18181B]"
                }`}
              >
                {area === "all" ? "Semua Area" : area}
              </button>
            ))}
          </div>

          {/* Status Filters */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-full text-[11px] font-semibold">
            {[
              { id: "all", label: "Semua" },
              { id: "available", label: "Tersedia" },
              { id: "occupied", label: "Terisi" },
              { id: "reserved", label: "Reserved" },
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setSelectedStatus(st.id)}
                className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                  selectedStatus === st.id
                    ? "bg-[#EA580C] text-white shadow-xs"
                    : "text-[#64748B] hover:text-[#18181B]"
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredTables.length === 0 ? (
          <div className="col-span-full py-12 text-center text-[#64748B] bg-white rounded-3xl border border-slate-200/80">
            <QrCode className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            <p className="text-xs">Tidak ada meja yang cocok dengan filter atau pencarian Anda.</p>
          </div>
        ) : (
          filteredTables.map((table) => {
            const isAvailable = table.status === "available";
            const isOccupied = table.status === "occupied";
            const isReserved = table.status === "reserved";
            const isToggling = updatingTableId === table.id;

            return (
              <div
                key={table.id}
                className={`bg-white rounded-3xl border p-5 shadow-xs space-y-3.5 flex flex-col justify-between hover:shadow-md transition-all relative ${
                  isOccupied
                    ? "border-rose-200 bg-rose-50/15"
                    : isReserved
                    ? "border-amber-200 bg-amber-50/15"
                    : "border-slate-200/80"
                }`}
              >
                <div>
                  {/* Top Bar: Table Number, Area Badge, Status Indicator */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-serif font-bold text-lg text-[#18181B]">
                          {table.tableNumber}
                        </h3>
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-[#64748B] font-mono">
                          {table.area}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-[#64748B] mt-1">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>Kapasitas: <strong className="text-[#18181B]">{table.capacity} Orang</strong></span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase font-mono ${
                        isAvailable
                          ? "bg-emerald-100 text-emerald-800"
                          : isOccupied
                          ? "bg-rose-100 text-rose-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {table.status}
                    </span>
                  </div>

                  {/* QR Token Preview Pill */}
                  <div className="mt-3 bg-[#FDFBF7] p-2.5 rounded-2xl border border-slate-200/60 flex items-center justify-between text-[10px]">
                    <span className="font-mono text-slate-400 truncate max-w-[160px]">
                      {table.qrToken}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleOpenQrModal(table)}
                      className="text-[#EA580C] hover:text-[#C2410C] font-bold flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Preview</span>
                    </button>
                  </div>
                </div>

                {/* Status Quick Changer Selector */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#64748B] font-medium">Ubah Status Meja:</span>
                    {isToggling && (
                      <RefreshCw className="w-3 h-3 animate-spin text-[#EA580C]" />
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      disabled={isToggling || table.status === "available"}
                      onClick={() => handleQuickStatusChange(table.id, "available")}
                      className={`py-1.5 px-1 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
                        table.status === "available"
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-[#64748B]"
                      }`}
                    >
                      Tersedia
                    </button>
                    <button
                      type="button"
                      disabled={isToggling || table.status === "occupied"}
                      onClick={() => handleQuickStatusChange(table.id, "occupied")}
                      className={`py-1.5 px-1 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
                        table.status === "occupied"
                          ? "bg-rose-600 text-white shadow-xs"
                          : "bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-[#64748B]"
                      }`}
                    >
                      Terisi
                    </button>
                    <button
                      type="button"
                      disabled={isToggling || table.status === "reserved"}
                      onClick={() => handleQuickStatusChange(table.id, "reserved")}
                      className={`py-1.5 px-1 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
                        table.status === "reserved"
                          ? "bg-amber-600 text-white shadow-xs"
                          : "bg-slate-100 hover:bg-amber-50 hover:text-amber-700 text-[#64748B]"
                      }`}
                    >
                      Reserved
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenQrModal(table)}
                    className="flex-1 py-2 bg-[#EA580C] hover:bg-[#C2410C] text-white rounded-full text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Cetak Standee</span>
                  </button>

                  <button
                    onClick={() => handleOpenEdit(table)}
                    title="Edit Informasi Meja"
                    className="p-2 bg-slate-100 hover:bg-slate-200 text-[#64748B] hover:text-[#18181B] rounded-full text-xs transition-all cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onRegenerateQr(table.id)}
                    title="Regenerate QR Token Meja"
                    className="p-2 bg-slate-100 hover:bg-slate-200 text-[#64748B] hover:text-[#18181B] rounded-full text-xs transition-all cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL: ADD TABLE */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto my-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-serif font-bold text-[#18181B] text-base">Tambah Meja Baru</h3>
                <p className="text-xs text-[#64748B]">Generate otomatis token QR pemesanan unik</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[#64748B] hover:text-[#18181B] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[#64748B] font-bold mb-1">Nomor / Nama Meja</label>
                <input
                  type="text"
                  placeholder="Contoh: Table 12 / VIP Room 01"
                  value={tableForm.tableNumber}
                  onChange={(e) => setTableForm({ ...tableForm, tableNumber: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/80 focus:border-[#EA580C] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[#64748B] font-bold mb-1">Kapasitas (Pax / Kursi)</label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {["2", "4", "6", "8"].map((cap) => (
                    <button
                      key={cap}
                      type="button"
                      onClick={() => setTableForm({ ...tableForm, capacity: cap })}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        tableForm.capacity === cap
                          ? "bg-[#18181B] text-white border-[#18181B]"
                          : "border-slate-200 text-[#64748B] hover:bg-slate-50"
                      }`}
                    >
                      {cap} Orang
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  placeholder="Atau masukkan angka bebas..."
                  value={tableForm.capacity}
                  onChange={(e) => setTableForm({ ...tableForm, capacity: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200/80 focus:border-[#EA580C] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[#64748B] font-bold mb-1">Zona / Area Restoran</label>
                <select
                  value={tableForm.area}
                  onChange={(e) => setTableForm({ ...tableForm, area: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/80 focus:border-[#EA580C] focus:outline-hidden bg-white"
                >
                  <option value="Indoor">Indoor (Main Dining Hall)</option>
                  <option value="Outdoor">Outdoor Garden Terrace</option>
                  <option value="VIP Room">Private VIP Chamber</option>
                  <option value="Rooftop">Rooftop Skyview</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-full border border-slate-200 text-[#64748B] text-xs font-bold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleCreate}
                disabled={isCreating || !tableForm.tableNumber}
                className="px-5 py-2 rounded-full bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-bold disabled:opacity-50 flex items-center gap-1.5 shadow-md shadow-[#EA580C]/25 cursor-pointer"
              >
                {isCreating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                <span>Simpan Meja</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT TABLE */}
      {showEditModal && editingTable && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto my-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-serif font-bold text-[#18181B] text-base">Edit Data Meja</h3>
                <p className="text-xs text-[#64748B]">{editingTable.tableNumber}</p>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-[#64748B] hover:text-[#18181B] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[#64748B] font-bold mb-1">Nomor / Nama Meja</label>
                <input
                  type="text"
                  value={editForm.tableNumber}
                  onChange={(e) => setEditForm({ ...editForm, tableNumber: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200/80 focus:border-[#EA580C] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[#64748B] font-bold mb-1">Kapasitas (Pax)</label>
                <input
                  type="number"
                  value={editForm.capacity}
                  onChange={(e) => setEditForm({ ...editForm, capacity: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200/80 focus:border-[#EA580C] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[#64748B] font-bold mb-1">Zona / Area</label>
                <select
                  value={editForm.area}
                  onChange={(e) => setEditForm({ ...editForm, area: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200/80 focus:border-[#EA580C] focus:outline-hidden bg-white"
                >
                  <option value="Indoor">Indoor (Main Dining Hall)</option>
                  <option value="Outdoor">Outdoor Garden Terrace</option>
                  <option value="VIP Room">Private VIP Chamber</option>
                  <option value="Rooftop">Rooftop Skyview</option>
                </select>
              </div>

              <div>
                <label className="block text-[#64748B] font-bold mb-1">Status Ketersediaan</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200/80 focus:border-[#EA580C] focus:outline-hidden bg-white"
                >
                  <option value="available">Tersedia (Ready for Guest)</option>
                  <option value="occupied">Terisi (Dining in Progress)</option>
                  <option value="reserved">Reserved (Disiapkan untuk Reservasi)</option>
                  <option value="maintenance">Maintenance / Sanitasi</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 rounded-full border border-slate-200 text-[#64748B] text-xs font-bold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={isUpdating}
                className="px-5 py-2 rounded-full bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-bold disabled:opacity-50 flex items-center gap-1.5 shadow-md shadow-[#EA580C]/25 cursor-pointer"
              >
                {isUpdating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                <span>Simpan Perubahan</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: LUXURY PRINTABLE QR STANDEE PREVIEW */}
      {selectedTableQr && qrDataUrl && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 space-y-5 my-auto border border-slate-200/80">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-serif font-bold text-lg text-[#18181B]">
                  Standee QR Akrilik Meja
                </h3>
                <p className="text-xs text-[#64748B]">Preview cetak fisik meja pelanggan</p>
              </div>
              <button
                onClick={() => setSelectedTableQr(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-[#64748B] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Card Frame (Luxury Acrylic Standee Aesthetic) */}
            <div className="bg-gradient-to-b from-[#18181B] via-[#27272A] to-[#18181B] text-white p-6 rounded-3xl shadow-xl text-center space-y-4 border border-amber-500/30 relative overflow-hidden">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#EA580C] font-bold block">
                  HAUTE CUISINE & COCKTAILS
                </span>
                <h4 className="font-serif text-2xl font-bold tracking-tight text-white">
                  SAVOR<span className="text-[#EA580C]">IA</span>
                </h4>
              </div>

              {/* Table Number Badge */}
              <div className="inline-block bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20">
                <span className="font-mono text-sm font-bold text-amber-300">
                  {selectedTableQr.tableNumber} • {selectedTableQr.area}
                </span>
              </div>

              {/* QR Code Container */}
              <div className="bg-white p-3.5 rounded-2xl inline-block shadow-lg shadow-black/40">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrDataUrl}
                  alt={`QR ${selectedTableQr.tableNumber}`}
                  className="w-52 h-52 object-contain mx-auto"
                />
              </div>

              <div className="space-y-1 pt-1">
                <p className="text-xs font-bold text-white tracking-wide">
                  PINDAI UNTUK PESAN & BAYAR INSTAN
                </p>
                <p className="text-[10px] text-slate-300 leading-relaxed max-w-[260px] mx-auto">
                  Arahkan kamera smartphone Anda ke QR Code untuk membuka katalog menu & memesan langsung tanpa antre.
                </p>
              </div>

              <div className="pt-2 border-t border-white/10 flex items-center justify-center gap-4 text-[10px] text-slate-400 font-mono">
                <span>WiFi: SAVORIA-GUEST</span>
                <span>Pass: savoria2026</span>
              </div>
            </div>

            {/* Actions: Download & Print */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-[#18181B] rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Standee</span>
              </button>
              <a
                href={qrDataUrl}
                download={`SAVORIA-Standee-${selectedTableQr.tableNumber.replace(/\s+/g, "-")}.png`}
                className="flex-1 py-2.5 bg-[#EA580C] hover:bg-[#C2410C] text-white rounded-full text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-[#EA580C]/25 transition-all text-center"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Gambar (.png)</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
