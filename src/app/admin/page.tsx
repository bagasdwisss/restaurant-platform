"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import * as XLSX from "xlsx";
import { ShieldAlert, RefreshCw, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";
import { AdminSidebar, AdminTab } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AnalyticsTab } from "@/components/admin/AnalyticsTab";
import { MenusTab } from "@/components/admin/MenusTab";
import { TablesTab } from "@/components/admin/TablesTab";
import { InventoryTab } from "@/components/admin/InventoryTab";
import { ShiftsTab } from "@/components/admin/ShiftsTab";
import { UsersTab } from "@/components/admin/UsersTab";

export default function AdminDashboardPage() {
  const { user, logout, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<AdminTab>("analytics");

  // Data states
  const [salesData, setSalesData] = useState<any>(null);
  const [menus, setMenus] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [tables, setTables] = useState<any[]>([]);
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [shiftHistory, setShiftHistory] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);

  // Loading states
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // 1. Fetch Sales Summary
  const fetchSalesSummary = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/admin/reports/sales-summary");
      const data = await res.json();
      if (data.success) setSalesData(data.data);
    } catch {
      console.error("Failed to load sales summary");
    }
  }, []);

  // 2. Fetch Menus & Categories
  const fetchMenus = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/admin/menus");
      const data = await res.json();
      if (data.success) {
        setMenus(data.data.menus);
        setCategories(data.data.categories);
      }
    } catch {
      console.error("Failed to load menus");
    }
  }, []);

  // 3. Fetch Tables
  const fetchTables = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/admin/tables");
      const data = await res.json();
      if (data.success) setTables(data.data);
    } catch {
      console.error("Failed to load tables");
    }
  }, []);

  // 4. Fetch Ingredients
  const fetchIngredients = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/admin/ingredients");
      const data = await res.json();
      if (data.success) setIngredients(data.data);
    } catch {
      console.error("Failed to load ingredients");
    }
  }, []);

  // 5. Fetch Shifts & Audit Logs
  const fetchShiftsAndLogs = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/admin/reports/shifts");
      const data = await res.json();
      if (data.success) {
        setShiftHistory(data.data.shifts);
        setAuditLogs(data.data.auditLogs);
      }
    } catch {
      console.error("Failed to load shifts");
    }
  }, []);

  // 6. Fetch Users List
  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch("/api/v1/admin/users");
      const data = await res.json();
      if (data.success) setUsersList(data.data);
    } catch {
      console.error("Failed to load users");
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  const refreshAllData = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.all([
      fetchSalesSummary(),
      fetchMenus(),
      fetchTables(),
      fetchIngredients(),
      fetchShiftsAndLogs(),
      fetchUsers(),
    ]);
    setIsRefreshing(false);
    toast.info("Seluruh data dashboard berhasil diperbarui.", "Data Terkini");
  }, [fetchSalesSummary, fetchMenus, fetchTables, fetchIngredients, fetchShiftsAndLogs, fetchUsers, toast]);

  useEffect(() => {
    if (user && user.role === "admin") {
      fetchSalesSummary();
      fetchMenus();
      fetchTables();
      fetchIngredients();
      fetchShiftsAndLogs();
      fetchUsers();
    }
  }, [user, fetchSalesSummary, fetchMenus, fetchTables, fetchIngredients, fetchShiftsAndLogs, fetchUsers]);

  // MENU ACTIONS
  const handleCreateMenu = async (form: any): Promise<boolean> => {
    if (!form.categoryId || !form.name || !form.price) {
      toast.warning("Kategori, nama menu, dan harga wajib diisi.", "Validasi Form");
      return false;
    }
    try {
      const res = await fetch("/api/v1/admin/menus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Menu "${form.name}" berhasil ditambahkan!`, "Menu Ditambahkan");
        fetchMenus();
        return true;
      } else {
        toast.error(data.message || "Gagal membuat menu.", "Gagal Simpan");
        return false;
      }
    } catch {
      toast.error("Terjadi gangguan koneksi saat menyimpan menu.", "Gangguan Jaringan");
      return false;
    }
  };

  const handleUpdateMenu = async (menuId: number, form: any): Promise<boolean> => {
    try {
      const res = await fetch(`/api/v1/admin/menus/${menuId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Perubahan menu berhasil disimpan!", "Menu Diperbarui");
        fetchMenus();
        return true;
      } else {
        toast.error(data.message || "Gagal memperbarui menu.", "Gagal Update");
        return false;
      }
    } catch {
      toast.error("Terjadi gangguan koneksi saat memperbarui menu.", "Gangguan Jaringan");
      return false;
    }
  };

  const handleDeleteMenu = async (menuId: number, menuName: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus menu "${menuName}"?`)) return;
    try {
      const res = await fetch(`/api/v1/admin/menus/${menuId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast.success(`Menu "${menuName}" berhasil dihapus.`, "Menu Dihapus");
        fetchMenus();
      } else {
        toast.error(data.message || "Gagal menghapus menu.", "Gagal Hapus");
      }
    } catch {
      toast.error("Terjadi gangguan koneksi saat menghapus menu.", "Gangguan Jaringan");
    }
  };

  const handleToggleMenuAvailability = async (menuId: number, currentStatus: boolean) => {
    try {
      await fetch(`/api/v1/admin/menus/${menuId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable: !currentStatus }),
      });
      fetchMenus();
      toast.success(
        `Status menu diperbarui: ${!currentStatus ? "Tersedia" : "Habis"}`,
        "Ketersediaan Menu"
      );
    } catch {
      toast.error("Gagal mengubah ketersediaan menu.", "Gagal Update");
    }
  };

  // TABLE ACTIONS
  const handleCreateTable = async (form: any): Promise<boolean> => {
    if (!form.tableNumber) {
      toast.warning("Nomor meja wajib diisi.", "Nomor Meja Diperlukan");
      return false;
    }
    try {
      const res = await fetch("/api/v1/admin/tables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Meja #${form.tableNumber} berhasil didaftarkan!`, "Meja Ditambahkan");
        fetchTables();
        return true;
      } else {
        toast.error(data.message || "Gagal membuat meja.", "Gagal Buat Meja");
        return false;
      }
    } catch {
      toast.error("Terjadi kesalahan saat membuat meja.", "Gangguan Koneksi");
      return false;
    }
  };

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
      } else {
        toast.error(data.message || "Gagal memperbarui token.", "Gagal");
      }
    } catch {
      toast.error("Gagal meregenerasi token QR meja.", "Gagal Update");
    }
  };

  // INVENTORY ACTIONS
  const handleRestock = async (ingredientId: number, amount: number): Promise<boolean> => {
    try {
      const res = await fetch("/api/v1/admin/ingredients", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: ingredientId, addStock: amount }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Stok bahan baku berhasil ditambahkan!", "Restock Berhasil");
        fetchIngredients();
        return true;
      } else {
        toast.error(data.message || "Gagal memperbarui stok.", "Restock Gagal");
        return false;
      }
    } catch {
      toast.error("Terjadi kesalahan koneksi saat memperbarui stok.", "Gangguan Koneksi");
      return false;
    }
  };

  // USER ACTIONS
  const handleCreateUser = async (form: any): Promise<boolean> => {
    if (!form.name || !form.username || !form.email || !form.password || !form.role) {
      toast.warning("Lengkapi seluruh field nama, username, email, password dan role.", "Form Belum Lengkap");
      return false;
    }
    try {
      const res = await fetch("/api/v1/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message, "Akun Berhasil Dibuat");
        fetchUsers();
        return true;
      } else {
        toast.error(data.message || "Gagal menambahkan user.", "Gagal");
        return false;
      }
    } catch {
      toast.error("Terjadi kesalahan koneksi saat membuat akun.", "Gangguan Koneksi");
      return false;
    }
  };

  const handleDeleteUser = async (userId: number, userName: string) => {
    if (!confirm(`Hapus akun pengguna "${userName}"? Tindakan ini tidak dapat dibatalkan.`)) return;
    try {
      const res = await fetch(`/api/v1/admin/users?id=${userId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message, "Pengguna Dihapus");
        fetchUsers();
      } else {
        toast.error(data.message || "Gagal menghapus user.", "Gagal Hapus");
      }
    } catch {
      toast.error("Terjadi kesalahan koneksi saat menghapus user.", "Gangguan Koneksi");
    }
  };

  // EXCEL EXPORT
  const handleExportExcel = () => {
    if (!salesData) {
      toast.warning("Data analitik penjualan belum siap diekspor.", "Data Belum Tersedia");
      return;
    }

    try {
      const summaryRows = [
        { Indikator: "Total Omzet Penjualan (Gross)", Nilai: salesData.summary.totalRevenue },
        { Indikator: "Estimasi Laba Kotor (Gross Profit)", Nilai: salesData.summary.grossProfit },
        { Indikator: "Estimasi Food Cost (COGS)", Nilai: salesData.summary.estimatedCOGS },
        { Indikator: "Total Transaksi Selesai", Nilai: salesData.summary.totalOrdersCount },
        { Indikator: "Rata-Rata Nilai Transaksi", Nilai: salesData.summary.avgOrderValue },
      ];

      const paymentRows = [
        { Metode: "Tunai (Cash)", Total: salesData.paymentBreakdown.cash },
        { Metode: "QRIS Dinamis", Total: salesData.paymentBreakdown.qris },
        { Metode: "Kartu Debit/Kredit", Total: salesData.paymentBreakdown.debit },
      ];

      const topItemRows = (salesData.topSellingItems || []).map((i: any, idx: number) => ({
        Ranking: idx + 1,
        Nama_Menu: i.name,
        Porsi_Terjual: i.quantity,
        Total_Pendapatan: i.revenue,
      }));

      const wb = XLSX.utils.book_new();
      const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
      const wsPayments = XLSX.utils.json_to_sheet(paymentRows);
      const wsTopItems = XLSX.utils.json_to_sheet(topItemRows);

      XLSX.utils.book_append_sheet(wb, wsSummary, "Ringkasan Finansial");
      XLSX.utils.book_append_sheet(wb, wsPayments, "Rekap Pembayaran");
      XLSX.utils.book_append_sheet(wb, wsTopItems, "Menu Terlaris");

      const dateStr = new Date().toISOString().slice(0, 10);
      XLSX.writeFile(wb, `SAVORIA_Sales_Report_${dateStr}.xlsx`);
      toast.success("File Excel berhasil di-generate dan diunduh!", "Ekspor Selesai");
    } catch {
      toast.error("Gagal mengekspor laporan ke format Excel.", "Ekspor Gagal");
    }
  };

  // AUTH LOADING STATE
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] text-[#18181B] flex items-center justify-center">
        <div className="flex items-center gap-3 bg-white px-6 py-4 rounded-2xl shadow-sm border border-slate-200/80">
          <RefreshCw className="w-5 h-5 animate-spin text-[#EA580C]" />
          <span className="text-sm font-medium">Memverifikasi otorisasi administrator...</span>
        </div>
      </div>
    );
  }

  // ACCESS DENIED (RBAC GUARD)
  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-[#FDFBF7] text-[#18181B] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-xl">
          <div className="w-16 h-16 rounded-full bg-[#EA580C]/10 text-[#EA580C] flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <h2 className="font-serif text-2xl font-bold text-[#18181B]">Otorisasi Akses Ditolak</h2>
            <p className="text-xs text-[#64748B] mt-2">
              Halaman ini dikhususkan untuk <strong>Administrator</strong>. Akun Anda terdeteksi sebagai{" "}
              <strong className="text-[#EA580C] font-mono">{user ? user.role.toUpperCase() : "GUEST (Belum Login)"}</strong>.
            </p>
          </div>
          <div className="space-y-2 pt-2">
            <Link
              href="/login?redirect=/admin"
              className="w-full py-3 bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold rounded-full text-xs shadow-cta block transition-all"
            >
              Masuk dengan Akun Admin
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

  const tabTitles: Record<AdminTab, string> = {
    analytics: "Ringkasan & Analitik Finansial",
    menus: "Master Data Menu & Kategori",
    tables: "Denah Meja & Generator QR Pass",
    inventory: "Inventaris Bahan Baku & Resep",
    shifts: "Rekap Shift & Audit Trail Kasir",
    users: "Manajemen Pengguna & Otorisasi Akses",
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col md:flex-row text-[#18181B]">
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        menuCount={menus.length}
        tableCount={tables.length}
        ingredientCount={ingredients.length}
        userCount={usersList.length}
        onLogout={logout}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          user={user}
          activeTabTitle={tabTitles[activeTab]}
          onRefresh={refreshAllData}
          isRefreshing={isRefreshing}
        />

        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          {activeTab === "analytics" && (
            <AnalyticsTab
              salesData={salesData}
              onRefresh={fetchSalesSummary}
              onExportExcel={handleExportExcel}
            />
          )}

          {activeTab === "menus" && (
            <MenusTab
              menus={menus}
              categories={categories}
              onCreateMenu={handleCreateMenu}
              onUpdateMenu={handleUpdateMenu}
              onDeleteMenu={handleDeleteMenu}
              onToggleAvailability={handleToggleMenuAvailability}
            />
          )}

          {activeTab === "tables" && (
            <TablesTab
              tables={tables}
              onCreateTable={handleCreateTable}
              onRegenerateQr={handleRegenerateQr}
            />
          )}

          {activeTab === "inventory" && (
            <InventoryTab
              ingredients={ingredients}
              onRestock={handleRestock}
            />
          )}

          {activeTab === "shifts" && (
            <ShiftsTab
              shiftHistory={shiftHistory}
              auditLogs={auditLogs}
            />
          )}

          {activeTab === "users" && (
            <UsersTab
              usersList={usersList}
              loadingUsers={loadingUsers}
              currentUser={user}
              onCreateUser={handleCreateUser}
              onDeleteUser={handleDeleteUser}
            />
          )}
        </main>
      </div>
    </div>
  );
}
