"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";

// POS Modular Components
import { PosHeader } from "@/components/pos/PosHeader";
import { PosCatalogTab } from "@/components/pos/PosCatalogTab";
import { PosOrdersTab } from "@/components/pos/PosOrdersTab";
import { PosTablesTab } from "@/components/pos/PosTablesTab";
import { PosPaymentModal } from "@/components/pos/PosPaymentModal";
import { OpenShiftModal, CloseShiftModal } from "@/components/pos/PosShiftModals";
import { PosVoidModal } from "@/components/pos/PosVoidModal";
import { PosMoveTableModal } from "@/components/pos/PosMoveTableModal";
import { PosThermalReceipt } from "@/components/pos/PosThermalReceipt";

export default function PosCashierPage() {
  const { user, logout } = useAuth();
  const { toast } = useToast();

  // Shift state
  const [currentShift, setCurrentShift] = useState<any>(null);
  const [showOpenShiftModal, setShowOpenShiftModal] = useState(false);
  const [startCashInput, setStartCashInput] = useState("500000");
  const [cashierNameInput, setCashierNameInput] = useState("Kasir Utama");
  const [showCloseShiftModal, setShowCloseShiftModal] = useState(false);
  const [endCashActualInput, setEndCashActualInput] = useState("");
  const [closeShiftVariance, setCloseShiftVariance] = useState<number | null>(null);

  useEffect(() => {
    if (user?.name) {
      setCashierNameInput(user.name);
    }
  }, [user]);

  // Tab & View state
  const [activeTab, setActiveTab] = useState<"pos" | "orders" | "tables">("pos");
  const [mobilePosView, setMobilePosView] = useState<"catalog" | "bill">("catalog");

  // Master Data
  const [categories, setCategories] = useState<any[]>([]);
  const [menus, setMenus] = useState<any[]>([]);
  const [tables, setTables] = useState<any[]>([]);
  const [activeOrders, setActiveOrders] = useState<any[]>([]);
  const [waiterCalls, setWaiterCalls] = useState<any[]>([]);

  // POS Order Entry state
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null);
  const [orderType, setOrderType] = useState<"dine_in" | "takeaway">("dine_in");
  const [posCart, setPosCart] = useState<any[]>([]);
  const [posSearch, setPosSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Payment Modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [orderToPay, setOrderToPay] = useState<any>(null);
  const [payMethod, setPayMethod] = useState<"cash" | "qris" | "debit">("cash");
  const [cashPaidInput, setCashPaidInput] = useState<number>(0);

  // Void Modal state
  const [showVoidModal, setShowVoidModal] = useState(false);
  const [voidTarget, setVoidTarget] = useState<{ orderId: number; itemId?: number } | null>(null);
  const [supervisorPin, setSupervisorPin] = useState("");
  const [voidReason, setVoidReason] = useState("");

  // Move Table Modal state
  const [showMoveTableModal, setShowMoveTableModal] = useState(false);
  const [moveFromTable, setMoveFromTable] = useState<any>(null);
  const [moveToTableId, setMoveToTableId] = useState<string>("");

  // Print Receipt / Kitchen Ticket state
  const [printData, setPrintData] = useState<{ type: "customer" | "kitchen"; order: any } | null>(null);

  // 1. Fetch current shift
  const fetchShift = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/pos/shifts/current");
      const data = await res.json();
      if (data.success && data.data) {
        setCurrentShift(data.data);
      } else {
        setCurrentShift(null);
        setShowOpenShiftModal(true);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  // 2. Fetch catalogs & orders
  const fetchAllData = useCallback(async () => {
    try {
      const [menuRes, tableRes, orderRes, callRes] = await Promise.all([
        fetch("/api/v1/customer/menus").then((r) => r.json()),
        fetch("/api/v1/pos/tables").then((r) => r.json()),
        fetch("/api/v1/pos/orders/active").then((r) => r.json()),
        fetch("/api/v1/pos/waiter-calls").then((r) => r.json()),
      ]);

      if (menuRes.success) {
        setCategories(menuRes.data);
        const flattened = menuRes.data.flatMap((c: any) => c.menus);
        setMenus(flattened);
      }
      if (tableRes.success) setTables(tableRes.data);
      if (orderRes.success) setActiveOrders(orderRes.data);
      if (callRes.success) setWaiterCalls(callRes.data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  // Optimized Polling: 12 seconds & Tab Visibility Check
  useEffect(() => {
    fetchShift();
    fetchAllData();

    const interval = setInterval(() => {
      // If browser tab is hidden/minimized, avoid firing API calls to prevent unnecessary CDN & function invocations
      if (typeof document !== "undefined" && document.hidden) return;

      Promise.all([
        fetch("/api/v1/pos/orders/active").then((r) => r.json()),
        fetch("/api/v1/pos/waiter-calls").then((r) => r.json()),
        fetch("/api/v1/pos/tables").then((r) => r.json()),
      ])
        .then(([orders, calls, tbls]) => {
          if (orders.success) setActiveOrders(orders.data);
          if (calls.success) setWaiterCalls(calls.data);
          if (tbls.success) setTables(tbls.data);
        })
        .catch(() => {});
    }, 12000);

    return () => clearInterval(interval);
  }, [fetchShift, fetchAllData]);

  // SHIFT HANDLERS
  const handleOpenShiftSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/v1/pos/shifts/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cashierName: cashierNameInput.trim(),
          startCash: Number(startCashInput),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCurrentShift(data.data);
        setShowOpenShiftModal(false);
        toast.success(`Shift kasir untuk ${cashierNameInput} telah dibuka!`, "Shift Dibuka");
      } else {
        toast.error(data.message || "Gagal membuka shift.", "Gagal");
      }
    } catch {
      toast.error("Terjadi kesalahan saat membuka shift.", "Gangguan Koneksi");
    }
  };

  const handleCloseShiftSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentShift) return;
    try {
      const res = await fetch("/api/v1/pos/shifts/end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shiftId: currentShift.id,
          endCashActual: Number(endCashActualInput),
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Shift berhasil ditutup dan direkonsiliasi.", "Shift Selesai");
        setCurrentShift(null);
        setShowCloseShiftModal(false);
      } else {
        toast.error(data.message || "Gagal menutup shift.", "Gagal");
      }
    } catch {
      toast.error("Terjadi kesalahan saat menutup shift.", "Gangguan Koneksi");
    }
  };

  // CART HANDLERS
  const handleAddToCart = (menu: any) => {
    const existing = posCart.find((i) => i.menuId === menu.id);
    if (existing) {
      setPosCart(
        posCart.map((i) => (i.menuId === menu.id ? { ...i, quantity: i.quantity + 1 } : i))
      );
    } else {
      setPosCart([
        ...posCart,
        {
          menuId: menu.id,
          name: menu.name,
          price: menu.price,
          quantity: 1,
          notes: "",
        },
      ]);
    }
  };

  const handleUpdateCartQty = (menuId: number, delta: number) => {
    setPosCart(
      posCart
        .map((i) => (i.menuId === menuId ? { ...i, quantity: i.quantity + delta } : i))
        .filter((i) => i.quantity > 0)
    );
  };

  const handlePosCheckout = () => {
    if (posCart.length === 0) {
      toast.warning("Pilih minimal 1 item pesanan terlebih dahulu.", "Keranjang Kosong");
      return;
    }

    if (orderType === "dine_in" && !selectedTableId) {
      toast.warning("Silakan tentukan nomor meja tamu terlebih dahulu.", "Meja Belum Dipilih");
      return;
    }

    const sub = posCart.reduce((s, i) => s + i.price * i.quantity, 0);
    const tax = Math.round(sub * 0.1);
    const srv = Math.round(sub * 0.05);
    const tot = sub + tax + srv;

    const dummyOrder = {
      orderNumber: "ORD-DRAFT",
      tableId: selectedTableId,
      table: tables.find((t) => t.id === selectedTableId),
      orderType: orderType,
      customerName: orderType === "dine_in" ? `Meja ${tables.find((t) => t.id === selectedTableId)?.tableNumber}` : "Pelanggan Takeaway",
      subtotal: sub,
      taxAmount: tax,
      serviceCharge: srv,
      totalAmount: tot,
      items: posCart.map((i) => ({ ...i, subtotal: i.price * i.quantity })),
      isDraft: true,
    };

    setOrderToPay(dummyOrder);
    setCashPaidInput(tot);
    setShowPaymentModal(true);
  };

  // EXECUTE PAYMENT
  const handleExecutePayment = async () => {
    if (!orderToPay) return;

    try {
      if (orderToPay.isDraft) {
        const payload = {
          tableId: orderToPay.tableId,
          customerName: orderToPay.customerName,
          orderType: orderToPay.orderType,
          paymentMethod: payMethod,
          isPaid: true,
          items: posCart.map((i) => ({
            menuId: i.menuId,
            quantity: i.quantity,
            notes: i.notes,
          })),
        };

        const res = await fetch("/api/v1/customer/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (data.success) {
          toast.success("Transaksi POS berhasil dibukukan!", "Pembayaran Berhasil");
          setPosCart([]);
          setShowPaymentModal(false);
          fetchAllData();
          triggerPrint("customer", data.data);
        } else {
          toast.error(data.message || "Gagal membukukan transaksi.", "Gagal");
        }
      } else {
        const res = await fetch(`/api/v1/pos/orders/${orderToPay.id}/pay`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paymentMethod: payMethod,
            amountPaid: payMethod === "cash" ? cashPaidInput : orderToPay.totalAmount,
          }),
        });
        const data = await res.json();
        if (data.success) {
          toast.success("Tagihan meja berhasil dilunasi!", "Lunas");
          setShowPaymentModal(false);
          fetchAllData();
          triggerPrint("customer", data.data);
        } else {
          toast.error(data.message || "Gagal menyelesaikan pembayaran.", "Gagal");
        }
      }
    } catch {
      toast.error("Terjadi kesalahan saat memproses pembayaran.", "Gangguan Koneksi");
    }
  };

  // STATUS UPDATES
  const handleUpdateOrderStatus = async (orderId: number, status: string) => {
    try {
      const res = await fetch(`/api/v1/pos/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Status pesanan diperbarui menjadi [${status.toUpperCase()}].`, "Status Diperbarui");
        fetchAllData();
      } else {
        toast.error(data.message || "Gagal memperbarui status.", "Gagal");
      }
    } catch {
      toast.error("Terjadi kesalahan koneksi.", "Gangguan Jaringan");
    }
  };

  // VOID
  const handleOpenVoidModal = (orderId: number, itemId?: number) => {
    setVoidTarget({ orderId, itemId });
    setSupervisorPin("");
    setVoidReason("");
    setShowVoidModal(true);
  };

  const handleExecuteVoid = async () => {
    if (!voidTarget || !supervisorPin || !voidReason) return;
    try {
      const res = await fetch(`/api/v1/pos/orders/${voidTarget.orderId}/void`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supervisorPin,
          reason: voidReason,
          itemId: voidTarget.itemId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Pembatalan (Void) berhasil diotorisasi.", "Void Berhasil");
        setShowVoidModal(false);
        fetchAllData();
      } else {
        toast.error(data.message || "Supervisor PIN salah atau otorisasi ditolak.", "Otorisasi Gagal");
      }
    } catch {
      toast.error("Terjadi gangguan koneksi saat void.", "Gangguan Koneksi");
    }
  };

  // MOVE TABLE
  const handleOpenMoveTableModal = (table: any) => {
    setMoveFromTable(table);
    setMoveToTableId("");
    setShowMoveTableModal(true);
  };

  const handleExecuteMoveTable = async () => {
    if (!moveFromTable || !moveToTableId) return;
    try {
      const res = await fetch("/api/v1/pos/tables/move", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromTableId: moveFromTable.id,
          toTableId: Number(moveToTableId),
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Meja tamu berhasil dipindahkan!", "Pindah Meja Berhasil");
        setShowMoveTableModal(false);
        fetchAllData();
      } else {
        toast.error(data.message || "Gagal memindahkan meja.", "Gagal Pindah Meja");
      }
    } catch {
      toast.error("Terjadi gangguan koneksi saat memindahkan meja.", "Gangguan Koneksi");
    }
  };

  // PRINT
  const triggerPrint = (type: "customer" | "kitchen", order: any) => {
    setPrintData({ type, order });
    setTimeout(() => {
      window.print();
    }, 200);
  };

  return (
    <div className="h-screen bg-[#FDFBF7] flex flex-col font-sans overflow-hidden">
      {/* HEADER */}
      <PosHeader
        user={user}
        currentShift={currentShift}
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        activeOrdersCount={activeOrders.length}
        waiterCallsCount={waiterCalls.length}
        onOpenShiftModal={() => setShowOpenShiftModal(true)}
        onCloseShiftModal={() => {
          if (!currentShift) return;
          const expected = currentShift.startCash + (currentShift.totalCashReceived || 0);
          setEndCashActualInput(String(expected));
          setCloseShiftVariance(0);
          setShowCloseShiftModal(true);
        }}
        onLogout={logout}
      />

      {/* TAB 1: POS CATALOG */}
      {activeTab === "pos" && (
        <PosCatalogTab
          menus={menus}
          categories={categories}
          tables={tables}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          posSearch={posSearch}
          onChangeSearch={setPosSearch}
          posCart={posCart}
          onAddToCart={handleAddToCart}
          onUpdateCartQty={handleUpdateCartQty}
          onClearCart={() => setPosCart([])}
          selectedTableId={selectedTableId}
          onSelectTableId={setSelectedTableId}
          orderType={orderType}
          onChangeOrderType={setOrderType}
          onCheckout={handlePosCheckout}
          mobileView={mobilePosView}
          onChangeMobileView={setMobilePosView}
        />
      )}

      {/* TAB 2: ACTIVE ORDERS */}
      {activeTab === "orders" && (
        <PosOrdersTab
          activeOrders={activeOrders}
          onRefresh={fetchAllData}
          onUpdateOrderStatus={handleUpdateOrderStatus}
          onTriggerPrint={triggerPrint}
          onOpenVoidModal={handleOpenVoidModal}
          onOpenPayModalForOrder={(order) => {
            setOrderToPay(order);
            setCashPaidInput(order.totalAmount);
            setShowPaymentModal(true);
          }}
        />
      )}

      {/* TAB 3: TABLES MAP */}
      {activeTab === "tables" && (
        <PosTablesTab
          tables={tables}
          selectedTableId={selectedTableId}
          onSelectTable={(tbl) => setSelectedTableId(tbl.id)}
          activeOrders={activeOrders}
          onOpenPayModalForOrder={(order) => {
            setOrderToPay(order);
            setCashPaidInput(order.totalAmount);
            setShowPaymentModal(true);
          }}
          onOpenMoveTableModal={handleOpenMoveTableModal}
        />
      )}

      {/* MODALS */}
      <PosPaymentModal
        orderToPay={orderToPay}
        payMethod={payMethod}
        onChangePayMethod={setPayMethod}
        cashPaidInput={cashPaidInput}
        onChangeCashPaid={setCashPaidInput}
        onExecutePayment={handleExecutePayment}
        onClose={() => setShowPaymentModal(false)}
      />

      <OpenShiftModal
        show={showOpenShiftModal}
        cashierNameInput={cashierNameInput}
        onChangeCashierName={setCashierNameInput}
        startCashInput={startCashInput}
        onChangeStartCash={setStartCashInput}
        onSubmit={handleOpenShiftSubmit}
        onClose={() => setShowOpenShiftModal(false)}
      />

      <CloseShiftModal
        show={showCloseShiftModal}
        currentShift={currentShift}
        endCashActualInput={endCashActualInput}
        onChangeEndCashActual={(val) => {
          setEndCashActualInput(val);
          if (currentShift) {
            const expected = currentShift.startCash + (currentShift.totalCashReceived || 0);
            setCloseShiftVariance(Number(val) - expected);
          }
        }}
        closeShiftVariance={closeShiftVariance}
        onSubmit={handleCloseShiftSubmit}
        onClose={() => setShowCloseShiftModal(false)}
      />

      <PosVoidModal
        show={showVoidModal}
        supervisorPin={supervisorPin}
        onChangePin={setSupervisorPin}
        voidReason={voidReason}
        onChangeReason={setVoidReason}
        onExecuteVoid={handleExecuteVoid}
        onClose={() => setShowVoidModal(false)}
      />

      <PosMoveTableModal
        show={showMoveTableModal}
        moveFromTable={moveFromTable}
        moveToTableId={moveToTableId}
        onChangeMoveToTableId={setMoveToTableId}
        availableTables={tables.filter(
          (t) => t.id !== moveFromTable?.id && t.status === "available"
        )}
        onExecuteMoveTable={handleExecuteMoveTable}
        onClose={() => setShowMoveTableModal(false)}
      />

      {/* THERMAL PRINT RENDERER */}
      <PosThermalReceipt printData={printData} currentShift={currentShift} />
    </div>
  );
}
