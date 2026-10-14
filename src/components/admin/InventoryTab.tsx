"use client";

import React, { useState } from "react";
import { AlertTriangle, Plus, X, Package } from "lucide-react";

interface InventoryTabProps {
  ingredients: any[];
  onRestock: (ingredientId: number, amount: number) => Promise<boolean>;
}

export function InventoryTab({ ingredients, onRestock }: InventoryTabProps) {
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<any>(null);
  const [restockAmount, setRestockAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

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

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#18181B]">
            Inventaris Bahan Baku & Resep Menu
          </h2>
          <p className="text-xs text-[#64748B]">
            Stok bahan otomatis terpotong saat status pesanan dikonfirmasi oleh kasir atau dapur.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ingredients.length === 0 ? (
          <div className="col-span-full py-12 text-center text-[#64748B] bg-white rounded-3xl border border-slate-200/80">
            <Package className="w-8 h-8 mx-auto text-stone-300 mb-2" />
            <p className="text-xs">Belum ada data inventaris bahan baku.</p>
          </div>
        ) : (
          ingredients.map((ing) => {
            const isLowStock = ing.stockQuantity <= ing.minStock;

            return (
              <div
                key={ing.id}
                className={`bg-white rounded-3xl border p-5 shadow-sm space-y-3.5 ${
                  isLowStock ? "border-rose-300 bg-rose-50/20" : "border-slate-200/80"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-serif font-bold text-base text-[#18181B]">{ing.name}</h3>
                    <p className="text-xs text-[#64748B]">Satuan Ukur: {ing.unit}</p>
                  </div>
                  {isLowStock && (
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      <span>Hampir Habis</span>
                    </span>
                  )}
                </div>

                <div className="bg-[#FDFBF7] p-3 rounded-2xl border border-slate-200/80 flex justify-between items-center text-xs">
                  <div>
                    <span className="text-[#64748B] block text-[10px]">Stok Tersisa:</span>
                    <span className="font-mono font-bold text-base text-[#18181B]">
                      {ing.stockQuantity} {ing.unit}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[#64748B] block text-[10px]">Batas Aman:</span>
                    <span className="font-mono font-semibold text-[#64748B]">
                      {ing.minStock} {ing.unit}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedIngredient(ing);
                    setShowRestockModal(true);
                  }}
                  className="w-full py-2.5 bg-[#EA580C]/10 hover:bg-[#EA580C] text-[#EA580C] hover:text-white font-bold rounded-full text-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Stok (Restock)</span>
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL: RESTOCK INGREDIENT */}
      {showRestockModal && selectedIngredient && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl space-y-4">
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

            <form onSubmit={handleRestockSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#18181B] block mb-1">
                  Jumlah Tambahan ({selectedIngredient.unit}):
                </label>
                <input
                  type="number"
                  required
                  step="any"
                  placeholder="Contoh: 5000"
                  value={restockAmount}
                  onChange={(e) => setRestockAmount(e.target.value)}
                  className="w-full text-xs p-3 border border-slate-200/80 rounded-2xl font-mono"
                />
                <p className="text-[11px] text-[#64748B] mt-1 font-mono">
                  Stok saat ini: {selectedIngredient.stockQuantity} {selectedIngredient.unit}
                </p>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold py-3 rounded-full text-xs transition-all shadow-md shadow-[#EA580C]/25 cursor-pointer disabled:opacity-50"
              >
                {submitting ? "Memperbarui..." : "Simpan Penambahan Stok"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
