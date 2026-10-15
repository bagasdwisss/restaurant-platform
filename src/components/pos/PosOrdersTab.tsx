"use client";

import React, { useState, useMemo } from "react";
import {
  UtensilsCrossed,
  Printer,
  Ban,
  Clock,
  CheckCircle2,
  RefreshCw,
  ChefHat,
  CreditCard,
  Search,
  Calendar,
  Users,
  MapPin,
  AlertCircle,
  Tag,
  MessageSquare,
  Sparkles,
  Phone,
  Check,
  Coffee,
  Layers,
  Cake,
} from "lucide-react";
import { formatIDR, formatDate } from "@/lib/utils";

interface PosOrdersTabProps {
  activeOrders: any[];
  onRefresh: () => void;
  isRefreshing?: boolean;
  onUpdateOrderStatus: (orderId: number, status: string) => void;
  updatingOrderId?: number | null;
  onTriggerPrint: (type: any, order: any) => void;
  onOpenVoidModal: (orderId: number, itemId?: number) => void;
  onOpenPayModalForOrder: (order: any) => void;
}

export function PosOrdersTab({
  activeOrders,
  onRefresh,
  isRefreshing = false,
  onUpdateOrderStatus,
  updatingOrderId = null,
  onTriggerPrint,
  onOpenVoidModal,
  onOpenPayModalForOrder,
}: PosOrdersTabProps) {
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [openPrintMenuOrderId, setOpenPrintMenuOrderId] = useState<number | null>(null);


  // Counts by status
  const pendingCount = useMemo(
    () => activeOrders.filter((o) => o.status === "pending").length,
    [activeOrders]
  );
  const confirmedCount = useMemo(
    () => activeOrders.filter((o) => o.status === "confirmed").length,
    [activeOrders]
  );
  const preparingCount = useMemo(
    () => activeOrders.filter((o) => o.status === "preparing").length,
    [activeOrders]
  );
  const servedCount = useMemo(
    () => activeOrders.filter((o) => o.status === "served").length,
    [activeOrders]
  );
  const reservationCount = useMemo(
    () => activeOrders.filter((o) => o.orderType === "reservation").length,
    [activeOrders]
  );
  const unpaidCount = useMemo(
    () => activeOrders.filter((o) => o.paymentStatus !== "paid").length,
    [activeOrders]
  );

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return activeOrders.filter((order) => {
      // 1. Status / Type Filter
      if (filterStatus === "pending" && order.status !== "pending") return false;
      if (filterStatus === "confirmed" && order.status !== "confirmed") return false;
      if (filterStatus === "preparing" && order.status !== "preparing") return false;
      if (filterStatus === "served" && order.status !== "served") return false;
      if (filterStatus === "reservation" && order.orderType !== "reservation") return false;
      if (filterStatus === "dine_in" && order.orderType !== "dine_in") return false;
      if (filterStatus === "unpaid" && order.paymentStatus === "paid") return false;

      // 2. Search Query Filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchNumber = order.orderNumber?.toLowerCase().includes(query);
        const matchCustomer = order.customerName?.toLowerCase().includes(query);
        const matchTable = order.table?.tableNumber?.toLowerCase().includes(query);
        const matchPhone = order.customerPhone?.toLowerCase().includes(query);
        if (!matchNumber && !matchCustomer && !matchTable && !matchPhone) return false;
      }

      return true;
    });
  }, [activeOrders, filterStatus, searchQuery]);

  return (
    <div className="flex-1 p-3.5 sm:p-6 overflow-y-auto space-y-5 animate-fadeIn">
      {/* Top Summary Banner */}
      <div className="bg-white border border-[#E2E8F0] rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-[#EA580C] bg-[#EA580C]/10 px-2.5 py-0.5 rounded-full inline-block">
                Stasiun Operasional Kasir & Dapur
              </span>
              {pendingCount > 0 && (
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-500 text-white animate-pulse">
                  {pendingCount} Perlu Konfirmasi Segera!
                </span>
              )}
            </div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#18181B] mt-1">
              Pesanan Masuk & Reservasi Berjalan ({activeOrders.length})
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
              Kelola konfirmasi reservasi online, instruksi masak dapur, penyajian meja, dan penyelesaian pembayaran secara live.
            </p>
          </div>

          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="px-4 py-2.5 bg-white border border-slate-200/90 hover:bg-slate-50 text-[#18181B] rounded-full text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-60 transition-all self-start sm:self-auto shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#EA580C] ${isRefreshing ? "animate-spin" : ""}`} />
            <span>{isRefreshing ? "Menyinkronkan..." : "Perbarui Data"}</span>
          </button>
        </div>

        {/* Dynamic Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-2xl">
            <span className="text-[10px] font-bold text-amber-900 block font-mono uppercase">
              Menunggu Konfirmasi
            </span>
            <span className="font-serif text-xl font-bold text-amber-950 mt-0.5 block">
              {pendingCount} Pesanan
            </span>
          </div>

          <div className="p-3 bg-purple-50/70 border border-purple-200/80 rounded-2xl">
            <span className="text-[10px] font-bold text-purple-900 block font-mono uppercase">
              Dimasak Dapur Chef
            </span>
            <span className="font-serif text-xl font-bold text-purple-950 mt-0.5 block">
              {preparingCount} Pesanan
            </span>
          </div>

          <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-2xl">
            <span className="text-[10px] font-bold text-blue-900 block font-mono uppercase">
              Reservasi Tamu Online
            </span>
            <span className="font-serif text-xl font-bold text-blue-950 mt-0.5 block">
              {reservationCount} Reservasi
            </span>
          </div>

          <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl">
            <span className="text-[10px] font-bold text-emerald-900 block font-mono uppercase">
              Telah Disajikan
            </span>
            <span className="font-serif text-xl font-bold text-emerald-950 mt-0.5 block">
              {servedCount} Meja
            </span>
          </div>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
            {[
              { id: "all", label: "Semua", count: activeOrders.length },
              { id: "pending", label: "Menunggu Konfirmasi", count: pendingCount, color: "text-amber-800" },
              { id: "confirmed", label: "Dikonfirmasi", count: confirmedCount },
              { id: "preparing", label: "Dimasak Dapur", count: preparingCount },
              { id: "served", label: "Disajikan", count: servedCount },
              { id: "reservation", label: "Khusus Reservasi", count: reservationCount },
              { id: "unpaid", label: "Belum Lunas", count: unpaidCount },
            ].map((tab) => {
              const isSelected = filterStatus === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilterStatus(tab.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-[#18181B] text-white shadow-xs"
                      : "bg-slate-100 hover:bg-slate-200 text-[#64748B]"
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                        isSelected ? "bg-white text-[#18181B]" : "bg-white text-[#64748B]"
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="relative min-w-[240px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari No. Order, Meja, Nama..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full focus:ring-2 focus:ring-[#EA580C] focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Orders Grid */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center text-[#64748B] shadow-xs space-y-3">
          <UtensilsCrossed className="w-12 h-12 mx-auto text-[#EA580C]/40" />
          <h3 className="font-serif font-bold text-base text-[#18181B]">
            Tidak ada pesanan pada filter ini
          </h3>
          <p className="text-xs text-[#64748B] max-w-md mx-auto">
            {searchQuery
              ? `Tidak ditemukan pesanan yang sesuai dengan kata kunci "${searchQuery}".`
              : "Semua pesanan pada kategori ini telah selesai diproses atau belum ada pesanan baru."}
          </p>
          {(filterStatus !== "all" || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setFilterStatus("all");
                setSearchQuery("");
              }}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-[#18181B] rounded-full text-xs font-bold transition-all cursor-pointer"
            >
              Reset Filter & Pencarian
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredOrders.map((order) => {
            const isOrderUpdating = updatingOrderId === order.id;

            return (
              <div
                key={order.id}
                className={`bg-white rounded-3xl border transition-all flex flex-col justify-between space-y-4 shadow-xs hover:shadow-md ${
                  order.status === "pending"
                    ? "border-amber-300 ring-1 ring-amber-200"
                    : "border-slate-200/80"
                } p-5`}
              >
                <div>
                  {/* Top Header: Order Number & Type */}
                  <div className="flex items-start justify-between border-b border-slate-100 pb-3 gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="font-mono font-bold text-sm text-[#18181B]">
                          #{order.orderNumber}
                        </h3>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider ${
                            order.orderType === "reservation"
                              ? "bg-purple-100 text-purple-800"
                              : order.orderType === "takeaway"
                              ? "bg-orange-100 text-orange-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {order.orderType === "reservation"
                            ? "Reservasi Online"
                            : order.orderType === "takeaway"
                            ? "Takeaway"
                            : "Dine-In"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-1 text-xs">
                        <span className="font-bold text-[#18181B] bg-slate-100 px-2 py-0.5 rounded-md font-mono">
                          {order.table?.tableNumber ? `Meja ${order.table.tableNumber}` : "VIP Area"} ({order.table?.area || "Indoor"})
                        </span>
                        <span className="text-[#64748B] truncate">
                          • {order.customerName}
                        </span>
                      </div>
                    </div>

                    {/* Quick Print & Void Icons with Multi-Station Kitchen Routing */}
                    <div className="flex items-center gap-1 shrink-0 relative">
                      {/* Kitchen Station Print Dropdown */}
                      <div className="relative">
                        <button
                          type="button"
                          title="Cetak Tiket Stasiun Dapur (Multi-Printer Routing)"
                          onClick={() =>
                            setOpenPrintMenuOrderId(
                              openPrintMenuOrderId === order.id ? null : order.id
                            )
                          }
                          className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                            openPrintMenuOrderId === order.id
                              ? "bg-[#EA580C] text-white"
                              : "hover:bg-slate-100 text-[#64748B] hover:text-[#18181B]"
                          }`}
                        >
                          <ChefHat className="w-4 h-4" />
                        </button>

                        {openPrintMenuOrderId === order.id && (
                          <div className="absolute right-0 top-8 z-30 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl p-1.5 space-y-1 text-left animate-in fade-in duration-150">
                            <div className="px-2.5 py-1 text-[10px] font-mono font-bold text-slate-400 uppercase border-b border-slate-100">
                              Multi-Printer Kitchen Routing
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                onTriggerPrint("kitchen_multi_split", order);
                                setOpenPrintMenuOrderId(null);
                              }}
                              className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-amber-50 text-amber-900 text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors"
                            >
                              <Layers className="w-3.5 h-3.5 text-[#EA580C]" />
                              <span>⚡ Split Semua Stasiun (Auto)</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                onTriggerPrint("kitchen_hot", order);
                                setOpenPrintMenuOrderId(null);
                              }}
                              className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center gap-2 cursor-pointer transition-colors"
                            >
                              <ChefHat className="w-3.5 h-3.5 text-rose-600" />
                              <span>Tiket Hot Kitchen (Main Chef)</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                onTriggerPrint("kitchen_barista", order);
                                setOpenPrintMenuOrderId(null);
                              }}
                              className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center gap-2 cursor-pointer transition-colors"
                            >
                              <Coffee className="w-3.5 h-3.5 text-amber-700" />
                              <span>Tiket Barista & Minuman</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                onTriggerPrint("kitchen_pastry", order);
                                setOpenPrintMenuOrderId(null);
                              }}
                              className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center gap-2 cursor-pointer transition-colors"
                            >
                              <Cake className="w-3.5 h-3.5 text-purple-600" />
                              <span>Tiket Pastry & Dessert</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                onTriggerPrint("kitchen", order);
                                setOpenPrintMenuOrderId(null);
                              }}
                              className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-slate-50 text-slate-500 text-[11px] flex items-center gap-2 cursor-pointer transition-colors border-t border-slate-100"
                            >
                              <UtensilsCrossed className="w-3.5 h-3.5" />
                              <span>Tiket Master Dapur (Semua)</span>
                            </button>
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        title="Cetak Struk Resmi Pelanggan"
                        onClick={() => onTriggerPrint("customer", order)}
                        className="p-1.5 rounded-full hover:bg-slate-100 text-[#64748B] hover:text-[#18181B] cursor-pointer"
                      >
                        <Printer className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        title="Batalkan Pesanan (Void Supervisor)"
                        onClick={() => onOpenVoidModal(order.id)}
                        className="p-1.5 rounded-full hover:bg-rose-50 text-rose-500 hover:text-rose-700 cursor-pointer"
                      >
                        <Ban className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Schedule info for Reservations */}
                  {order.orderType === "reservation" && (
                    <div className="mt-2.5 p-2.5 bg-purple-50/70 border border-purple-200/60 rounded-2xl text-[11px] space-y-1">
                      <div className="flex items-center gap-1.5 text-purple-900 font-semibold">
                        <Calendar className="w-3.5 h-3.5 text-purple-700" />
                        <span>Jadwal: {order.reservationDate || "Hari Ini"}</span>
                        <span>•</span>
                        <Clock className="w-3.5 h-3.5 text-purple-700" />
                        <span>{order.reservationTime || "19:00"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-purple-800">
                        <Users className="w-3.5 h-3.5" />
                        <span>{order.guestCount || 2} Orang Tamu</span>
                        {order.customerPhone && (
                          <>
                            <span>•</span>
                            <Phone className="w-3 h-3" />
                            <span>{order.customerPhone}</span>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Special Requests Banner */}
                  {order.specialRequests && (
                    <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 flex items-start gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                      <span className="italic leading-tight">
                        Catatan Tamu: "{order.specialRequests}"
                      </span>
                    </div>
                  )}

                  {/* Ordered Items List */}
                  <div className="py-3 space-y-2 border-b border-slate-100 max-h-44 overflow-y-auto pr-1">
                    {order.items?.map((it: any) => {
                      let parsedVariants = [];
                      if (it.selectedVariants) {
                        try {
                          parsedVariants = typeof it.selectedVariants === "string"
                            ? JSON.parse(it.selectedVariants)
                            : it.selectedVariants;
                        } catch {
                          parsedVariants = [];
                        }
                      }

                      return (
                        <div key={it.id} className="text-xs space-y-0.5">
                          <div className="flex justify-between">
                            <div className="min-w-0 pr-2">
                              <p className="font-semibold text-[#18181B] truncate">
                                <span className="font-bold text-[#EA580C] font-mono mr-1">
                                  {it.quantity}x
                                </span>
                                {it.menu?.name || it.name}
                              </p>
                              {parsedVariants.length > 0 && (
                                <p className="text-[10px] text-[#64748B]">
                                  {parsedVariants.map((v: any) => v.option || v.name).join(", ")}
                                </p>
                              )}
                              {it.notes && (
                                <p className="text-[10px] text-amber-800 italic">
                                  "{it.notes}"
                                </p>
                              )}
                            </div>
                            <span className="font-mono text-[#18181B] shrink-0 font-medium">
                              {formatIDR(it.subtotal)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Financial & Status Bar */}
                  <div className="pt-2.5 space-y-1 text-xs">
                    <div className="flex items-center justify-between text-[#64748B]">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{formatDate(order.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {order.discountAmount > 0 && (
                          <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                            Diskon {formatIDR(order.discountAmount)}
                          </span>
                        )}
                        <span className="font-mono font-bold text-sm text-[#18181B]">
                          {formatIDR(order.totalAmount)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                          order.paymentStatus === "paid"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {order.paymentStatus === "paid"
                          ? `LUNAS (${(order.paymentMethod || "QRIS").toUpperCase()})`
                          : "BELUM LUNAS"}
                      </span>

                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                          order.status === "pending"
                            ? "bg-amber-100 text-amber-900 border border-amber-300"
                            : order.status === "confirmed"
                            ? "bg-blue-100 text-blue-900"
                            : order.status === "preparing"
                            ? "bg-purple-100 text-purple-900"
                            : order.status === "served"
                            ? "bg-emerald-100 text-emerald-900"
                            : "bg-slate-100 text-slate-800"
                        }`}
                      >
                        Tahap: {order.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Action Workflow Buttons with Dynamic Loading State */}
                <div className="flex gap-2 pt-2 border-t border-slate-100">
                  {order.status === "pending" && (
                    <button
                      type="button"
                      disabled={isOrderUpdating}
                      onClick={() => onUpdateOrderStatus(order.id, "confirmed")}
                      className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-full text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      {isOrderUpdating ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Mengonfirmasi...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Konfirmasi Pesanan</span>
                        </>
                      )}
                    </button>
                  )}

                  {order.status === "confirmed" && (
                    <button
                      type="button"
                      disabled={isOrderUpdating}
                      onClick={() => onUpdateOrderStatus(order.id, "preparing")}
                      className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 text-white rounded-full text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      {isOrderUpdating ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Mengirim ke Dapur...</span>
                        </>
                      ) : (
                        <>
                          <ChefHat className="w-3.5 h-3.5" />
                          <span>Kirim ke Dapur (Masak)</span>
                        </>
                      )}
                    </button>
                  )}

                  {order.status === "preparing" && (
                    <button
                      type="button"
                      disabled={isOrderUpdating}
                      onClick={() => onUpdateOrderStatus(order.id, "served")}
                      className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-full text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      {isOrderUpdating ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Menyajikan...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Tandai Telah Disajikan</span>
                        </>
                      )}
                    </button>
                  )}

                  {order.status === "served" && (
                    <button
                      type="button"
                      disabled={isOrderUpdating}
                      onClick={() => onUpdateOrderStatus(order.id, "completed")}
                      className="flex-1 py-2.5 bg-slate-900 hover:bg-black disabled:bg-slate-300 text-white rounded-full text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      {isOrderUpdating ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Memproses Selesai...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Selesai & Bebaskan Meja</span>
                        </>
                      )}
                    </button>
                  )}

                  {order.paymentStatus !== "paid" && (
                    <button
                      type="button"
                      disabled={isOrderUpdating}
                      onClick={() => onOpenPayModalForOrder(order)}
                      className="px-4 py-2.5 bg-[#EA580C] hover:bg-[#C2410C] disabled:bg-slate-300 text-white rounded-full text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer shrink-0"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Bayar</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
