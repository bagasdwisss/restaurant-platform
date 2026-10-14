"use client";

import React, { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ShieldAlert, RefreshCw, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";
import { AdminSidebar, AdminTab } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { TabSkeleton } from "@/components/admin/TabSkeleton";

// Dynamic Code-Splitting Lazy Loading for all Admin Module Tabs
const AnalyticsTab = dynamic(
  () => import("@/components/admin/AnalyticsTab").then((m) => m.AnalyticsTab),
  {
    loading: () => <TabSkeleton title="Memuat Analitik Penjualan..." count={4} />,
    ssr: false,
  }
);

const MenusTab = dynamic(
  () => import("@/components/admin/MenusTab").then((m) => m.MenusTab),
  {
    loading: () => <TabSkeleton title="Memuat Master Katalog Menu & Resep..." count={4} />,
    ssr: false,
  }
);

const TablesTab = dynamic(
  () => import("@/components/admin/TablesTab").then((m) => m.TablesTab),
  {
    loading: () => <TabSkeleton title="Memuat Denah Meja Restoran..." count={4} />,
    ssr: false,
  }
);

const InventoryTab = dynamic(
  () => import("@/components/admin/InventoryTab").then((m) => m.InventoryTab),
  {
    loading: () => <TabSkeleton title="Memuat Stok Bahan Baku & Inventaris..." count={4} />,
    ssr: false,
  }
);

const ShiftsTab = dynamic(
  () => import("@/components/admin/ShiftsTab").then((m) => m.ShiftsTab),
  {
    loading: () => <TabSkeleton title="Memuat Riwayat Shift Kasir & Audit Log..." count={4} />,
    ssr: false,
  }
);

const UsersTab = dynamic(
  () => import("@/components/admin/UsersTab").then((m) => m.UsersTab),
  {
    loading: () => <TabSkeleton title="Memuat Otorisasi Hak Akses Pengguna..." count={4} />,
    ssr: false,
  }
);

export default function AdminDashboardPage() {
  const { user, logout, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<AdminTab>("analytics");

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Data states
  const [salesData, setSalesData] = useState<any>(null);
  const [menus, setMenus] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [tables, setTables] = useState<any[]>([]);
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [shiftHistory, setShiftHistory] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [cashierOrders, setCashierOrders] = useState<any[]>([]);
  const [systemUpdates, setSystemUpdates] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);

  // Visible lazy loading states for each tab
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [loadingMenus, setLoadingMenus] = useState(false);
  const [loadingTables, setLoadingTables] = useState(false);
  const [loadingIngredients, setLoadingIngredients] = useState(false);
  const [loadingShifts, setLoadingShifts] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // 1. Fetch Sales Summary
  const fetchSalesSummary = useCallback(async () => {
    setLoadingAnalytics(true);
    try {
      const res = await fetch("/api/v1/admin/reports/sales-summary");
      const data = await res.json();
      if (data.success) setSalesData(data.data);
    } catch {
      console.error("Failed to load sales summary");
    } finally {
      setLoadingAnalytics(false);
    }
  }, []);

  // 2. Fetch Menus & Categories (Lazy)
  const fetchMenus = useCallback(async () => {
    setLoadingMenus(true);
    try {
      const res = await fetch("/api/v1/admin/menus");
      const data = await res.json();
      if (data.success) {
        setMenus(data.data.menus);
        setCategories(data.data.categories);
      }
    } catch {
      console.error("Failed to load menus");
    } finally {
      setLoadingMenus(false);
    }
  }, []);

  // 3. Fetch Tables (Lazy)
  const fetchTables = useCallback(async () => {
    setLoadingTables(true);
    try {
      const res = await fetch("/api/v1/admin/tables");
      const data = await res.json();
      if (data.success) setTables(data.data);
    } catch {
      console.error("Failed to load tables");
    } finally {
      setLoadingTables(false);
    }
  }, []);

  // 4. Fetch Ingredients (Lazy)
  const fetchIngredients = useCallback(async () => {
    setLoadingIngredients(true);
    try {
      const res = await fetch("/api/v1/admin/ingredients");
      const data = await res.json();
      if (data.success) setIngredients(data.data);
    } catch {
      console.error("Failed to load ingredients");
    } finally {
      setLoadingIngredients(false);
    }
  }, []);

  // 5. Fetch Shifts & Audit Logs (Lazy)
  const fetchShiftsAndLogs = useCallback(async () => {
    setLoadingShifts(true);
    try {
      const res = await fetch("/api/v1/admin/reports/shifts");
      const data = await res.json();
      if (data.success) {
        setShiftHistory(data.data.shifts || []);
        setAuditLogs(data.data.auditLogs || []);
        setCashierOrders(data.data.cashierOrders || []);
        setSystemUpdates(data.data.systemUpdates || []);
      }
    } catch {
      console.error("Failed to load shifts");
    } finally {
      setLoadingShifts(false);
    }
  }, []);

  // 6. Fetch Users List (Lazy)
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

  // Initial load: Only fetch Overview sales summary for instant sub-second response
  useEffect(() => {
    if (user && user.role === "admin") {
      fetchSalesSummary();
    }
  }, [user, fetchSalesSummary]);

  // Lazy-load tabs on-demand when the admin navigates to them
  useEffect(() => {
    if (!user || user.role !== "admin") return;
    if (activeTab === "menus" && menus.length === 0) fetchMenus();
    if (activeTab === "tables" && tables.length === 0) fetchTables();
    if (activeTab === "inventory" && ingredients.length === 0) fetchIngredients();
    if (activeTab === "shifts" && shiftHistory.length === 0) fetchShiftsAndLogs();
    if (activeTab === "users" && usersList.length === 0) fetchUsers();
  }, [
    activeTab,
    user,
    menus.length,
    tables.length,
    ingredients.length,
    shiftHistory.length,
    usersList.length,
    fetchMenus,
    fetchTables,
    fetchIngredients,
    fetchShiftsAndLogs,
    fetchUsers,
  ]);

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

  const handleUpdateMenu = async (form: any): Promise<boolean> => {
    try {
      const res = await fetch(`/api/v1/admin/menus/${form.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Menu "${form.name}" berhasil diperbarui.`, "Menu Diperbarui");
        fetchMenus();
        return true;
      } else {
        toast.error(data.message || "Gagal mengupdate menu.", "Gagal Update");
        return false;
      }
    } catch {
      toast.error("Terjadi kesalahan koneksi saat memperbarui menu.", "Gangguan Koneksi");
      return false;
    }
  };

  const handleDeleteMenu = async (id: number, name: string) => {
    if (!confirm(`Hapus permanen hidangan "${name}"?`)) return;
    try {
      const res = await fetch(`/api/v1/admin/menus/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast.success(`Menu "${name}" berhasil dihapus.`, "Menu Dihapus");
        fetchMenus();
      } else {
        toast.error(data.message || "Gagal menghapus menu.", "Gagal Hapus");
      }
    } catch {
      toast.error("Gagal menghapus menu karena kendala jaringan.", "Gangguan Koneksi");
    }
  };

  const handleToggleMenuAvailability = async (id: number, current: boolean) => {
    try {
      const res = await fetch(`/api/v1/admin/menus/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable: !current }),
      });
      const data = await res.json();
      if (data.success) {
        toast.info(
          !current ? "Status menu diubah menjadi [READY]." : "Status menu diubah menjadi [HABIS].",
          "Status Ketersediaan"
        );
        fetchMenus();
      }
    } catch {
      toast.error("Gagal mengubah status ketersediaan menu.", "Gagal Update");
    }
  };

  // TABLE ACTIONS
  const handleCreateTable = async (form: any): Promise<boolean> => {
    if (!form.tableNumber || !form.capacity) {
      toast.warning("Nomor meja dan kapasitas wajib diisi.", "Form Belum Lengkap");
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
        toast.success(`Meja "${form.tableNumber}" berhasil ditambahkan!`, "Meja Ditambahkan");
        fetchTables();
        return true;
      } else {
        toast.error(data.message || "Gagal membuat meja.", "Gagal Simpan");
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

  // DYNAMIC EXCEL EXPORT (Heavy library loaded strictly on demand)
  const handleExportExcel = async () => {
    if (!salesData) {
      toast.warning("Data analitik penjualan belum siap diekspor.", "Data Belum Tersedia");
      return;
    }

    try {
      const XLSX = await import("xlsx");
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

      const topMenuRows = salesData.topSellingItems.map((item: any, i: number) => ({
        Peringkat: i + 1,
        "Nama Hidangan": item.name,
        "Total Terjual (Porsi)": item.quantity,
        "Kontribusi Omzet": item.revenue,
      }));

      const wb = XLSX.utils.book_new();
      const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
      const wsPayments = XLSX.utils.json_to_sheet(paymentRows);
      const wsTopMenu = XLSX.utils.json_to_sheet(topMenuRows);

      XLSX.utils.book_append_sheet(wb, wsSummary, "Ringkasan Finansial");
      XLSX.utils.book_append_sheet(wb, wsPayments, "Metode Pembayaran");
      XLSX.utils.book_append_sheet(wb, wsTopMenu, "10 Menu Terlaris");

      const dateStr = new Date().toISOString().slice(0, 10);
      XLSX.writeFile(wb, `Laporan-Restoran-Savoria-${dateStr}.xlsx`);
      toast.success("Laporan Excel berhasil di-generate dan diunduh.", "Ekspor Berhasil");
    } catch (err: any) {
      toast.error(err.message || "Gagal mengunduh Excel.", "Ekspor Gagal");
    }
  };

  // GUARDS
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <div className="flex items-center gap-3 bg-white px-6 py-4 rounded-2xl shadow-sm border border-slate-200">
          <RefreshCw className="w-5 h-5 animate-spin text-[#EA580C]" />
          <span className="text-sm font-medium text-[#18181B]">Memverifikasi izin eksekutif admin...</span>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-4">
        <div className="bg-white max-w-md w-full p-8 rounded-3xl border border-rose-200 shadow-xl text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#18181B]">Akses Terbatas</h2>
          <p className="text-xs text-[#64748B] leading-relaxed">
            Halaman ini khusus General Manager & Eksekutif Savoria. Silakan masuk menggunakan akun kredensial Admin.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <Link
              href="/login"
              className="py-3 px-4 bg-[#EA580C] hover:bg-[#C2410C] text-white rounded-full text-xs font-bold transition-all shadow-md shadow-[#EA580C]/25"
            >
              Masuk Sebagai Admin
            </Link>
            <Link
              href="/"
              className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-[#18181B] rounded-full text-xs font-semibold transition-all"
            >
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#18181B] flex flex-col md:flex-row font-sans">
      {/* SIDEBAR NAVIGATION */}
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        menuCount={menus.length}
        tableCount={tables.length}
        ingredientCount={ingredients.length}
        userCount={usersList.length}
        onLogout={logout}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* MAIN ADMIN WORKSPACE */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen md:h-screen md:overflow-hidden">
        {/* TOP HEADER BAR */}
        <AdminHeader
          user={user}
          activeTabTitle={
            activeTab === "analytics"
              ? "Ringkasan Finansial & Analitik Penjualan"
              : activeTab === "menus"
              ? "Manajemen Menu & Resep"
              : activeTab === "tables"
              ? "Denah Meja & Generator QR"
              : activeTab === "inventory"
              ? "Inventaris & Stok Bahan Baku"
              : activeTab === "shifts"
              ? "Riwayat Shift Kasir & Audit Log"
              : "Manajemen Pengguna & Otorisasi Akses"
          }
          isRefreshing={isRefreshing}
          onRefresh={refreshAllData}
          onToggleMobileSidebar={() => setMobileSidebarOpen((prev) => !prev)}
        />

        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          {activeTab === "analytics" && (
            <AnalyticsTab
              salesData={salesData}
              isLoading={loadingAnalytics}
              onRefresh={fetchSalesSummary}
              onExportExcel={handleExportExcel}
            />
          )}

          {activeTab === "menus" && (
            loadingMenus && menus.length === 0 ? (
              <TabSkeleton title="Memuat Master Katalog Menu & Resep Dapur..." count={4} />
            ) : (
              <MenusTab
                menus={menus}
                categories={categories}
                onCreateMenu={handleCreateMenu}
                onUpdateMenu={handleUpdateMenu}
                onDeleteMenu={handleDeleteMenu}
                onToggleAvailability={handleToggleMenuAvailability}
              />
            )
          )}

          {activeTab === "tables" && (
            loadingTables && tables.length === 0 ? (
              <TabSkeleton title="Memuat Denah Meja & Tata Letak Restoran..." count={4} />
            ) : (
              <TablesTab
                tables={tables}
                onCreateTable={handleCreateTable}
                onRegenerateQr={handleRegenerateQr}
              />
            )
          )}

          {activeTab === "inventory" && (
            loadingIngredients && ingredients.length === 0 ? (
              <TabSkeleton title="Memuat Stok Bahan Baku & Inventaris Dapur..." count={4} />
            ) : (
              <InventoryTab
                ingredients={ingredients}
                onRestock={handleRestock}
              />
            )
          )}

          {activeTab === "shifts" && (
            loadingShifts && shiftHistory.length === 0 ? (
              <TabSkeleton title="Memuat Riwayat Shift Kasir & Log Audit..." count={4} />
            ) : (
              <ShiftsTab
                shiftHistory={shiftHistory}
                auditLogs={auditLogs}
                cashierOrders={cashierOrders}
                systemUpdates={systemUpdates}
              />
            )
          )}

          {activeTab === "users" && (
            loadingUsers && usersList.length === 0 ? (
              <TabSkeleton title="Memuat Manajemen Hak Akses Pengguna..." count={4} />
            ) : (
              <UsersTab
                usersList={usersList}
                loadingUsers={loadingUsers}
                currentUser={user}
                onCreateUser={handleCreateUser}
                onDeleteUser={handleDeleteUser}
              />
            )
          )}
        </main>
      </div>
    </div>
  );
}
