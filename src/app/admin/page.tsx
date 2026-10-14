"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import QRCode from "qrcode";
import * as XLSX from "xlsx";
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Users,
  UtensilsCrossed,
  QrCode,
  Package,
  History,
  Plus,
  Trash2,
  Edit,
  Download,
  AlertTriangle,
  CheckCircle2,
  Search,
  RefreshCw,
  FileSpreadsheet,
  ArrowUpRight,
  ShieldAlert,
  Coffee,
  X,
  Layers,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { formatIDR, formatDate } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

export default function AdminDashboardPage() {
  const { user, logout, quickLogin, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<"analytics" | "menus" | "tables" | "inventory" | "shifts" | "users">("analytics");

  // User management state
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [userForm, setUserForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    role: "kasir",
    phone: "",
  });

  // Edit menu modal state
  const [showEditMenuModal, setShowEditMenuModal] = useState(false);
  const [editMenuForm, setEditMenuForm] = useState<any>(null);

  // Analytics data
  const [salesData, setSalesData] = useState<any>(null);
  const [loadingSales, setLoadingSales] = useState(true);

  // Menus data
  const [menus, setMenus] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [menuSearch, setMenuSearch] = useState("");
  const [showAddMenuModal, setShowAddMenuModal] = useState(false);
  const [menuForm, setMenuForm] = useState({
    categoryId: "",
    name: "",
    description: "",
    price: "",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
    isAvailable: true,
  });

  // Tables data & QR generator
  const [tables, setTables] = useState<any[]>([]);
  const [showAddTableModal, setShowAddTableModal] = useState(false);
  const [tableForm, setTableForm] = useState({ tableNumber: "", capacity: "4", area: "Indoor" });
  const [selectedTableQr, setSelectedTableQr] = useState<any>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  // Inventory & Recipes data
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<any>(null);
  const [restockAmount, setRestockAmount] = useState("");

  // Shift & Audit data
  const [shiftHistory, setShiftHistory] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // 1. Fetch Sales Summary
  const fetchSalesSummary = async () => {
    try {
      const res = await fetch("/api/v1/admin/reports/sales-summary");
      const data = await res.json();
      if (data.success) setSalesData(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSales(false);
    }
  };

  // 2. Fetch Menus
  const fetchMenus = async () => {
    try {
      const res = await fetch("/api/v1/admin/menus");
      const data = await res.json();
      if (data.success) {
        setMenus(data.data.menus);
        setCategories(data.data.categories);
        if (data.data.categories.length > 0 && !menuForm.categoryId) {
          setMenuForm((prev) => ({ ...prev, categoryId: String(data.data.categories[0].id) }));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 3. Fetch Tables
  const fetchTables = async () => {
    try {
      const res = await fetch("/api/v1/admin/tables");
      const data = await res.json();
      if (data.success) setTables(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  // 4. Fetch Ingredients
  const fetchIngredients = async () => {
    try {
      const res = await fetch("/api/v1/admin/ingredients");
      const data = await res.json();
      if (data.success) setIngredients(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  // 5. Fetch Shifts & Audits
  const fetchShifts = async () => {
    try {
      const res = await fetch("/api/v1/admin/reports/shifts");
      const data = await res.json();
      if (data.success) {
        setShiftHistory(data.data.shifts);
        setAuditLogs(data.data.auditLogs);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 6. Fetch Users & Staff
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch("/api/v1/admin/users");
      const data = await res.json();
      if (data.success) setUsersList(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleCreateUser = async () => {
    if (!userForm.name || !userForm.username || !userForm.email || !userForm.password) {
      alert("Harap lengkapi semua data akun.");
      return;
    }
    try {
      const res = await fetch("/api/v1/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userForm),
      });
      const data = await res.json();
      if (data.success) {
        setShowAddUserModal(false);
        setUserForm({ name: "", username: "", email: "", password: "", role: "kasir", phone: "" });
        fetchUsers();
      } else {
        alert(data.message || "Gagal membuat akun.");
      }
    } catch {
      alert("Terjadi kesalahan koneksi.");
    }
  };

  const handleDeleteUser = async (id: number, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus akun "${name}"?`)) return;
    try {
      const res = await fetch(`/api/v1/admin/users?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        fetchUsers();
      } else {
        alert(data.message || "Gagal menghapus user.");
      }
    } catch {
      alert("Terjadi kesalahan.");
    }
  };

  const handleUpdateMenu = async () => {
    if (!editMenuForm) return;
    try {
      const res = await fetch(`/api/v1/admin/menus/${editMenuForm.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editMenuForm),
      });
      const data = await res.json();
      if (data.success) {
        setShowEditMenuModal(false);
        setEditMenuForm(null);
        fetchMenus();
      } else {
        alert(data.message || "Gagal memperbarui menu.");
      }
    } catch {
      alert("Terjadi kesalahan saat memperbarui menu.");
    }
  };

  useEffect(() => {
    fetchSalesSummary();
    fetchMenus();
    fetchTables();
    fetchIngredients();
    fetchShifts();
    fetchUsers();
  }, []);

  // Generate QR Code data URL when table is selected
  useEffect(() => {
    if (selectedTableQr) {
      const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
      const tableUrl = `${origin}/table/${selectedTableQr.qrToken}`;
      QRCode.toDataURL(tableUrl, {
        width: 320,
        margin: 2,
        color: {
          dark: "#0f172a",
          light: "#ffffff",
        },
      }).then((url) => {
        setQrDataUrl(url);
      });
    }
  }, [selectedTableQr]);

  // Export Sales to Excel (.xlsx) (FR-ADM-004)
  const handleExportExcel = () => {
    if (!salesData || !salesData.recentOrders) return;

    const exportRows = salesData.recentOrders.map((o: any) => ({
      "No. Pesanan": o.orderNumber,
      "Nama Pelanggan": o.customerName || "-",
      "Total Belanja": o.totalAmount,
      "Metode Pembayaran": (o.paymentMethod || "Tunai").toUpperCase(),
      "Status": o.status.toUpperCase(),
      "Tanggal & Waktu": formatDate(o.createdAt),
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Penjualan");

    XLSX.writeFile(workbook, `Laporan-RestoSync-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // Add Menu Handler
  const handleCreateMenu = async () => {
    if (!menuForm.name || !menuForm.price || !menuForm.categoryId) {
      alert("Harap lengkapi nama menu, harga, dan kategori.");
      return;
    }

    try {
      const res = await fetch("/api/v1/admin/menus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(menuForm),
      });
      const data = await res.json();
      if (data.success) {
        setShowAddMenuModal(false);
        setMenuForm({
          categoryId: categories[0]?.id ? String(categories[0].id) : "",
          name: "",
          description: "",
          price: "",
          image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
          isAvailable: true,
        });
        fetchMenus();
      } else {
        alert(data.message || "Gagal membuat menu.");
      }
    } catch (err) {
      alert("Terjadi kesalahan koneksi.");
    }
  };

  // Toggle Menu Availability
  const handleToggleMenuAvailability = async (menuId: number, current: boolean) => {
    try {
      await fetch(`/api/v1/admin/menus/${menuId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable: !current }),
      });
      fetchMenus();
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Menu
  const handleDeleteMenu = async (menuId: number, menuName: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus menu "${menuName}"?`)) return;
    try {
      await fetch(`/api/v1/admin/menus/${menuId}`, { method: "DELETE" });
      fetchMenus();
    } catch (err) {
      console.error(err);
    }
  };

  // Add Table Handler
  const handleCreateTable = async () => {
    if (!tableForm.tableNumber) {
      alert("Nomor meja wajib diisi.");
      return;
    }
    try {
      const res = await fetch("/api/v1/admin/tables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tableForm),
      });
      const data = await res.json();
      if (data.success) {
        setShowAddTableModal(false);
        setTableForm({ tableNumber: "", capacity: "4", area: "Indoor" });
        fetchTables();
      } else {
        alert(data.message || "Gagal membuat meja.");
      }
    } catch (err) {
      alert("Terjadi kesalahan.");
    }
  };

  // Regenerate Table QR Token
  const handleRegenerateQr = async (tableId: number) => {
    if (!confirm("Regenerate token akan menonaktifkan QR code fisik yang lama. Lanjutkan?")) return;
    try {
      const res = await fetch(`/api/v1/admin/tables/${tableId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ regenerateQr: true }),
      });
      const data = await res.json();
      if (data.success) {
        alert("QR Token baru berhasil digenerate!");
        fetchTables();
        if (selectedTableQr?.id === tableId) {
          setSelectedTableQr(data.data);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Restock Ingredient
  const handleExecuteRestock = async () => {
    if (!selectedIngredient || !restockAmount) return;
    try {
      const res = await fetch("/api/v1/admin/ingredients", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedIngredient.id,
          addStock: parseFloat(restockAmount),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowRestockModal(false);
        setRestockAmount("");
        setSelectedIngredient(null);
        fetchIngredients();
      } else {
        alert(data.message || "Gagal memperbarui stok.");
      }
    } catch (err) {
      alert("Terjadi kesalahan memperbarui stok.");
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="flex items-center gap-3 text-xs">
          <RefreshCw className="w-4 h-4 animate-spin text-orange-500" />
          <span>Memverifikasi otentikasi administrator...</span>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-3xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
              Hak Akses Terbatas (Hanya Admin)
            </span>
            <h2 className="text-xl font-black text-white mt-1">Admin Back-Office</h2>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              {user
                ? `Akun Anda (${user.name}) memiliki role [${user.role.toUpperCase()}]. Halaman konfigurasi master data dan analitik finansial ini hanya dapat diakses oleh Administrator.`
                : "Anda belum login ke sistem admin. Silakan masuk menggunakan akun Administrator."}
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={() => quickLogin("admin")}
              className="w-full py-3 bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20 transition-all cursor-pointer"
            >
              <TrendingUp className="w-4 h-4" />
              <span>Login Instan sebagai Admin (Demo)</span>
            </button>

            <Link
              href="/login?redirect=/admin"
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 border border-slate-700 transition-all block text-center"
            >
              Halaman Login Kredensial
            </Link>

            <Link
              href="/pos"
              className="w-full py-2.5 text-slate-400 hover:text-white font-semibold text-xs flex items-center justify-center gap-1 transition-all block text-center"
            >
              Buka POS Kasir Terminal →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row text-slate-800">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-900 text-white flex flex-col border-r border-slate-800 shrink-0">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center font-black text-sm">
              RS
            </div>
            <div>
              <h1 className="font-extrabold text-sm leading-tight">RestoSync</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Admin Back-Office
              </p>
            </div>
          </div>
        </div>

        {/* Admin User Profile pill */}
        <div className="p-3 mx-3 my-2 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between">
          <div className="truncate">
            <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block">
              {user.role}
            </span>
            <span className="text-xs font-bold text-white truncate block">{user.name}</span>
          </div>
          <button
            onClick={logout}
            title="Keluar / Logout"
            className="p-1.5 rounded-lg bg-slate-700/60 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>

        <nav className="p-3 space-y-1 flex-1">
          {[
            { id: "analytics", label: "Ringkasan Finansial", icon: TrendingUp },
            { id: "menus", label: "Master Data Menu", icon: UtensilsCrossed },
            { id: "tables", label: "Meja & Generator QR", icon: QrCode },
            { id: "inventory", label: "Stok Bahan & Resep", icon: Package },
            { id: "shifts", label: "Rekap Shift & Audit", icon: History },
            { id: "users", label: "Kelola Staff & User", icon: Users },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? "bg-orange-500 text-white shadow-sm shadow-orange-500/25"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Quick Portal Switch */}
        <div className="p-3 border-t border-slate-800 space-y-2">
          <Link
            href="/pos"
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <span>Buka POS Kasir</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/"
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <span>Kembali ke Portal</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 p-4 md:p-6 overflow-y-auto space-y-6">
        {/* TAB 1: FINANCIAL ANALYTICS (FR-ADM-004) */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">
                  Dashboard Analitik Finansial
                </h2>
                <p className="text-xs text-slate-500">
                  Performa pendapatan, laba kotor, dan rekapitulasi metode pembayaran restoran.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={fetchSalesSummary}
                  className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 flex items-center gap-1.5 shadow-2xs"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh</span>
                </button>
                <button
                  onClick={handleExportExcel}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-emerald-600/20"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Ekspor Excel (.xlsx)</span>
                </button>
              </div>
            </div>

            {/* Metric KPI Cards */}
            {salesData && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                    <span>Total Pendapatan (Gross)</span>
                    <DollarSign className="w-4 h-4 text-orange-500" />
                  </div>
                  <p className="text-xl font-black text-slate-900">
                    {formatIDR(salesData.summary.totalRevenue)}
                  </p>
                  <p className="text-[11px] text-emerald-600 font-semibold">
                    Termasuk PB1 & Service
                  </p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                    <span>Estimasi Gross Profit</span>
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                  </div>
                  <p className="text-xl font-black text-emerald-600">
                    {formatIDR(salesData.summary.grossProfit)}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Est. Food Cost ~35%: {formatIDR(salesData.summary.estimatedCOGS)}
                  </p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                    <span>Total Transaksi Selesai</span>
                    <ShoppingBag className="w-4 h-4 text-blue-500" />
                  </div>
                  <p className="text-xl font-black text-slate-900">
                    {salesData.summary.totalOrdersCount} Pesanan
                  </p>
                  <p className="text-[11px] text-slate-500">Pesanan terbayar lunas</p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                    <span>Rata-rata Nilai Pesanan</span>
                    <Users className="w-4 h-4 text-purple-500" />
                  </div>
                  <p className="text-xl font-black text-slate-900">
                    {formatIDR(salesData.summary.avgOrderValue)}
                  </p>
                  <p className="text-[11px] text-slate-500">Average Basket Size</p>
                </div>
              </div>
            )}

            {/* Payment Method Breakdown & Top Selling Items */}
            {salesData && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Payment Breakdown */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                  <h3 className="font-bold text-sm text-slate-900">
                    Rekapitulasi Metode Pembayaran
                  </h3>

                  <div className="space-y-2.5">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs">
                          Rp
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">Tunai (Cash)</p>
                          <p className="text-[10px] text-slate-500">Uang fisik di kasir</p>
                        </div>
                      </div>
                      <span className="font-extrabold text-xs text-slate-900">
                        {formatIDR(salesData.paymentBreakdown.cash)}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs">
                          QR
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">QRIS Dinamis</p>
                          <p className="text-[10px] text-slate-500">E-wallet & Mobile Banking</p>
                        </div>
                      </div>
                      <span className="font-extrabold text-xs text-slate-900">
                        {formatIDR(salesData.paymentBreakdown.qris)}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                          EDC
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">Kartu Debit</p>
                          <p className="text-[10px] text-slate-500">Mesin EDC kasir</p>
                        </div>
                      </div>
                      <span className="font-extrabold text-xs text-slate-900">
                        {formatIDR(salesData.paymentBreakdown.debit)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Top Selling Items (Ranking) */}
                <div className="lg:col-span-2 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-slate-900">
                      Menu Terlaris (Top Selling Items)
                    </h3>
                    <span className="text-xs text-slate-500">Berdasarkan porsi terjual</span>
                  </div>

                  <div className="space-y-2">
                    {salesData.topSellingItems?.length === 0 ? (
                      <p className="text-xs text-slate-400 py-6 text-center">Belum ada penjualan selesai.</p>
                    ) : (
                      salesData.topSellingItems.map((item: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200/60 text-xs"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-5 font-black text-slate-400 text-xs">#{idx + 1}</span>
                            <span className="font-bold text-slate-800">{item.name}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 font-extrabold text-[11px]">
                              {item.quantity} Porsi
                            </span>
                            <span className="font-extrabold text-slate-900">
                              {formatIDR(item.revenue)}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MENU & MODIFIER MANAGEMENT (FR-ADM-001) */}
        {activeTab === "menus" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">Master Data Menu & Varian</h2>
                <p className="text-xs text-slate-500">
                  Kelola konfigurasi harga, foto produk, ketersediaan, dan kelompok varian.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAddMenuModal(true)}
                  className="px-3.5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-orange-600/20"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Menu Baru</span>
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari menu berdasarkan nama..."
                value={menuSearch}
                onChange={(e) => setMenuSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>

            {/* Menu Table */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="p-3">Foto & Nama Menu</th>
                      <th className="p-3">Kategori</th>
                      <th className="p-3">Harga</th>
                      <th className="p-3">Status Stok</th>
                      <th className="p-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {menus
                      .filter((m) => m.name.toLowerCase().includes(menuSearch.toLowerCase()))
                      .map((menu) => (
                        <tr key={menu.id} className="hover:bg-slate-50/80">
                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                                {menu.image ? (
                                  <Image
                                    src={menu.image}
                                    alt={menu.name}
                                    fill
                                    className="object-cover"
                                    sizes="48px"
                                  />
                                ) : (
                                  <Coffee className="w-6 h-6 m-auto text-slate-400" />
                                )}
                              </div>
                              <div>
                                <p className="font-bold text-slate-900">{menu.name}</p>
                                <p className="text-[11px] text-slate-400 line-clamp-1">
                                  {menu.description || "Tidak ada deskripsi"}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 font-semibold text-slate-700">
                            {menu.category?.name}
                          </td>
                          <td className="p-3 font-extrabold text-orange-600">
                            {formatIDR(menu.price)}
                          </td>
                          <td className="p-3">
                            <button
                              onClick={() => handleToggleMenuAvailability(menu.id, menu.isAvailable)}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                menu.isAvailable
                                  ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                                  : "bg-red-100 text-red-800 hover:bg-red-200"
                              }`}
                            >
                              {menu.isAvailable ? "Tersedia (Ready)" : "Sold Out (Habis)"}
                            </button>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => {
                                setEditMenuForm({
                                  id: menu.id,
                                  name: menu.name,
                                  categoryId: String(menu.categoryId),
                                  description: menu.description || "",
                                  price: String(menu.price),
                                  image: menu.image || "",
                                  isAvailable: menu.isAvailable,
                                });
                                setShowEditMenuModal(true);
                              }}
                              className="p-1.5 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg mr-1 cursor-pointer transition-colors"
                              title="Edit Menu"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteMenu(menu.id, menu.name)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                              title="Hapus Menu"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: TABLE MANAGEMENT & QR GENERATOR (FR-ADM-002) */}
        {activeTab === "tables" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">
                  Manajemen Meja & QR Code Generator
                </h2>
                <p className="text-xs text-slate-500">
                  Layout denah fisik restoran & generator QR Code beresolusi tinggi dengan branding RestoSync.
                </p>
              </div>

              <button
                onClick={() => setShowAddTableModal(true)}
                className="px-3.5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-orange-600/20"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Meja Baru</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {tables.map((table) => (
                <div
                  key={table.id}
                  className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="font-black text-base text-slate-900">{table.tableNumber}</h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {table.area}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Kapasitas: {table.capacity} Orang • Status: {table.status}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono truncate mt-1 bg-slate-50 p-1 rounded-md">
                      Token: {table.qrToken}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex gap-2">
                    <button
                      onClick={() => setSelectedTableQr(table)}
                      className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>Lihat & Unduh QR</span>
                    </button>
                    <button
                      onClick={() => handleRegenerateQr(table.id)}
                      title="Regenerate QR Token"
                      className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: RAW INGREDIENTS & RECIPES (FR-ADM-003) */}
        {activeTab === "inventory" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">
                  Inventaris Bahan Baku & Resep Menu
                </h2>
                <p className="text-xs text-slate-500">
                  Stok bahan otomatis terpotong saat status pesanan dikonfirmasi oleh kasir / dapur.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ingredients.map((ing) => {
                const isLowStock = ing.stockQuantity <= ing.minStock;

                return (
                  <div
                    key={ing.id}
                    className={`bg-white rounded-2xl border p-4 shadow-2xs space-y-3 ${
                      isLowStock ? "border-red-400 bg-red-50/20" : "border-slate-200"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-sm text-slate-900">{ing.name}</h3>
                        <p className="text-xs text-slate-500">Satuan: {ing.unit}</p>
                      </div>
                      {isLowStock && (
                        <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 text-[10px] font-black flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Hampir Habis</span>
                        </span>
                      )}
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 flex justify-between items-center text-xs">
                      <div>
                        <span className="text-slate-500 block text-[10px]">Stok Tersisa:</span>
                        <span className="font-black text-base text-slate-900">
                          {ing.stockQuantity} {ing.unit}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-500 block text-[10px]">Min. Batas Aman:</span>
                        <span className="font-bold text-slate-700">
                          {ing.minStock} {ing.unit}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedIngredient(ing);
                        setShowRestockModal(true);
                      }}
                      className="w-full py-2 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Stok (Restock)</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 5: SHIFT RECONCILIATION AUDIT & LOGS */}
        {activeTab === "shifts" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">
                Audit Rekonsiliasi Kasir & Shift
              </h2>
              <p className="text-xs text-slate-500">
                Riwayat buka/tutup kasir, pelacakan selisih kas fisik vs sistem, dan audit trail void.
              </p>
            </div>

            {/* Shift History Table */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs space-y-3 p-4">
              <h3 className="font-bold text-sm text-slate-900">Riwayat Sesi Shift Kasir</h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="p-3">Kasir</th>
                      <th className="p-3">Waktu Buka / Tutup</th>
                      <th className="p-3">Modal Awal</th>
                      <th className="p-3">Ekspektasi Kas</th>
                      <th className="p-3">Fisik di Laci</th>
                      <th className="p-3">Selisih Kas</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {shiftHistory.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50/80">
                        <td className="p-3 font-bold text-slate-900">{s.cashierName}</td>
                        <td className="p-3 text-slate-500">
                          <div>Buka: {formatDate(s.openedAt)}</div>
                          {s.closedAt && <div>Tutup: {formatDate(s.closedAt)}</div>}
                        </td>
                        <td className="p-3 font-semibold">{formatIDR(s.startCash)}</td>
                        <td className="p-3 font-semibold">
                          {s.endCashExpected !== null ? formatIDR(s.endCashExpected) : "-"}
                        </td>
                        <td className="p-3 font-semibold">
                          {s.endCashActual !== null ? formatIDR(s.endCashActual) : "-"}
                        </td>
                        <td className="p-3 font-bold">
                          {s.variance !== null ? (
                            <span
                              className={
                                s.variance === 0
                                  ? "text-emerald-600"
                                  : s.variance > 0
                                  ? "text-blue-600"
                                  : "text-red-600"
                              }
                            >
                              {formatIDR(s.variance)}
                            </span>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              s.status === "open"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {s.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Audit Trail Timeline */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
              <h3 className="font-bold text-sm text-slate-900">Audit Trail Sistem (50 Aktivitas Terakhir)</h3>

              <div className="space-y-2 max-h-80 overflow-y-auto">
                {auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 text-xs flex items-start justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{log.action}</span>
                        <span className="text-slate-400">•</span>
                        <span className="text-[11px] text-slate-500 font-semibold">{log.user}</span>
                      </div>
                      <p className="text-slate-600 mt-0.5">{log.details}</p>
                    </div>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap pl-2">
                      {formatDate(log.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: USER & STAFF MANAGEMENT (MULTI-ROLE) */}
        {activeTab === "users" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">
                  Manajemen Staff & Pengguna (Multi-Role)
                </h2>
                <p className="text-xs text-slate-500">
                  Kelola akun Administrator, Kasir POS, dan Pelanggan/Customer dalam ekosistem restoran.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={fetchUsers}
                  disabled={loadingUsers}
                  className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingUsers ? "animate-spin" : ""}`} />
                  <span>Refresh</span>
                </button>
                <button
                  onClick={() => setShowAddUserModal(true)}
                  className="px-3.5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-orange-600/20 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Staff / User</span>
                </button>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="p-3">Nama & Username</th>
                      <th className="p-3">Role Hak Akses</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Telepon</th>
                      <th className="p-3">Aktivitas</th>
                      <th className="p-3">Terdaftar Sejak</th>
                      <th className="p-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {usersList.map((u) => {
                      const roleColor =
                        u.role === "admin"
                          ? "bg-purple-100 text-purple-800 border-purple-200"
                          : u.role === "kasir"
                          ? "bg-blue-100 text-blue-800 border-blue-200"
                          : "bg-orange-100 text-orange-800 border-orange-200";

                      return (
                        <tr key={u.id} className="hover:bg-slate-50/80">
                          <td className="p-3">
                            <div>
                              <p className="font-bold text-slate-900">{u.name}</p>
                              <p className="text-[11px] font-mono text-slate-400">@{u.username}</p>
                            </div>
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${roleColor}`}
                            >
                              {u.role}
                            </span>
                          </td>
                          <td className="p-3 text-slate-600 font-medium">{u.email}</td>
                          <td className="p-3 text-slate-500">{u.phone || "-"}</td>
                          <td className="p-3 text-slate-600 text-[11px]">
                            {u._count ? (
                              <span>
                                {u._count.orders || 0} Order • {u._count.shifts || 0} Shift
                              </span>
                            ) : (
                              "-"
                            )}
                          </td>
                          <td className="p-3 text-slate-400 text-[11px]">
                            {formatDate(u.createdAt)}
                          </td>
                          <td className="p-3 text-right">
                            {u.id !== user?.id ? (
                              <button
                                onClick={() => handleDeleteUser(u.id, u.name)}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                                title="Hapus User"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            ) : (
                              <span className="text-[10px] text-slate-400 italic">Akun Anda</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL: ADD MENU */}
      {showAddMenuModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-900 text-base">Tambah Menu Baru</h3>
              <button onClick={() => setShowAddMenuModal(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Kategori</label>
                <select
                  value={menuForm.categoryId}
                  onChange={(e) => setMenuForm({ ...menuForm, categoryId: e.target.value })}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-xl bg-white"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Nama Menu</label>
                <input
                  type="text"
                  placeholder="Contoh: Bebek Goreng Kremes"
                  value={menuForm.name}
                  onChange={(e) => setMenuForm({ ...menuForm, name: e.target.value })}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Harga (IDR)</label>
                <input
                  type="number"
                  placeholder="45000"
                  value={menuForm.price}
                  onChange={(e) => setMenuForm({ ...menuForm, price: e.target.value })}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">URL Foto (Unsplash)</label>
                <input
                  type="text"
                  value={menuForm.image}
                  onChange={(e) => setMenuForm({ ...menuForm, image: e.target.value })}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Deskripsi Singkat</label>
                <textarea
                  rows={2}
                  value={menuForm.description}
                  onChange={(e) => setMenuForm({ ...menuForm, description: e.target.value })}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-xl"
                />
              </div>
            </div>

            <button
              onClick={handleCreateMenu}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2.5 rounded-xl text-xs"
            >
              Simpan Menu Baru
            </button>
          </div>
        </div>
      )}

      {/* MODAL: ADD TABLE */}
      {showAddTableModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-900 text-base">Tambah Meja Restoran</h3>
              <button onClick={() => setShowAddTableModal(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Nomor / Nama Meja</label>
                <input
                  type="text"
                  placeholder="Contoh: Meja 09 atau VIP 03"
                  value={tableForm.tableNumber}
                  onChange={(e) => setTableForm({ ...tableForm, tableNumber: e.target.value })}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Kapasitas Tamu</label>
                <input
                  type="number"
                  value={tableForm.capacity}
                  onChange={(e) => setTableForm({ ...tableForm, capacity: e.target.value })}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Area Meja</label>
                <select
                  value={tableForm.area}
                  onChange={(e) => setTableForm({ ...tableForm, area: e.target.value })}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-xl bg-white"
                >
                  <option value="Indoor">Indoor (AC)</option>
                  <option value="Outdoor">Outdoor (Smoking)</option>
                  <option value="Lantai 2">Lantai 2 (VIP)</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleCreateTable}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2.5 rounded-xl text-xs"
            >
              Buat Meja & Generate Token
            </button>
          </div>
        </div>
      )}

      {/* MODAL: VIEW & DOWNLOAD HIGH-RESOLUTION QR CODE (FR-ADM-002) */}
      {selectedTableQr && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl space-y-4 text-center">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-400">RestoSync QR Generator</span>
              <button onClick={() => setSelectedTableQr(null)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Standee Preview Card for Table */}
            <div
              id="qr-standee-card"
              className="bg-radial from-orange-50 to-white p-5 rounded-2xl border-2 border-orange-500/30 shadow-md space-y-3"
            >
              <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center font-black mx-auto shadow-sm">
                RS
              </div>
              <div>
                <h4 className="font-extrabold text-lg text-slate-900">
                  {selectedTableQr.tableNumber}
                </h4>
                <p className="text-xs text-slate-500">
                  {selectedTableQr.area} • Pindai untuk Memesan Langsung
                </p>
              </div>

              {qrDataUrl && (
                <div className="p-3 bg-white rounded-xl shadow-2xs border border-slate-200 inline-block">
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
                download={`QR-${selectedTableQr.tableNumber}.png`}
                className="flex-1 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-orange-600/20"
              >
                <Download className="w-4 h-4" />
                <span>Unduh PNG (300 DPI)</span>
              </a>
              <a
                href={`/table/${selectedTableQr.qrToken}`}
                target="_blank"
                rel="noreferrer"
                className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
              >
                Buka Tab ↗
              </a>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: RESTOCK INGREDIENT */}
      {showRestockModal && selectedIngredient && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Restock Bahan Baku</h3>
                <p className="text-xs text-slate-500">{selectedIngredient.name}</p>
              </div>
              <button onClick={() => setShowRestockModal(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Jumlah Tambahan ({selectedIngredient.unit}):
              </label>
              <input
                type="number"
                placeholder="Contoh: 5000"
                value={restockAmount}
                onChange={(e) => setRestockAmount(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-xl"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Stok saat ini: {selectedIngredient.stockQuantity} {selectedIngredient.unit}
              </p>
            </div>

            <button
              onClick={handleExecuteRestock}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2.5 rounded-xl text-xs"
            >
              Simpan Penambahan Stok
            </button>
          </div>
        </div>
      )}

      {/* MODAL: EDIT MENU */}
      {showEditMenuModal && editMenuForm && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-900 text-base">Edit Menu</h3>
              <button
                onClick={() => {
                  setShowEditMenuModal(false);
                  setEditMenuForm(null);
                }}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Kategori</label>
                <select
                  value={editMenuForm.categoryId}
                  onChange={(e) => setEditMenuForm({ ...editMenuForm, categoryId: e.target.value })}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-xl bg-white"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Nama Menu</label>
                <input
                  type="text"
                  value={editMenuForm.name}
                  onChange={(e) => setEditMenuForm({ ...editMenuForm, name: e.target.value })}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Harga (IDR)</label>
                <input
                  type="number"
                  value={editMenuForm.price}
                  onChange={(e) => setEditMenuForm({ ...editMenuForm, price: e.target.value })}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">URL Foto Menu</label>
                <input
                  type="text"
                  value={editMenuForm.image}
                  onChange={(e) => setEditMenuForm({ ...editMenuForm, image: e.target.value })}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Deskripsi</label>
                <textarea
                  rows={2}
                  value={editMenuForm.description}
                  onChange={(e) => setEditMenuForm({ ...editMenuForm, description: e.target.value })}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="editMenuAvailable"
                  checked={editMenuForm.isAvailable}
                  onChange={(e) =>
                    setEditMenuForm({ ...editMenuForm, isAvailable: e.target.checked })
                  }
                  className="w-4 h-4 rounded text-orange-600"
                />
                <label htmlFor="editMenuAvailable" className="text-xs font-bold text-slate-700">
                  Menu Tersedia (Ready to Order)
                </label>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setShowEditMenuModal(false);
                  setEditMenuForm(null);
                }}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleUpdateMenu}
                className="flex-1 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold cursor-pointer"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD USER / STAFF */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-900 text-base">Tambah Akun Staff / User</h3>
              <button
                onClick={() => setShowAddUserModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Role Akun</label>
                <select
                  value={userForm.role}
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-xl bg-white font-semibold"
                >
                  <option value="kasir">Kasir (POS Terminal Access)</option>
                  <option value="admin">Admin (Full Back-Office Access)</option>
                  <option value="user">User (Customer / Pelanggan)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  placeholder="Contoh: Rina Melati (Kasir Siang)"
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Username</label>
                  <input
                    type="text"
                    placeholder="rina_kasir"
                    value={userForm.username}
                    onChange={(e) =>
                      setUserForm({
                        ...userForm,
                        username: e.target.value.toLowerCase().replace(/\s+/g, ""),
                      })
                    }
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Telepon (HP)</label>
                  <input
                    type="text"
                    placeholder="08123456789"
                    value={userForm.phone}
                    onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Email</label>
                <input
                  type="email"
                  placeholder="rina@restosync.com"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-xl"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddUserModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleCreateUser}
                className="flex-1 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold cursor-pointer"
              >
                Simpan Akun
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
