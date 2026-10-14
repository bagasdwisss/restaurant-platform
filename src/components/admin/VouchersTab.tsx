"use client";

import React, { useState } from "react";
import {
  Ticket,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Calendar,
  Clock,
  Trash2,
  RefreshCw,
  Users,
  Percent,
  DollarSign,
  Copy,
  Check,
  Sparkles,
  Info,
} from "lucide-react";
import { formatIDR, formatDate } from "@/lib/utils";

export interface VoucherItem {
  id: string;
  code: string;
  name: string;
  discountType: "percentage" | "fixed" | string;
  discountValue: number;
  minSpend: number;
  maxDiscount?: number | null;
  maxUsage: number;
  usedCount: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  createdAt: string;
  _count?: {
    orders: number;
  };
}

interface VouchersTabProps {
  vouchers: VoucherItem[];
  isLoading: boolean;
  onRefresh: () => void;
  onCreateVoucher: (data: any) => Promise<boolean>;
  onToggleVoucher: (id: string, currentActive: boolean) => Promise<boolean>;
  onDeleteVoucher: (id: string) => Promise<boolean>;
}

export function VouchersTab({
  vouchers = [],
  isLoading,
  onRefresh,
  onCreateVoucher,
  onToggleVoucher,
  onDeleteVoucher,
}: VouchersTabProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "EXHAUSTED" | "EXPIRED">("ALL");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Create Form State
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [discountValue, setDiscountValue] = useState<number | "">(20);
  const [minSpend, setMinSpend] = useState<number | "">(0);
  const [maxDiscount, setMaxDiscount] = useState<number | "">("");
  const [maxUsage, setMaxUsage] = useState<number | "">(10);
  const [validUntil, setValidUntil] = useState(() => {
    const nextMonth = new Date();
    nextMonth.setDate(nextMonth.getDate() + 30);
    return nextMonth.toISOString().split("T")[0];
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleCopy = (voucherCode: string) => {
    navigator.clipboard.writeText(voucherCode);
    setCopiedCode(voucherCode);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!code.trim() || !name.trim()) {
      setErrorMessage("Kode voucher dan nama promo wajib diisi.");
      return;
    }

    if (!discountValue || Number(discountValue) <= 0) {
      setErrorMessage("Nilai diskon harus lebih besar dari 0.");
      return;
    }

    if (discountType === "percentage" && Number(discountValue) > 100) {
      setErrorMessage("Diskon persentase tidak boleh lebih dari 100%.");
      return;
    }

    if (!maxUsage || Number(maxUsage) <= 0) {
      setErrorMessage("Batas kuota penggunaan minimal 1.");
      return;
    }

    if (!validUntil) {
      setErrorMessage("Tanggal akhir masa berlaku wajib dipilih.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        code: code.trim().toUpperCase(),
        name: name.trim(),
        discountType,
        discountValue: Number(discountValue),
        minSpend: minSpend ? Number(minSpend) : 0,
        maxDiscount: maxDiscount ? Number(maxDiscount) : null,
        maxUsage: Number(maxUsage),
        validUntil: new Date(`${validUntil}T23:59:59`).toISOString(),
      };

      const success = await onCreateVoucher(payload);
      if (success) {
        setShowCreateModal(false);
        // Reset form
        setCode("");
        setName("");
        setDiscountType("percentage");
        setDiscountValue(20);
        setMinSpend(0);
        setMaxDiscount("");
        setMaxUsage(10);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Gagal membuat voucher.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter vouchers
  const now = new Date();
  const filteredVouchers = vouchers.filter((v) => {
    const matchSearch =
      v.code.toLowerCase().includes(search.toLowerCase()) ||
      v.name.toLowerCase().includes(search.toLowerCase());

    if (!matchSearch) return false;

    const isExpired = new Date(v.validUntil) < now;
    const isExhausted = v.usedCount >= v.maxUsage;

    if (statusFilter === "ACTIVE") return v.isActive && !isExpired && !isExhausted;
    if (statusFilter === "EXHAUSTED") return isExhausted;
    if (statusFilter === "EXPIRED") return isExpired;
    return true;
  });

  // Summary Metrics
  const activeCount = vouchers.filter(
    (v) => v.isActive && new Date(v.validUntil) >= now && v.usedCount < v.maxUsage
  ).length;
  const totalUsed = vouchers.reduce((acc, v) => acc + (v.usedCount || 0), 0);
  const exhaustedCount = vouchers.filter((v) => v.usedCount >= v.maxUsage).length;

  return (
    <div className="space-y-6">
      {/* Header and Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif font-bold text-xl sm:text-2xl text-[#18181B] flex items-center gap-2">
            <Ticket className="w-6 h-6 text-[#EA580C]" />
            Manajemen Voucher & Promo Diskon
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Atur kode promo, batas kuota (cth: 10 pemakai), nominal / persentase diskon, dan tanggal masa aktif.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onRefresh}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-[#64748B] transition-all"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#EA580C] hover:bg-[#C2410C] text-white rounded-xl text-xs font-bold shadow-cta transition-all"
          >
            <Plus className="w-4 h-4" />
            Buat Voucher Baru
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-[#64748B] font-medium">Voucher Aktif & Siap Pakai</p>
            <p className="text-2xl font-serif font-black text-[#14281D] mt-1">{activeCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-[#64748B] font-medium">Total Pemakaian Kuota</p>
            <p className="text-2xl font-serif font-black text-[#14281D] mt-1">{totalUsed} Tamu</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-[#64748B] font-medium">Voucher Kuota Penuh (Habis)</p>
            <p className="text-2xl font-serif font-black text-[#14281D] mt-1">{exhaustedCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari kode voucher atau nama promo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#EA580C]/20"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-1" />
          {[
            { key: "ALL", label: "Semua" },
            { key: "ACTIVE", label: "Aktif" },
            { key: "EXHAUSTED", label: "Kuota Penuh" },
            { key: "EXPIRED", label: "Kadaluarsa" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === tab.key
                  ? "bg-[#14281D] text-white"
                  : "bg-slate-100 text-[#64748B] hover:bg-slate-200/80"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Vouchers Grid / Cards */}
      {filteredVouchers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <Ticket className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-slate-700">Tidak ada voucher yang ditemukan</p>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {search
              ? "Coba sesuaikan kata kunci pencarian atau filter status."
              : "Belum ada voucher yang dibuat. Klik tombol Buat Voucher Baru untuk meluncurkan promo perdana."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVouchers.map((voucher) => {
            const isExpired = new Date(voucher.validUntil) < now;
            const isExhausted = voucher.usedCount >= voucher.maxUsage;
            const usagePercent = Math.min(
              100,
              Math.round((voucher.usedCount / voucher.maxUsage) * 100)
            );

            return (
              <div
                key={voucher.id}
                className={`bg-white rounded-2xl border p-5 shadow-sm transition-all flex flex-col justify-between space-y-4 relative overflow-hidden ${
                  !voucher.isActive || isExpired
                    ? "opacity-75 border-slate-200"
                    : isExhausted
                    ? "border-amber-200 bg-amber-50/20"
                    : "border-slate-200/90 hover:border-[#EA580C]/40"
                }`}
              >
                {/* Decorative cutouts on voucher sides */}
                <div className="absolute -left-3 top-14 w-6 h-6 bg-[#F8F9FA] rounded-full border-r border-slate-200" />
                <div className="absolute -right-3 top-14 w-6 h-6 bg-[#F8F9FA] rounded-full border-l border-slate-200" />

                <div>
                  {/* Top Bar: Code and Status */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-black text-sm tracking-widest text-[#18181B] bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                        {voucher.code}
                      </span>
                      <button
                        onClick={() => handleCopy(voucher.code)}
                        className="p-1 text-slate-400 hover:text-slate-600 rounded-md transition-colors"
                        title="Salin Kode"
                      >
                        {copiedCode === voucher.code ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    <div>
                      {isExpired ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                          Kadaluarsa
                        </span>
                      ) : isExhausted ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          Kuota Habis
                        </span>
                      ) : voucher.isActive ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Aktif
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                          Nonaktif
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Promo Name & Discount */}
                  <div className="mt-3">
                    <h3 className="font-serif font-bold text-base text-[#18181B] leading-snug">
                      {voucher.name}
                    </h3>
                    <p className="text-xl font-black text-[#EA580C] mt-1 font-mono">
                      {voucher.discountType === "percentage"
                        ? `${voucher.discountValue}% OFF`
                        : `Potongan ${formatIDR(voucher.discountValue)}`}
                    </p>
                    {voucher.discountType === "percentage" && voucher.maxDiscount && (
                      <p className="text-[11px] text-slate-500">
                        Maks. Potongan: {formatIDR(voucher.maxDiscount)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Quota Progress & Details */}
                <div className="space-y-3 pt-3 border-t border-dashed border-slate-200 text-xs text-slate-600">
                  {/* Quota Limit Info */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-semibold mb-1">
                      <span className="flex items-center gap-1 text-slate-500">
                        <Users className="w-3 h-3" /> Kuota Terpakai
                      </span>
                      <span className={isExhausted ? "text-amber-700 font-bold" : "text-slate-700"}>
                        {voucher.usedCount} / {voucher.maxUsage} Pengguna
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isExhausted
                            ? "bg-amber-500"
                            : usagePercent > 70
                            ? "bg-orange-400"
                            : "bg-emerald-500"
                        }`}
                        style={{ width: `${usagePercent}%` }}
                      />
                    </div>
                    {isExhausted && (
                      <p className="text-[10px] text-amber-700 font-medium mt-1">
                        *Pengguna ke-{voucher.maxUsage + 1} yang mencoba redeem akan ditolak otomatis.
                      </p>
                    )}
                  </div>

                  {/* Conditions & Validity */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 pt-1">
                    <div>
                      <span className="block text-[10px] text-slate-400">Min. Belanja</span>
                      <span className="font-medium text-slate-700">
                        {voucher.minSpend > 0 ? formatIDR(voucher.minSpend) : "Tanpa Minimum"}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-400">Berlaku Hingga</span>
                      <span className="font-medium text-slate-700">
                        {formatDate(voucher.validUntil)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <button
                      onClick={() => onToggleVoucher(voucher.id, voucher.isActive)}
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-colors ${
                        voucher.isActive
                          ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                          : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                      }`}
                    >
                      {voucher.isActive ? "Nonaktifkan" : "Aktifkan"}
                    </button>

                    <button
                      onClick={() => onDeleteVoucher(voucher.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Hapus Voucher"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Buat Voucher Baru */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-orange-100 text-[#EA580C] flex items-center justify-center">
                  <Ticket className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-[#18181B]">
                    Buat Voucher Diskon Promo
                  </h3>
                  <p className="text-xs text-slate-500">
                    Konfigurasi batasan kuota pengguna dan nominal potongan diskon.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <Info className="w-4 h-4 shrink-0" />
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Kode Voucher & Nama */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    Kode Promo <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: PROMO10, SAVORIA50"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl uppercase font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#EA580C]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    Nama Promo <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Diskon Grand Opening 10 Tamu"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#EA580C]"
                  />
                </div>
              </div>

              {/* Tipe Diskon & Nilai */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Tipe Diskon</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDiscountType("percentage")}
                      className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold border transition-colors ${
                        discountType === "percentage"
                          ? "bg-[#14281D] text-white border-[#14281D]"
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      <Percent className="w-3.5 h-3.5" />
                      Persen (%)
                    </button>
                    <button
                      type="button"
                      onClick={() => setDiscountType("fixed")}
                      className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold border transition-colors ${
                        discountType === "fixed"
                          ? "bg-[#14281D] text-white border-[#14281D]"
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      <DollarSign className="w-3.5 h-3.5" />
                      Nominal (Rp)
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    Nilai Diskon ({discountType === "percentage" ? "%" : "Rp"}){" "}
                    <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={discountType === "percentage" ? "100" : undefined}
                    required
                    placeholder={discountType === "percentage" ? "20" : "50000"}
                    value={discountValue}
                    onChange={(e) =>
                      setDiscountValue(e.target.value ? Number(e.target.value) : "")
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-[#EA580C]"
                  />
                </div>
              </div>

              {/* Maks Diskon (if percentage) & Min Spend */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {discountType === "percentage" ? (
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Maks. Potongan (Rp)</label>
                    <input
                      type="number"
                      placeholder="Opsional, cth: 50000"
                      value={maxDiscount}
                      onChange={(e) =>
                        setMaxDiscount(e.target.value ? Number(e.target.value) : "")
                      }
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-[#EA580C]"
                    />
                  </div>
                ) : (
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Minimal Belanja (Rp)</label>
                    <input
                      type="number"
                      placeholder="0 (Tanpa minimum)"
                      value={minSpend}
                      onChange={(e) => setMinSpend(e.target.value ? Number(e.target.value) : "")}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-[#EA580C]"
                    />
                  </div>
                )}

                {discountType === "percentage" && (
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Minimal Belanja (Rp)</label>
                    <input
                      type="number"
                      placeholder="0 (Tanpa minimum)"
                      value={minSpend}
                      onChange={(e) => setMinSpend(e.target.value ? Number(e.target.value) : "")}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-[#EA580C]"
                    />
                  </div>
                )}
              </div>

              {/* Quota Limit & Validity Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    Batas Kuota Pengguna <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="Contoh: 10"
                    value={maxUsage}
                    onChange={(e) => setMaxUsage(e.target.value ? Number(e.target.value) : "")}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#EA580C]"
                  />
                  <span className="text-[10px] text-slate-400 block">
                    User ke-{Number(maxUsage || 0) + 1} yang redeem akan ditolak dengan pesan kuota habis.
                  </span>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    Berlaku Hingga <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={validUntil}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setValidUntil(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#EA580C]"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-5 py-2 bg-[#EA580C] hover:bg-[#C2410C] text-white rounded-xl text-xs font-bold shadow-cta transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>Buat Voucher</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
