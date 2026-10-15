"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  X,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  Sparkles,
  UtensilsCrossed,
} from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import { formatIDR } from "@/lib/utils";
import { DishImage } from "@/components/ui/DishImage";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  const isStaff = Boolean(user && (user.role === "admin" || user.role === "kasir"));

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const orig = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = orig;
    };
  }, [isOpen]);

  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    getSubtotal,
    getTax,
    getService,
    getTotal,
  } = useCartStore();

  if (!mounted || !isOpen) return null;

  const totalItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = getSubtotal();
  const tax = getTax();
  const service = getService();
  const grandTotal = getTotal();

  const handleCheckoutReservation = () => {
    if (isStaff) {
      toast.warning(
        "Akun Admin & Kasir tidak dapat memproses booking reservasi. Gunakan akun pelanggan untuk memesan meja.",
        "Akses Terbatas"
      );
      return;
    }
    onClose();
    router.push("/reservation");
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] overflow-hidden animate-fadeIn">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
      />

      {/* Slide-over Drawer */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FDFBF7] shadow-2xl border-l border-slate-200/80 flex flex-col justify-between z-10 animate-slideInRight">
          {/* Header */}
          <div className="p-5 sm:p-6 bg-white border-b border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-[#EA580C]/10 text-[#EA580C] flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base text-[#18181B]">
                  Keranjang Pesanan Anda
                </h3>
                <p className="text-xs text-[#64748B]">
                  {totalItemsCount} item terpilih
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-100 text-[#64748B] hover:text-[#18181B] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-16 space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                  <UtensilsCrossed className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-serif font-bold text-base text-[#18181B]">
                    Keranjang Masih Kosong
                  </h4>
                  <p className="text-xs text-[#64748B] max-w-xs leading-relaxed">
                    Belum ada hidangan yang dipilih. Jelajahi menu Chef kami dan tambahkan kuliner favorit Anda.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-full bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-bold shadow-md shadow-[#EA580C]/25 transition-all cursor-pointer"
                >
                  Jelajahi Menu Lezat
                </button>
              </div>
            ) : (
              items.map((item) => {
                const variantExtra = (item.selectedVariants || []).reduce(
                  (sum, v) => sum + (v.extraPrice || 0),
                  0
                );
                const unitPrice = item.price + variantExtra;
                const itemTotal = unitPrice * item.quantity;

                return (
                  <div
                    key={item.id}
                    className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs flex gap-3.5 items-start relative group hover:border-[#EA580C]/40 transition-all"
                  >
                    {/* Item Image */}
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                      <DishImage
                        src={item.image || "/images/placeholder-dish.jpg"}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-serif font-bold text-xs sm:text-sm text-[#18181B] line-clamp-1">
                          {item.name}
                        </h4>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer shrink-0"
                          title="Hapus hidangan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Variants if any */}
                      {item.selectedVariants && item.selectedVariants.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {item.selectedVariants.map((v, vIdx) => (
                            <span
                              key={vIdx}
                              className="text-[9px] font-mono bg-slate-100 text-[#64748B] px-1.5 py-0.5 rounded-md"
                            >
                              {v.option}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Price & Quantity Controls */}
                      <div className="flex items-center justify-between pt-1">
                        <span className="font-mono font-bold text-xs text-[#EA580C]">
                          {formatIDR(itemTotal)}
                        </span>

                        <div className="flex items-center gap-1.5 bg-slate-100 rounded-full p-1">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, -1)}
                            className="w-5 h-5 rounded-full bg-white text-[#18181B] hover:bg-slate-200 flex items-center justify-center text-xs font-bold shadow-xs cursor-pointer"
                          >
                            <Minus className="w-2.5 h-2.5" />
                          </button>
                          <span className="font-mono text-xs font-bold px-1.5 min-w-[16px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, 1)}
                            className="w-5 h-5 rounded-full bg-[#EA580C] text-white hover:bg-[#C2410C] flex items-center justify-center text-xs font-bold shadow-xs cursor-pointer"
                          >
                            <Plus className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Breakdown & Checkout CTA */}
          {items.length > 0 && (
            <div className="p-5 sm:p-6 bg-white border-t border-slate-200/80 space-y-3.5 shadow-lg">
              {/* Clear Cart */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#64748B] font-semibold">Rincian Tagihan</span>
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-[11px] text-rose-600 hover:text-rose-700 font-semibold cursor-pointer"
                >
                  Kosongkan Keranjang
                </button>
              </div>

              {/* Price Details */}
              <div className="space-y-1.5 text-xs text-[#64748B] border-y border-slate-100 py-2.5">
                <div className="flex justify-between">
                  <span>Subtotal ({totalItemsCount} porsi)</span>
                  <span className="font-mono text-[#18181B] font-semibold">{formatIDR(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pajak Restoran (PB1 10%)</span>
                  <span className="font-mono text-[#18181B] font-semibold">{formatIDR(tax)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Biaya Layanan (Service 5%)</span>
                  <span className="font-mono text-[#18181B] font-semibold">{formatIDR(service)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-[#18181B] pt-1.5 border-t border-slate-100">
                  <span className="font-serif">Total Pembayaran</span>
                  <span className="font-mono text-base text-[#EA580C]">{formatIDR(grandTotal)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                {!isStaff ? (
                  <button
                    type="button"
                    onClick={handleCheckoutReservation}
                    className="w-full py-3 bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold rounded-full text-xs flex items-center justify-center gap-2 shadow-md shadow-[#EA580C]/25 transition-all cursor-pointer"
                  >
                    <span>Lanjut ke Reservasi & Pilih Meja</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <div className="p-2.5 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-[11px] text-center">
                    Akun Staf tidak dapat membooking meja. Silakan gunakan dashboard staf.
                  </div>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-[#64748B] hover:text-[#18181B] font-semibold rounded-full text-xs transition-colors cursor-pointer"
                >
                  Tambah Hidangan Lain
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
