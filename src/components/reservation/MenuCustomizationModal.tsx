"use client";

import React from "react";
import { X, Sparkles, Plus } from "lucide-react";
import { MenuItem } from "./types";
import { formatIDR } from "@/lib/utils";

interface MenuCustomizationModalProps {
  customizingMenu: MenuItem;
  selectedModifiers: Record<number, number[]>;
  itemNotes: string;
  onToggleModifier: (groupId: number, optionId: number, maxSelection: number) => void;
  onChangeNotes: (notes: string) => void;
  onConfirm: () => void;
  onClose: () => void;
}

export function MenuCustomizationModal({
  customizingMenu,
  selectedModifiers,
  itemNotes,
  onToggleModifier,
  onChangeNotes,
  onConfirm,
  onClose,
}: MenuCustomizationModalProps) {
  // Calculate extra cost
  const variantsList: { group: string; option: string; extraPrice: number }[] = [];
  customizingMenu.modifierGroups?.forEach((group) => {
    const selectedIds = selectedModifiers[group.id] || [];
    selectedIds.forEach((optId) => {
      const opt = group.options?.find((o: any) => o.id === optId);
      if (opt) {
        variantsList.push({
          group: group.name,
          option: opt.name,
          extraPrice: opt.price,
        });
      }
    });
  });

  const extraTotal = variantsList.reduce((sum, v) => sum + v.extraPrice, 0);
  const totalItemPrice = customizingMenu.price + extraTotal;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-[#EA580C] bg-[#EA580C]/10 px-2 py-0.5 rounded-full">
              Kustomisasi Hidangan
            </span>
            <h3 className="font-serif font-bold text-lg text-[#18181B] mt-1">
              {customizingMenu.name}
            </h3>
            <p className="text-xs text-[#64748B] mt-0.5 font-medium">
              Harga dasar: <span className="font-mono text-[#18181B] font-bold">{formatIDR(customizingMenu.price)}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-[#64748B] hover:text-[#18181B] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modifier Groups */}
        <div className="space-y-4">
          {customizingMenu.modifierGroups?.map((group: any) => {
            const isSingle = group.maxSelection === 1;
            const currentSelected = selectedModifiers[group.id] || [];

            return (
              <div key={group.id} className="p-3.5 bg-slate-50/70 border border-slate-200/80 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-[#18181B] flex items-center gap-1.5">
                      <span>{group.name}</span>
                      {group.minSelection > 0 && (
                        <span className="text-[9px] bg-rose-100 text-rose-700 px-1.5 py-0.2 rounded-full font-bold">
                          Wajib
                        </span>
                      )}
                    </h4>
                    <p className="text-[10px] text-[#64748B]">
                      {isSingle
                        ? "Pilih 1 opsi"
                        : `Maksimal ${group.maxSelection || "bebas"} pilihan`}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {group.options?.map((opt: any) => {
                    const isSelected = currentSelected.includes(opt.id);

                    return (
                      <button
                        type="button"
                        key={opt.id}
                        onClick={() => onToggleModifier(group.id, opt.id, group.maxSelection)}
                        className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#EA580C]/10 border-[#EA580C] text-[#EA580C] shadow-xs"
                            : "bg-white border-slate-200/80 text-[#18181B] hover:border-slate-300"
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <p className="text-xs font-semibold truncate">{opt.name}</p>
                          <p className="text-[10px] font-mono opacity-80">
                            {opt.price > 0 ? `+${formatIDR(opt.price)}` : "Termasuk"}
                          </p>
                        </div>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected
                              ? "bg-[#EA580C] border-[#EA580C] text-white"
                              : "border-slate-300 bg-white"
                          }`}
                        >
                          {isSelected && <span className="text-[9px] font-bold">✓</span>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Special Cooking Notes */}
          <div className="p-3.5 bg-slate-50/70 border border-slate-200/80 rounded-2xl space-y-1.5">
            <label className="text-xs font-bold text-[#18181B] block">
              Catatan Khusus ke Chef
            </label>
            <textarea
              rows={2}
              value={itemNotes}
              onChange={(e) => onChangeNotes(e.target.value)}
              placeholder="Contoh: Kurangi garam, saus dipisah, tanpa bawang..."
              className="w-full text-xs p-2.5 bg-white border border-slate-200/80 rounded-xl focus:ring-2 focus:ring-[#EA580C] focus:outline-none"
            />
          </div>
        </div>

        {/* Footer Confirmation */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-3 gap-3">
          <div>
            <span className="text-[10px] text-[#64748B] block">Total Item Ini:</span>
            <span className="font-mono font-bold text-sm text-[#EA580C]">
              {formatIDR(totalItemPrice)}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-full border border-slate-200 text-xs font-semibold text-[#64748B] hover:bg-slate-100 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="px-5 py-2.5 rounded-full bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-bold shadow-md shadow-[#EA580C]/25 flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambahkan ke Keranjang</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
