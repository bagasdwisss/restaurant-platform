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
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { formatIDR, formatDate } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";

export default function AdminDashboardPage() {
  const { user, logout, quickLogin, loading: authLoading } = useAuth();
  const { toast } = useToast();
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
      toast.warning("Harap lengkapi semua data akun staf.", "Data Belum Lengkap");
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
        toast.success(`Akun staf "${userForm.name}" berhasil dibuat!`, "Akun Dibuat");
      } else {
        toast.error(data.message || "Gagal membuat akun.", "Gagal Membuat Akun");
      }
    } catch {
      toast.error("Terjadi kesalahan koneksi saat membuat akun.", "Gangguan Koneksi");
    }
  };

  const handleDeleteUser = async (id: number, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus akun "${name}"?`)) return;
    try {
      const res = await fetch(`/api/v1/admin/users?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        fetchUsers();
        toast.success(`Akun "${name}" berhasil dihapus.`, "Akun Dihapus");
      } else {
        toast.error(data.message || "Gagal menghapus user.", "Gagal Hapus");
      }
    } catch {
      toast.error("Terjadi kesalahan saat menghapus akun.", "Gangguan Koneksi");
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
        toast.success(`Menu "${editMenuForm.name}" berhasil diperbarui!`, "Menu Diperbarui");
      } else {
        toast.error(data.message || "Gagal memperbarui menu.", "Gagal Update Menu");
      }
    } catch {
      toast.error("Terjadi kesalahan saat memperbarui menu.", "Gangguan Koneksi");
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
          dark: "#18181B",
          light: "#FFFFFF",
        },
      }).then((url) => {
        setQrDataUrl(url);
      });
    }
  }, [selectedTableQr]);

  // Export Sales to Excel (.xlsx)
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

    XLSX.writeFile(workbook, `Laporan-SAVORIA-${new Date().toISOString().slice(0, 10)}.xlsx`);
    toast.success("Laporan penjualan Excel berhasil diekspor dan diunduh!", "Ekspor Selesai");
  };

  // Add Menu Handler
  const handleCreateMenu = async () => {
    if (!menuForm.name || !menuForm.price || !menuForm.categoryId) {
      toast.warning("Harap lengkapi nama menu, harga, dan kategori.", "Form Belum Lengkap");
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
        toast.success(`Menu "${menuForm.name}" berhasil ditambahkan ke katalog!`, "Menu Ditambahkan");
      } else {
        toast.error(data.message || "Gagal membuat menu.", "Gagal Tambah Menu");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan koneksi saat membuat menu.", "Gangguan Koneksi");
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
      toast.info(`Status menu berhasil diubah menjadi ${!current ? "Tersedia" : "Habis"}.`, "Status Menu");
    } catch (err) {
      toast.error("Gagal mengubah ketersediaan menu.", "Gagal Update");
    }
  };

  // Delete Menu
  const handleDeleteMenu = async (menuId: number, menuName: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus menu "${menuName}"?`)) return;
    try {
      await fetch(`/api/v1/admin/menus/${menuId}`, { method: "DELETE" });
      fetchMenus();
      toast.success(`Menu "${menuName}" berhasil dihapus.`, "Menu Dihapus");
    } catch (err) {
      toast.error("Gagal menghapus menu.", "Gagal Hapus");
    }
  };

  // Add Table Handler
  const handleCreateTable = async () => {
    if (!tableForm.tableNumber) {
      toast.warning("Nomor meja wajib diisi.", "Nomor Meja Diperlukan");
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
        toast.success(`Meja #${tableForm.tableNumber} berhasil didaftarkan!`, "Meja Ditambahkan");
      } else {
        toast.error(data.message || "Gagal membuat meja.", "Gagal Buat Meja");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan saat membuat meja.", "Gangguan Koneksi");
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
        toast.success("QR Token baru berhasil digenerate dan diperbarui!", "QR Token Diperbarui");
        fetchTables();
        if (selectedTableQr?.id === tableId) {
          setSelectedTableQr(data.data);
        }
      }
    } catch (err) {
      toast.error("Gagal meregenerasi token QR meja.", "Gagal Update");
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
        toast.success(`Stok ${selectedIngredient.name} berhasil ditambahkan!`, "Restock Berhasil");
        setShowRestockModal(false);
        setRestockAmount("");
        setSelectedIngredient(null);
        fetchIngredients();
      } else {
        toast.error(data.message || "Gagal memperbarui stok.", "Restock Gagal");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan koneksi saat memperbarui stok.", "Gangguan Koneksi");
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] text-[#18181B] flex items-center justify-center">
        <div className="flex items-center gap-3 bg-white px-6 py-4 rounded-2xl shadow-sm border border-slate-200/80">
          <RefreshCw className="w-5 h-5 animate-spin text-[#EA580C]" />
          <span className="text-sm font-medium">Memverifikasi otentikasi administrator...</span>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-[#FDFBF7] text-[#18181B] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-xl">
          <div className="w-16 h-16 rounded-full bg-[#EA580C]/10 text-[#EA580C] flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#EA580C] bg-[#EA580C]/10 px-3 py-1 rounded-full">
              Hak Akses Terbatas (Administrator)
            </span>
            <h2 className="font-serif text-2xl font-bold text-[#18181B] mt-3">SAVORIA Admin Suite</h2>
            <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
              {user
                ? `Akun Anda (${user.name}) memiliki role [${user.role.toUpperCase()}]. Halaman konfigurasi master data dan analitik finansial ini hanya dapat diakses oleh Administrator.`
                : "Anda belum login ke sistem admin. Silakan masuk menggunakan akun Administrator."}
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={() => quickLogin("admin")}
              className="w-full py-3 bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold rounded-full text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#EA580C]/25 transition-all cursor-pointer"
            >
              <TrendingUp className="w-4 h-4" />
              <span>Login Instan sebagai Admin (Demo)</span>
            </button>

            <Link
              href="/login?redirect=/admin"
              className="w-full py-2.5 bg-white hover:bg-slate-50 text-[#18181B] font-bold rounded-full text-xs flex items-center justify-center gap-2 border border-slate-200/80 transition-all block text-center shadow-sm"
            >
              Halaman Login Kredensial
            </Link>

            <Link
              href="/pos"
              className="w-full py-2.5 text-[#64748B] hover:text-[#18181B] font-semibold text-xs flex items-center justify-center gap-1 transition-all block text-center"
            >
              Buka POS Kasir Terminal →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col md:flex-row text-[#18181B]">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-[#14281D] text-white flex flex-col shrink-0 shadow-xl sticky top-0 z-40 md:static">
        {/* Top brand & quick actions bar */}
        <div className="p-3.5 sm:p-5 border-b border-white/10 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#EA580C] text-white flex items-center justify-center font-bold text-sm sm:text-base shadow-md shadow-[#EA580C]/30 shrink-0">
              S
            </div>
            <div>
              <h1 className="font-serif font-bold text-sm sm:text-base tracking-tight leading-tight">SAVORIA</h1>
              <p className="text-[9px] sm:text-[10px] text-amber-300 font-semibold uppercase tracking-wider">
                Executive Suite
              </p>
            </div>
          </Link>

          {/* Quick links & Logout for Mobile */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              href="/pos"
              className="px-2.5 py-1 bg-white/10 text-white rounded-full text-[11px] font-semibold flex items-center gap-1"
            >
              <span>POS</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
            <button
              onClick={logout}
              title="Keluar / Logout"
              className="p-1.5 rounded-full bg-white/10 text-slate-300 hover:text-white cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Admin User Profile pill (hidden on mobile to save vertical space, shown on desktop) */}
        <div className="hidden md:flex p-3.5 mx-3.5 my-3 rounded-2xl bg-white/5 border border-white/10 items-center justify-between backdrop-blur-xs">
          <div className="truncate">
            <span className="text-[9px] font-bold text-[#EA580C] uppercase tracking-wider block font-mono">
              {user.role}
            </span>
            <span className="text-xs font-bold text-white truncate block">{user.name}</span>
          </div>
          <button
            onClick={logout}
            title="Keluar / Logout"
            className="p-1.5 rounded-full bg-white/10 hover:bg-rose-500/20 hover:text-rose-400 text-slate-300 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Nav tabs: Horizontal on mobile, Vertical on desktop */}
        <nav className="p-2 sm:p-2.5 md:p-3 flex md:flex-col gap-1.5 overflow-x-auto scrollbar-none whitespace-nowrap">
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
                className={`flex items-center gap-2 sm:gap-3 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full md:rounded-2xl text-xs font-bold transition-all cursor-pointer shrink-0 md:w-full ${
                  isActive
                    ? "bg-[#EA580C] text-white shadow-md shadow-[#EA580C]/25"
                    : "text-slate-300 hover:text-white hover:bg-white/10 bg-white/5 md:bg-transparent"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Quick Portal Switch (desktop only) */}
        <div className="hidden md:block p-4 border-t border-white/10 space-y-2 mt-auto">
          <Link
            href="/pos"
            className="w-full py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full text-xs font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <span>Buka POS Kasir</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/"
            className="w-full py-2 text-slate-300 hover:text-white rounded-full text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
          >
            <span>Kembali ke Beranda</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 p-3.5 sm:p-6 md:p-8 overflow-y-auto space-y-6">
        {/* TAB 1: FINANCIAL ANALYTICS */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#18181B]">
                  Dashboard Analitik Finansial
                </h2>
                <p className="text-xs text-[#64748B]">
                  Performa pendapatan, estimasi laba kotor, dan rekapitulasi transaksi SAVORIA.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={fetchSalesSummary}
                  className="px-4 py-2 bg-white border border-slate-200/80 hover:bg-slate-50 rounded-full text-xs font-semibold text-[#64748B] hover:text-[#18181B] flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh Data</span>
                </button>
                <button
                  onClick={handleExportExcel}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Ekspor Excel (.xlsx)</span>
                </button>
              </div>
            </div>

            {/* Metric KPI Cards */}
            {salesData && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-[#64748B] text-xs font-bold">
                    <span>Total Pendapatan (Gross)</span>
                    <div className="w-8 h-8 rounded-full bg-[#EA580C]/10 text-[#EA580C] flex items-center justify-center">
                      <DollarSign className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="font-serif text-2xl font-bold text-[#18181B]">
                    {formatIDR(salesData.summary.totalRevenue)}
                  </p>
                  <p className="text-[11px] text-emerald-700 font-semibold">
                    Termasuk PB1 & Service Charge
                  </p>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-[#64748B] text-xs font-bold">
                    <span>Estimasi Gross Profit</span>
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="font-serif text-2xl font-bold text-emerald-700">
                    {formatIDR(salesData.summary.grossProfit)}
                  </p>
                  <p className="text-[11px] text-[#64748B]">
                    Food Cost ~35%: {formatIDR(salesData.summary.estimatedCOGS)}
                  </p>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-[#64748B] text-xs font-bold">
                    <span>Transaksi Berhasil</span>
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="font-serif text-2xl font-bold text-[#18181B]">
                    {salesData.summary.totalOrdersCount} Pesanan
                  </p>
                  <p className="text-[11px] text-[#64748B]">Pesanan berstatus lunas</p>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-[#64748B] text-xs font-bold">
                    <span>Rata-rata Nilai Pesanan</span>
                    <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                      <Users className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="font-serif text-2xl font-bold text-[#18181B]">
                    {formatIDR(salesData.summary.avgOrderValue)}
                  </p>
                  <p className="text-[11px] text-[#64748B]">Average Basket Size</p>
                </div>
              </div>
            )}

            {/* Payment Method Breakdown & Top Selling Items */}
            {salesData && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Payment Breakdown */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
                  <h3 className="font-serif font-bold text-base text-[#18181B]">
                    Rekapitulasi Pembayaran
                  </h3>

                  <div className="space-y-3">
                    <div className="p-3.5 rounded-2xl bg-[#FDFBF7] border border-slate-200/80 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                          Rp
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#18181B]">Tunai (Cash)</p>
                          <p className="text-[10px] text-[#64748B]">Uang fisik di kasir</p>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-xs text-[#18181B]">
                        {formatIDR(salesData.paymentBreakdown.cash)}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-[#FDFBF7] border border-slate-200/80 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#EA580C]/10 text-[#EA580C] flex items-center justify-center font-bold text-xs">
                          QR
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#18181B]">QRIS Dinamis</p>
                          <p className="text-[10px] text-[#64748B]">E-wallet & Mobile Banking</p>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-xs text-[#18181B]">
                        {formatIDR(salesData.paymentBreakdown.qris)}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-[#FDFBF7] border border-slate-200/80 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                          EDC
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#18181B]">Kartu Debit/Kredit</p>
                          <p className="text-[10px] text-[#64748B]">Mesin EDC kasir</p>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-xs text-[#18181B]">
                        {formatIDR(salesData.paymentBreakdown.debit)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Top Selling Items (Ranking) */}
                <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif font-bold text-base text-[#18181B]">
                      Menu Terlaris (Top Selling Items)
                    </h3>
                    <span className="text-xs text-[#64748B]">Berdasarkan porsi terjual</span>
                  </div>

                  <div className="space-y-2.5">
                    {salesData.topSellingItems?.length === 0 ? (
                      <p className="text-xs text-[#64748B] py-8 text-center">Belum ada transaksi selesai.</p>
                    ) : (
                      salesData.topSellingItems.map((item: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 bg-[#FDFBF7] rounded-2xl border border-slate-200/80 text-xs"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-6 font-mono font-bold text-[#EA580C] text-xs">#{idx + 1}</span>
                            <span className="font-bold text-[#18181B]">{item.name}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="px-2.5 py-0.5 rounded-full bg-[#EA580C]/10 text-[#EA580C] font-bold text-[11px] font-mono">
                              {item.quantity} Porsi
                            </span>
                            <span className="font-mono font-bold text-[#18181B]">
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

        {/* TAB 2: MENU & MODIFIER MANAGEMENT */}
        {activeTab === "menus" && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#18181B]">Master Data Menu & Varian</h2>
                <p className="text-xs text-[#64748B]">
                  Kelola konfigurasi harga, foto produk, ketersediaan, dan kelompok varian hidangan SAVORIA.
                </p>
              </div>

              <button
                onClick={() => setShowAddMenuModal(true)}
                className="px-5 py-2.5 bg-[#EA580C] hover:bg-[#C2410C] text-white rounded-full text-xs font-bold flex items-center gap-1.5 shadow-md shadow-[#EA580C]/25 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Menu Baru</span>
              </button>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari menu berdasarkan nama..."
                value={menuSearch}
                onChange={(e) => setMenuSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200/80 rounded-full text-xs text-[#18181B] focus:ring-2 focus:ring-[#EA580C] focus:outline-none shadow-2xs"
              />
            </div>

            {/* Menu Table */}
            <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[650px]">
                  <thead className="bg-[#FDFBF7] border-b border-slate-200/80 text-[#64748B] font-bold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="p-4">Foto & Nama Menu</th>
                      <th className="p-4">Kategori</th>
                      <th className="p-4">Harga</th>
                      <th className="p-4">Status Stok</th>
                      <th className="p-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {menus
                      .filter((m) => m.name.toLowerCase().includes(menuSearch.toLowerCase()))
                      .map((menu) => (
                        <tr key={menu.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-100 shrink-0">
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
                                <p className="font-serif font-bold text-sm text-[#18181B]">{menu.name}</p>
                                <p className="text-[11px] text-[#64748B] line-clamp-1">
                                  {menu.description || "Tidak ada deskripsi"}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 font-semibold text-[#64748B]">
                            {menu.category?.name}
                          </td>
                          <td className="p-4 font-mono font-bold text-[#18181B]">
                            {formatIDR(menu.price)}
                          </td>
                          <td className="p-4">
                            <button
                              onClick={() => handleToggleMenuAvailability(menu.id, menu.isAvailable)}
                              className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                                menu.isAvailable
                                  ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                                  : "bg-rose-100 text-rose-800 hover:bg-rose-200"
                              }`}
                            >
                              {menu.isAvailable ? "Tersedia (Ready)" : "Habis (Sold Out)"}
                            </button>
                          </td>
                          <td className="p-4 text-right">
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
                              className="p-2 text-[#64748B] hover:text-[#EA580C] hover:bg-orange-50 rounded-full mr-1 cursor-pointer transition-colors"
                              title="Edit Menu"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteMenu(menu.id, menu.name)}
                              className="p-2 text-[#64748B] hover:text-rose-600 hover:bg-rose-50 rounded-full cursor-pointer transition-colors"
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

        {/* TAB 3: TABLE MANAGEMENT & QR GENERATOR */}
        {activeTab === "tables" && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#18181B]">
                  Manajemen Meja & QR Code Generator
                </h2>
                <p className="text-xs text-[#64748B]">
                  Layout denah fisik restoran & generator QR Code beresolusi tinggi dengan branding SAVORIA.
                </p>
              </div>

              <button
                onClick={() => setShowAddTableModal(true)}
                className="px-5 py-2.5 bg-[#EA580C] hover:bg-[#C2410C] text-white rounded-full text-xs font-bold flex items-center gap-1.5 shadow-md shadow-[#EA580C]/25 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Meja Baru</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {tables.map((table) => (
                <div
                  key={table.id}
                  className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm space-y-3 flex flex-col justify-between hover:shadow-md transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="font-serif font-bold text-base text-[#18181B]">{table.tableNumber}</h3>
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-[#64748B] font-mono">
                        {table.area}
                      </span>
                    </div>
                    <p className="text-xs text-[#64748B] mt-0.5">
                      Kapasitas: {table.capacity} Orang • Status: {table.status}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono truncate mt-2 bg-[#FDFBF7] p-2 rounded-xl border border-slate-200/60">
                      Token: {table.qrToken}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex gap-2">
                    <button
                      onClick={() => setSelectedTableQr(table)}
                      className="flex-1 py-2 bg-[#EA580C] hover:bg-[#C2410C] text-white rounded-full text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm shadow-[#EA580C]/20 transition-all cursor-pointer"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>Unduh QR Pass</span>
                    </button>
                    <button
                      onClick={() => handleRegenerateQr(table.id)}
                      title="Regenerate QR Token"
                      className="p-2 bg-slate-100 hover:bg-slate-200 text-[#64748B] rounded-full text-xs cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: RAW INGREDIENTS & RECIPES */}
        {activeTab === "inventory" && (
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
              {ingredients.map((ing) => {
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
              })}
            </div>
          </div>
        )}

        {/* TAB 5: SHIFT RECONCILIATION AUDIT & LOGS */}
        {activeTab === "shifts" && (
          <div className="space-y-6">
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#18181B]">
                Audit Rekonsiliasi Kasir & Shift
              </h2>
              <p className="text-xs text-[#64748B]">
                Riwayat buka/tutup kasir, pelacakan selisih kas fisik vs sistem, dan audit trail kasir.
              </p>
            </div>

            {/* Shift History Table */}
            <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm space-y-3 p-5">
              <h3 className="font-serif font-bold text-base text-[#18181B]">Riwayat Sesi Shift Kasir</h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[700px]">
                  <thead className="bg-[#FDFBF7] border-b border-slate-200/80 text-[#64748B] font-bold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="p-3.5">Kasir</th>
                      <th className="p-3.5">Waktu Buka / Tutup</th>
                      <th className="p-3.5">Modal Awal</th>
                      <th className="p-3.5">Ekspektasi Kas</th>
                      <th className="p-3.5">Fisik di Laci</th>
                      <th className="p-3.5">Selisih Kas</th>
                      <th className="p-3.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {shiftHistory.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="p-3.5 font-bold text-[#18181B]">{s.cashierName}</td>
                        <td className="p-3.5 text-[#64748B]">
                          <div>Buka: {formatDate(s.openedAt)}</div>
                          {s.closedAt && <div>Tutup: {formatDate(s.closedAt)}</div>}
                        </td>
                        <td className="p-3.5 font-mono font-semibold">{formatIDR(s.startCash)}</td>
                        <td className="p-3.5 font-mono font-semibold">
                          {s.endCashExpected !== null ? formatIDR(s.endCashExpected) : "-"}
                        </td>
                        <td className="p-3.5 font-mono font-semibold">
                          {s.endCashActual !== null ? formatIDR(s.endCashActual) : "-"}
                        </td>
                        <td className="p-3.5 font-mono font-bold">
                          {s.variance !== null ? (
                            <span
                              className={
                                s.variance === 0
                                  ? "text-emerald-700"
                                  : s.variance > 0
                                  ? "text-blue-700"
                                  : "text-rose-700"
                              }
                            >
                              {formatIDR(s.variance)}
                            </span>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono ${
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
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm space-y-3">
              <h3 className="font-serif font-bold text-base text-[#18181B]">Audit Trail Sistem (50 Aktivitas Terakhir)</h3>

              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-2xl bg-[#FDFBF7] border border-slate-200/80 text-xs flex items-start justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#18181B]">{log.action}</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-[11px] text-[#64748B] font-semibold">{log.user}</span>
                      </div>
                      <p className="text-[#64748B] mt-0.5">{log.details}</p>
                    </div>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap pl-2 font-mono">
                      {formatDate(log.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: USER & STAFF MANAGEMENT */}
        {activeTab === "users" && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#18181B]">
                  Manajemen Staff & Pengguna (Multi-Role)
                </h2>
                <p className="text-xs text-[#64748B]">
                  Kelola akun Administrator, Kasir POS, dan Tamu VIP dalam ekosistem SAVORIA.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={fetchUsers}
                  disabled={loadingUsers}
                  className="px-4 py-2 bg-white border border-slate-200/80 hover:bg-slate-50 rounded-full text-xs font-semibold text-[#64748B] hover:text-[#18181B] flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingUsers ? "animate-spin text-[#EA580C]" : ""}`} />
                  <span>Refresh Data</span>
                </button>
                <button
                  onClick={() => setShowAddUserModal(true)}
                  className="px-5 py-2.5 bg-[#EA580C] hover:bg-[#C2410C] text-white rounded-full text-xs font-bold flex items-center gap-1.5 shadow-md shadow-[#EA580C]/25 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Staff / User</span>
                </button>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[700px]">
                  <thead className="bg-[#FDFBF7] border-b border-slate-200/80 text-[#64748B] font-bold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="p-4">Nama & Username</th>
                      <th className="p-4">Role Akses</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Telepon</th>
                      <th className="p-4">Aktivitas</th>
                      <th className="p-4">Terdaftar</th>
                      <th className="p-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {usersList.map((u) => {
                      const roleColor =
                        u.role === "admin"
                          ? "bg-purple-100 text-purple-800 border-purple-200"
                          : u.role === "kasir"
                          ? "bg-blue-100 text-blue-800 border-blue-200"
                          : "bg-[#EA580C]/10 text-[#EA580C] border-[#EA580C]/20";

                      return (
                        <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="p-4">
                            <div>
                              <p className="font-bold text-[#18181B]">{u.name}</p>
                              <p className="text-[11px] font-mono text-[#64748B]">@{u.username}</p>
                            </div>
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border font-mono ${roleColor}`}
                            >
                              {u.role}
                            </span>
                          </td>
                          <td className="p-4 text-[#64748B] font-medium">{u.email}</td>
                          <td className="p-4 text-[#64748B]">{u.phone || "-"}</td>
                          <td className="p-4 text-[#64748B] text-[11px]">
                            {u._count ? (
                              <span>
                                {u._count.orders || 0} Order • {u._count.shifts || 0} Shift
                              </span>
                            ) : (
                              "-"
                            )}
                          </td>
                          <td className="p-4 text-[#64748B] text-[11px]">
                            {formatDate(u.createdAt)}
                          </td>
                          <td className="p-4 text-right">
                            {u.id !== user?.id ? (
                              <button
                                onClick={() => handleDeleteUser(u.id, u.name)}
                                className="p-2 text-[#64748B] hover:text-rose-600 hover:bg-rose-50 rounded-full cursor-pointer transition-colors"
                                title="Hapus User"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            ) : (
                              <span className="text-[10px] text-[#64748B] italic">Akun Anda</span>
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
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-serif font-bold text-[#18181B] text-base">Tambah Menu Baru</h3>
              <button onClick={() => setShowAddMenuModal(false)} className="text-[#64748B] hover:text-[#18181B]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[#18181B] block mb-1">Kategori</label>
                <select
                  value={menuForm.categoryId}
                  onChange={(e) => setMenuForm({ ...menuForm, categoryId: e.target.value })}
                  className="w-full text-xs p-3 border border-slate-200/80 rounded-2xl bg-white"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#18181B] block mb-1">Nama Menu</label>
                <input
                  type="text"
                  placeholder="Contoh: Wagyu A5 Striploin"
                  value={menuForm.name}
                  onChange={(e) => setMenuForm({ ...menuForm, name: e.target.value })}
                  className="w-full text-xs p-3 border border-slate-200/80 rounded-2xl"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#18181B] block mb-1">Harga (IDR)</label>
                <input
                  type="number"
                  placeholder="450000"
                  value={menuForm.price}
                  onChange={(e) => setMenuForm({ ...menuForm, price: e.target.value })}
                  className="w-full text-xs p-3 border border-slate-200/80 rounded-2xl"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#18181B] block mb-1">URL Foto (Unsplash)</label>
                <input
                  type="text"
                  value={menuForm.image}
                  onChange={(e) => setMenuForm({ ...menuForm, image: e.target.value })}
                  className="w-full text-xs p-3 border border-slate-200/80 rounded-2xl"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#18181B] block mb-1">Deskripsi Singkat</label>
                <textarea
                  rows={2}
                  value={menuForm.description}
                  onChange={(e) => setMenuForm({ ...menuForm, description: e.target.value })}
                  className="w-full text-xs p-3 border border-slate-200/80 rounded-2xl"
                />
              </div>
            </div>

            <button
              onClick={handleCreateMenu}
              className="w-full bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold py-3 rounded-full text-xs transition-all shadow-md shadow-[#EA580C]/25 cursor-pointer"
            >
              Simpan Menu Baru
            </button>
          </div>
        </div>
      )}

      {/* MODAL: ADD TABLE */}
      {showAddTableModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-serif font-bold text-[#18181B] text-base">Tambah Meja Restoran</h3>
              <button onClick={() => setShowAddTableModal(false)} className="text-[#64748B] hover:text-[#18181B]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[#18181B] block mb-1">Nomor / Nama Meja</label>
                <input
                  type="text"
                  placeholder="Contoh: Meja 12 atau VIP Suite 01"
                  value={tableForm.tableNumber}
                  onChange={(e) => setTableForm({ ...tableForm, tableNumber: e.target.value })}
                  className="w-full text-xs p-3 border border-slate-200/80 rounded-2xl"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#18181B] block mb-1">Kapasitas Tamu (Pax)</label>
                <input
                  type="number"
                  value={tableForm.capacity}
                  onChange={(e) => setTableForm({ ...tableForm, capacity: e.target.value })}
                  className="w-full text-xs p-3 border border-slate-200/80 rounded-2xl"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#18181B] block mb-1">Area Meja</label>
                <select
                  value={tableForm.area}
                  onChange={(e) => setTableForm({ ...tableForm, area: e.target.value })}
                  className="w-full text-xs p-3 border border-slate-200/80 rounded-2xl bg-white"
                >
                  <option value="Indoor">Indoor (Main Hall)</option>
                  <option value="Outdoor">Outdoor (Terrace)</option>
                  <option value="Lantai 2">Lantai 2 (VIP Suite)</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleCreateTable}
              className="w-full bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold py-3 rounded-full text-xs transition-all shadow-md shadow-[#EA580C]/25 cursor-pointer"
            >
              Buat Meja & Generate Token
            </button>
          </div>
        </div>
      )}

      {/* MODAL: VIEW & DOWNLOAD HIGH-RESOLUTION QR CODE */}
      {selectedTableQr && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl space-y-4 text-center">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-[#64748B]">SAVORIA QR Pass Generator</span>
              <button onClick={() => setSelectedTableQr(null)} className="text-[#64748B] hover:text-[#18181B]">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Standee Preview Card for Table */}
            <div
              id="qr-standee-card"
              className="bg-[#FDFBF7] p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-3"
            >
              <div className="w-12 h-12 rounded-full bg-[#EA580C] text-white flex items-center justify-center font-bold text-lg mx-auto shadow-sm">
                S
              </div>
              <div>
                <h4 className="font-serif font-bold text-lg text-[#18181B]">
                  {selectedTableQr.tableNumber}
                </h4>
                <p className="text-xs text-[#64748B]">
                  {selectedTableQr.area} • Pindai untuk Pemesanan Meja
                </p>
              </div>

              {qrDataUrl && (
                <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-200/80 inline-block">
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
                download={`SAVORIA-QR-${selectedTableQr.tableNumber}.png`}
                className="flex-1 py-3 bg-[#EA580C] hover:bg-[#C2410C] text-white rounded-full text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-[#EA580C]/25"
              >
                <Download className="w-4 h-4" />
                <span>Unduh PNG</span>
              </a>
              <a
                href={`/table/${selectedTableQr.qrToken}`}
                target="_blank"
                rel="noreferrer"
                className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-[#18181B] rounded-full text-xs font-bold"
              >
                Buka Tab ↗
              </a>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: RESTOCK INGREDIENT */}
      {showRestockModal && selectedIngredient && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-serif font-bold text-[#18181B] text-base">Restock Bahan Baku</h3>
                <p className="text-xs text-[#64748B]">{selectedIngredient.name}</p>
              </div>
              <button onClick={() => setShowRestockModal(false)} className="text-[#64748B] hover:text-[#18181B]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="text-xs font-bold text-[#18181B] block mb-1">
                Jumlah Tambahan ({selectedIngredient.unit}):
              </label>
              <input
                type="number"
                placeholder="Contoh: 5000"
                value={restockAmount}
                onChange={(e) => setRestockAmount(e.target.value)}
                className="w-full text-xs p-3 border border-slate-200/80 rounded-2xl"
              />
              <p className="text-[11px] text-[#64748B] mt-1 font-mono">
                Stok saat ini: {selectedIngredient.stockQuantity} {selectedIngredient.unit}
              </p>
            </div>

            <button
              onClick={handleExecuteRestock}
              className="w-full bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold py-3 rounded-full text-xs transition-all shadow-md shadow-[#EA580C]/25 cursor-pointer"
            >
              Simpan Penambahan Stok
            </button>
          </div>
        </div>
      )}

      {/* MODAL: EDIT MENU */}
      {showEditMenuModal && editMenuForm && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-serif font-bold text-[#18181B] text-base">Edit Menu</h3>
              <button
                onClick={() => {
                  setShowEditMenuModal(false);
                  setEditMenuForm(null);
                }}
                className="text-[#64748B] hover:text-[#18181B] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[#18181B] block mb-1">Kategori</label>
                <select
                  value={editMenuForm.categoryId}
                  onChange={(e) => setEditMenuForm({ ...editMenuForm, categoryId: e.target.value })}
                  className="w-full text-xs p-3 border border-slate-200/80 rounded-2xl bg-white"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#18181B] block mb-1">Nama Menu</label>
                <input
                  type="text"
                  value={editMenuForm.name}
                  onChange={(e) => setEditMenuForm({ ...editMenuForm, name: e.target.value })}
                  className="w-full text-xs p-3 border border-slate-200/80 rounded-2xl"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#18181B] block mb-1">Harga (IDR)</label>
                <input
                  type="number"
                  value={editMenuForm.price}
                  onChange={(e) => setEditMenuForm({ ...editMenuForm, price: e.target.value })}
                  className="w-full text-xs p-3 border border-slate-200/80 rounded-2xl"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#18181B] block mb-1">URL Foto Menu</label>
                <input
                  type="text"
                  value={editMenuForm.image}
                  onChange={(e) => setEditMenuForm({ ...editMenuForm, image: e.target.value })}
                  className="w-full text-xs p-3 border border-slate-200/80 rounded-2xl"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#18181B] block mb-1">Deskripsi</label>
                <textarea
                  rows={2}
                  value={editMenuForm.description}
                  onChange={(e) => setEditMenuForm({ ...editMenuForm, description: e.target.value })}
                  className="w-full text-xs p-3 border border-slate-200/80 rounded-2xl"
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
                  className="w-4 h-4 rounded text-[#EA580C]"
                />
                <label htmlFor="editMenuAvailable" className="text-xs font-bold text-[#18181B]">
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
                className="flex-1 py-3 rounded-full border border-slate-200 text-xs font-bold text-[#64748B] hover:bg-slate-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleUpdateMenu}
                className="flex-1 py-3 rounded-full bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-bold cursor-pointer shadow-md shadow-[#EA580C]/25"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD USER / STAFF */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-serif font-bold text-[#18181B] text-base">Tambah Akun Staff / User</h3>
              <button
                onClick={() => setShowAddUserModal(false)}
                className="text-[#64748B] hover:text-[#18181B] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[#18181B] block mb-1">Role Akun</label>
                <select
                  value={userForm.role}
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                  className="w-full text-xs p-3 border border-slate-200/80 rounded-2xl bg-white font-semibold"
                >
                  <option value="kasir">Kasir (POS Terminal Access)</option>
                  <option value="admin">Admin (Full Back-Office Access)</option>
                  <option value="user">User (Customer / Pelanggan)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#18181B] block mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  placeholder="Contoh: Rina Melati (Kasir)"
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  className="w-full text-xs p-3 border border-slate-200/80 rounded-2xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-[#18181B] block mb-1">Username</label>
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
                    className="w-full text-xs p-3 border border-slate-200/80 rounded-2xl"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#18181B] block mb-1">Telepon (HP)</label>
                  <input
                    type="text"
                    placeholder="08123456789"
                    value={userForm.phone}
                    onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                    className="w-full text-xs p-3 border border-slate-200/80 rounded-2xl"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#18181B] block mb-1">Email</label>
                <input
                  type="email"
                  placeholder="rina@savoria.com"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  className="w-full text-xs p-3 border border-slate-200/80 rounded-2xl"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#18181B] block mb-1">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  className="w-full text-xs p-3 border border-slate-200/80 rounded-2xl"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddUserModal(false)}
                className="flex-1 py-3 rounded-full border border-slate-200 text-xs font-bold text-[#64748B] hover:bg-slate-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleCreateUser}
                className="flex-1 py-3 rounded-full bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-bold cursor-pointer shadow-md shadow-[#EA580C]/25"
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
