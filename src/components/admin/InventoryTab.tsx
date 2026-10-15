"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  Plus,
  X,
  Package,
  RefreshCw,
  Search,
  CheckCircle2,
  ShieldAlert,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";

interface InventoryTabProps {
  ingredients: any[];
  onRestock: (ingredientId: number, amount: number) => Promise<boolean>;
  onCreateIngredient?: (form: any) => Promise<boolean>;
}

export function InventoryTab({
  ingredients,
  onRestock,
  onCreateIngredient,
}: InventoryTabProps) {
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<any>(null);
  const [restockAmount, setRestockAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Quick Restock state per item
  const [quickRestockingId, setQuickRestockingId] = useState<number | null>(null);

  // Create Ingredient Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    unit: "gram",
    stockQuantity: "100",
    minStock: "20",
  });
  const [isCreating, setIsCreating] = useState(false);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedUnit, setSelectedUnit] = useState("all");

  const handleRestockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIngredient || !restockAmount) return;
    setSubmitting(true);
    const success = await onRestock(selectedIngredient.id, parseFloat(restockAmount));
    setSubmitting(false);
    if (success) {
      setShowRestockModal(false);
      setSelectedIngredient(null);
      setRestockAmount("");
    }
  };

  const handleQuickRestock = async (ingredientId: number, amount: number) => {
    setQuickRestockingId(ingredientId);
    try {
      await onRestock(ingredientId, amount);
    } finally {
      setQuickRestockingId(null);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onCreateIngredient) return;
    setIsCreating(true);
    try {
      const success = await onCreateIngredient({
        name: createForm.name,
        unit: createForm.unit,
        stockQuantity: parseFloat(createForm.stockQuantity) || 0,
        minStock: parseFloat(createForm.minStock) || 10,
      });
      if (success) {
        setShowCreateModal(false);
        setCreateForm({ name: "", unit: "gram", stockQuantity: "100", minStock: "20" });
      }
    } finally {
      setIsCreating(false);
    }
  };

  // Metrics
  const totalItems = ingredients.length;
  const criticalItems = ingredients.filter((i) => i.stockQuantity <= i.minStock).length;
  const healthyItems = totalItems - criticalItems;
  const availableUnits = Array.from(new Set(ingredients.map((i) => i.unit))).filter(Boolean);

  // Filtered List
  const filteredIngredients = ingredients.filter((ing) => {
    const matchesSearch = ing.name.toLowerCase().includes(searchQuery.toLowerCase());
    const isCritical = ing.stockQuantity <= ing.minStock;
    const matchesStatus =
      selectedStatus === "all" ||
      (selectedStatus === "critical" && isCritical) ||
      (selectedStatus === "safe" && !isCritical);
    const matchesUnit = selectedUnit === "all" || ing.unit === selectedUnit;
    return matchesSearch && matchesStatus && matchesUnit;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-2xl font-bold text-[#18181B]">
              Inventaris Bahan Baku & Stok Dapur
            </h2>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold">
              <Sparkles className="w-3 h-3" /> Auto-Deduct Recipe Engine
            </span>
          </div>
          <p className="text-xs text-[#64748B]">
            Stok bahan otomatis terpotong saat pesanan diselesaikan di kasir atau status pesanan dikonfirmasi oleh kitchen.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-5 py-2.5 bg-[#EA580C] hover:bg-[#C2410C] text-white rounded-full text-xs font-bold flex items-center gap-1.5 shadow-md shadow-[#EA580C]/25 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Bahan Baku</span>
        </button>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-[#64748B] block">Total Jenis Bahan</span>
          <span className="font-serif text-2xl font-bold text-[#18181B]">{totalItems}</span>
          <p className="text-[10px] text-[#64748B]">Bahan terdaftar di resep</p>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-emerald-700 block">Stok Aman</span>
          <div className="flex items-center gap-2">
            <span className="font-serif text-2xl font-bold text-emerald-700">{healthyItems}</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
              Optimal
            </span>
          </div>
          <p className="text-[10px] text-emerald-600">Di atas batas minimum</p>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-rose-700 block">Stok Kritis / Menipis</span>
          <div className="flex items-center gap-2">
            <span className="font-serif text-2xl font-bold text-rose-700">{criticalItems}</span>
            <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold">
              Warning
            </span>
          </div>
          <p className="text-[10px] text-rose-600">Perlu restock segera</p>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-[#64748B] block">Kesehatan Stok</span>
          <span className="font-serif text-2xl font-bold text-[#18181B]">
            {totalItems > 0 ? Math.round((healthyItems / totalItems) * 100) : 100}%
          </span>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1">
            <div
              style={{ width: `${totalItems > 0 ? Math.round((healthyItems / totalItems) * 100) : 100}%` }}
              className="bg-emerald-500 h-full rounded-full transition-all"
            />
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama bahan baku dapur..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200/80 rounded-full text-xs font-medium focus:outline-hidden focus:border-[#EA580C] focus:bg-white transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Status Pills */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-full text-[11px] font-semibold">
            {[
              { id: "all", label: "Semua Bahan" },
              { id: "safe", label: "Stok Aman" },
              { id: "critical", label: "Kritis / Habis" },
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

          {/* Unit Filter */}
          {availableUnits.length > 0 && (
            <select
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200/80 rounded-full text-xs font-semibold text-[#64748B] focus:outline-hidden"
            >
              <option value="all">Semua Satuan ({availableUnits.length})</option>
              {availableUnits.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Grid Ingredients Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredIngredients.length === 0 ? (
          <div className="col-span-full py-12 text-center text-[#64748B] bg-white rounded-3xl border border-slate-200/80">
            <Package className="w-8 h-8 mx-auto text-stone-300 mb-2" />
            <p className="text-xs">Tidak ada bahan baku yang cocok dengan filter Anda.</p>
          </div>
        ) : (
          filteredIngredients.map((ing) => {
            const isLowStock = ing.stockQuantity <= ing.minStock;
            const healthRatio = ing.minStock > 0 ? (ing.stockQuantity / ing.minStock) : 1;
            const healthPercent = Math.min(Math.round(healthRatio * 100), 100);
            const isQuickRestocking = quickRestockingId === ing.id;

            return (
              <div
                key={ing.id}
                className={`bg-white rounded-3xl border p-5 shadow-xs space-y-4 hover:shadow-md transition-all flex flex-col justify-between ${
                  isLowStock ? "border-rose-300 bg-rose-50/20" : "border-slate-200/80"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-serif font-bold text-base text-[#18181B]">{ing.name}</h3>
                      <p className="text-xs text-[#64748B] mt-0.5">Satuan Ukur: <strong className="text-[#18181B]">{ing.unit}</strong></p>
                    </div>
                    {isLowStock ? (
                      <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold flex items-center gap-1 font-mono">
                        <AlertTriangle className="w-3 h-3 text-rose-600" />
                        <span>Kritis</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1 font-mono">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Aman</span>
                      </span>
                    )}
                  </div>

                  {/* Stock Metrics Card */}
                  <div className="bg-[#FDFBF7] p-3.5 rounded-2xl border border-slate-200/80 mt-3 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <div>
                        <span className="text-[#64748B] block text-[10px]">Stok Tersisa:</span>
                        <span className={`font-mono font-bold text-lg ${isLowStock ? "text-rose-600" : "text-[#18181B]"}`}>
                          {ing.stockQuantity} <span className="text-xs font-normal text-[#64748B]">{ing.unit}</span>
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[#64748B] block text-[10px]">Batas Minimum:</span>
                        <span className="font-mono font-semibold text-xs text-[#64748B]">
                          {ing.minStock} {ing.unit}
                        </span>
                      </div>
                    </div>

                    {/* Stock Level Bar */}
                    <div className="w-full bg-slate-200/70 h-2 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${healthPercent}%` }}
                        className={`h-full rounded-full transition-all ${
                          isLowStock ? "bg-rose-500" : healthRatio < 1.5 ? "bg-amber-500" : "bg-emerald-500"
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Quick Presets & Restock Action */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#64748B] font-medium">Quick Restock:</span>
                    {isQuickRestocking && (
                      <RefreshCw className="w-3 h-3 animate-spin text-[#EA580C]" />
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[10, 50, 100].map((qty) => (
                      <button
                        key={qty}
                        type="button"
                        disabled={isQuickRestocking}
                        onClick={() => handleQuickRestock(ing.id, qty)}
                        className="py-1.5 px-1 bg-slate-100 hover:bg-[#EA580C]/10 hover:text-[#EA580C] text-[#18181B] font-mono font-bold rounded-xl text-xs transition-all cursor-pointer disabled:opacity-50"
                      >
                        +{qty} {ing.unit}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      setSelectedIngredient(ing);
                      setShowRestockModal(true);
                    }}
                    className="w-full py-2 bg-[#EA580C]/10 hover:bg-[#EA580C] text-[#EA580C] hover:text-white font-bold rounded-full text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Nominal Kustom</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL: RESTOCK INGREDIENT */}
      {showRestockModal && selectedIngredient && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto my-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-serif font-bold text-[#18181B] text-base">Restock Bahan Baku</h3>
                <p className="text-xs text-[#64748B]">{selectedIngredient.name}</p>
              </div>
              <button
                onClick={() => setShowRestockModal(false)}
                className="text-[#64748B] hover:text-[#18181B] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRestockSubmit} className="space-y-4 text-xs">
              <div className="bg-[#FDFBF7] p-3 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                <span className="text-[#64748B]">Stok Saat Ini:</span>
                <span className="font-mono font-bold text-sm text-[#18181B]">
                  {selectedIngredient.stockQuantity} {selectedIngredient.unit}
                </span>
              </div>

              <div>
                <label className="block text-[#64748B] font-bold mb-1">
                  Jumlah Penambahan ({selectedIngredient.unit})
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder={`Contoh: 50 atau 100`}
                  value={restockAmount}
                  onChange={(e) => setRestockAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/80 focus:border-[#EA580C] focus:outline-hidden text-sm font-mono font-bold"
                  autoFocus
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowRestockModal(false)}
                  className="px-4 py-2 rounded-full border border-slate-200 text-[#64748B] text-xs font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting || !restockAmount}
                  className="px-5 py-2 rounded-full bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-bold disabled:opacity-50 flex items-center gap-1.5 shadow-md shadow-[#EA580C]/25 cursor-pointer"
                >
                  {submitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>Tambah Stok</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE NEW INGREDIENT */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto my-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-serif font-bold text-[#18181B] text-base">Tambah Bahan Baku Baru</h3>
                <p className="text-xs text-[#64748B]">Daftarkan komoditas bahan baku dapur</p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-[#64748B] hover:text-[#18181B] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[#64748B] font-bold mb-1">Nama Bahan Baku</label>
                <input
                  type="text"
                  placeholder="Contoh: Daging Wagyu A5, Black Truffle"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/80 focus:border-[#EA580C] focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-[#64748B] font-bold mb-1">Satuan Ukuran</label>
                <select
                  value={createForm.unit}
                  onChange={(e) => setCreateForm({ ...createForm, unit: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/80 focus:border-[#EA580C] focus:outline-hidden bg-white"
                >
                  <option value="gram">gram (g)</option>
                  <option value="kg">kilogram (kg)</option>
                  <option value="ml">mililiter (ml)</option>
                  <option value="liter">liter (L)</option>
                  <option value="pcs">pieces / butir (pcs)</option>
                  <option value="lembar">lembar / slice</option>
                  <option value="porsi">porsi standard</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#64748B] font-bold mb-1">Stok Awal</label>
                  <input
                    type="number"
                    step="any"
                    value={createForm.stockQuantity}
                    onChange={(e) => setCreateForm({ ...createForm, stockQuantity: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200/80 focus:border-[#EA580C] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[#64748B] font-bold mb-1">Batas Minimum</label>
                  <input
                    type="number"
                    step="any"
                    value={createForm.minStock}
                    onChange={(e) => setCreateForm({ ...createForm, minStock: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200/80 focus:border-[#EA580C] focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-full border border-slate-200 text-[#64748B] text-xs font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isCreating || !createForm.name}
                  className="px-5 py-2 rounded-full bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-bold disabled:opacity-50 flex items-center gap-1.5 shadow-md shadow-[#EA580C]/25 cursor-pointer"
                >
                  {isCreating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>Simpan Bahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
