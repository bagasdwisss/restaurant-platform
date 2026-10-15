"use client";

import React from "react";
import { X, Plus, Minus } from "lucide-react";
import { formatIDR } from "@/lib/utils";

interface Option {
  id: number;
  name: string;
  price: number;
}

interface ModifierGroup {
  id: number;
  name: string;
  minSelection: number;
  maxSelection: number;
  options: Option[];
}

interface MenuItem {
  id: number;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  isAvailable: boolean;
  modifierGroups: ModifierGroup[];
}

interface TableMenuCustomizerModalProps {
  selectedMenu: MenuItem | null;
  customModifiers: Record<number, number[]>;
  itemNotes: string;
  itemQty: number;
  onClose: () => void;
  onToggleModifierOption: (group: ModifierGroup, optionId: number) => void;
  onChangeNotes: (notes: string) => void;
  onChangeQty: (qty: number) => void;
  onAddToCart: () => void;
  unitPrice: number;
}

export function TableMenuCustomizerModal({
  selectedMenu,
  customModifiers,
  itemNotes,
  itemQty,
  onClose,
  onToggleModifierOption,
  onChangeNotes,
  onChangeQty,
  onAddToCart,
  unitPrice,
}: TableMenuCustomizerModalProps) {
  if (!selectedMenu) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="relative p-5 border-b border-slate-100 flex items-start justify-between">
          <div>
            <h3 className="font-serif font-bold text-[#18181B] text-base">{selectedMenu.name}</h3>
            <p className="font-serif font-bold text-[#EA580C] text-base mt-0.5">
              {formatIDR(selectedMenu.price)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-[#64748B] hover:text-[#18181B] flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modifiers Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {selectedMenu.description && (
            <p className="text-xs text-[#64748B] leading-relaxed bg-[#FDFBF7] p-3 rounded-2xl border border-slate-200/80">
              {selectedMenu.description}
            </p>
          )}

          {selectedMenu.modifierGroups.map((group) => (
            <div key={group.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#18181B] font-serif">
                  {group.name}
                </h4>
                <span className="text-[11px] text-[#64748B] font-medium">
                  {group.maxSelection === 1 ? "Pilih 1 Opsi" : `Maksimal ${group.maxSelection}`}
                </span>
              </div>

              <div className="space-y-2">
                {group.options.map((opt) => {
                  const isSelected = (customModifiers[group.id] || []).includes(opt.id);
                  return (
                    <div
                      key={opt.id}
                      onClick={() => onToggleModifierOption(group, opt.id)}
                      className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                        isSelected
                          ? "border-[#EA580C] bg-[#EA580C]/5 text-[#18181B]"
                          : "border-slate-200 hover:border-slate-300 text-[#64748B]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-4 h-4 rounded-full flex items-center justify-center border ${
                            isSelected
                              ? "border-[#EA580C] bg-[#EA580C] text-white"
                              : "border-slate-300"
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                        </div>
                        <span className="text-xs font-semibold text-[#18181B]">{opt.name}</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-[#18181B]">
                        {opt.price > 0 ? `+${formatIDR(opt.price)}` : "Gratis"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Special Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[#18181B] font-serif">
              Catatan Khusus (Opsional)
            </label>
            <textarea
              rows={2}
              placeholder="Contoh: Saus dipisah, kurangi gula..."
              value={itemNotes}
              onChange={(e) => onChangeNotes(e.target.value)}
              className="w-full text-xs p-3 border border-slate-200/80 rounded-2xl focus:ring-2 focus:ring-[#EA580C] focus:outline-none"
            />
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs font-bold text-[#18181B] uppercase font-serif">Jumlah Porsi</span>
            <div className="flex items-center gap-3 bg-[#FDFBF7] border border-slate-200/80 rounded-full p-1">
              <button
                type="button"
                onClick={() => onChangeQty(Math.max(1, itemQty - 1))}
                className="w-8 h-8 rounded-full bg-white text-[#18181B] hover:bg-slate-100 flex items-center justify-center font-bold shadow-2xs cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-6 text-center font-bold text-sm text-[#18181B] font-mono">
                {itemQty}
              </span>
              <button
                type="button"
                onClick={() => onChangeQty(itemQty + 1)}
                className="w-8 h-8 rounded-full bg-white text-[#18181B] hover:bg-slate-100 flex items-center justify-center font-bold shadow-2xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer Add button */}
        <div className="p-5 border-t border-slate-100 bg-white">
          <button
            type="button"
            onClick={onAddToCart}
            className="w-full bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold py-3.5 rounded-full flex items-center justify-between px-6 shadow-md shadow-[#EA580C]/25 active:scale-[0.98] transition-transform cursor-pointer"
          >
            <span>Tambahkan ke Keranjang</span>
            <span className="font-mono">{formatIDR(unitPrice * itemQty)}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
