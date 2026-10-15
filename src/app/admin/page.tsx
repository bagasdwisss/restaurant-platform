"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";
import { AdminSidebar, AdminTab } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminLoadingScreen, AdminAccessDenied } from "@/components/admin/AdminAuthGuard";
import { AdminTabRenderer } from "@/components/admin/AdminTabRenderer";

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
  const [vouchers, setVouchers] = useState<any[]>([]);

  // Visible lazy loading states for each tab
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [loadingMenus, setLoadingMenus] = useState(false);
  const [loadingTables, setLoadingTables] = useState(false);
  const [loadingIngredients, setLoadingIngredients] = useState(false);
  const [loadingShifts, setLoadingShifts] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingVouchers, setLoadingVouchers] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);

  // Initial lightweight sidebar counters
  const [sidebarCounts, setSidebarCounts] = useState<{
    menus: number;
    tables: number;
    ingredients: number;
    vouchers: number;
    users: number;
  }>({ menus: 0, tables: 0, ingredients: 0, vouchers: 0, users: 0 });

  // 1. Fetch Sales Summary
  const fetchSalesSummary = useCallback(async () => {
    setLoadingAnalytics(true);
    try {
      const res = await fetch("/api/v1/admin/reports/sales-summary");
      const data = await res.json();
      if (data.success) {
        setSalesData(data.data);
        if (data.data.counts) {
          setSidebarCounts((prev) => ({
            ...prev,
            ...data.data.counts,
          }));
        }
      }
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
        setSidebarCounts((prev) => ({ ...prev, menus: data.data.menus.length }));
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
      if (data.success) {
        setTables(data.data);
        setSidebarCounts((prev) => ({ ...prev, tables: data.data.length }));
      }
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
      const res = await fetch("/api/v1/admin/inventory");
      const data = await res.json();
      if (data.success) {
        setIngredients(data.data);
        setSidebarCounts((prev) => ({ ...prev, ingredients: data.data.length }));
      }
    } catch {
      console.error("Failed to load ingredients");
    } finally {
      setLoadingIngredients(false);
    }
  }, []);

  // 5. Fetch Shifts, Audit Logs & System Updates (Lazy)
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
      console.error("Failed to load shifts and logs");
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
      if (data.success) {
        setUsersList(data.data);
        setSidebarCounts((prev) => ({ ...prev, users: data.data.length }));
      }
    } catch {
      console.error("Failed to load users");
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  // 7. Fetch Vouchers List (Lazy)
  const fetchVouchers = useCallback(async () => {
    setLoadingVouchers(true);
    try {
      const res = await fetch("/api/v1/admin/vouchers");
      const data = await res.json();
      if (data.success) {
        setVouchers(data.data);
        setSidebarCounts((prev) => ({ ...prev, vouchers: data.data.length }));
      }
    } catch {
      console.error("Failed to load vouchers");
    } finally {
      setLoadingVouchers(false);
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
      fetchVouchers(),
    ]);
    setIsRefreshing(false);
    toast.info("Seluruh data dashboard berhasil diperbarui.", "Data Terkini");
  }, [fetchSalesSummary, fetchMenus, fetchTables, fetchIngredients, fetchShiftsAndLogs, fetchUsers, fetchVouchers, toast]);

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
    if (activeTab === "vouchers" && vouchers.length === 0) fetchVouchers();
  }, [
    activeTab,
    user,
    menus.length,
    tables.length,
    ingredients.length,
    shiftHistory.length,
    usersList.length,
    vouchers.length,
    fetchMenus,
    fetchTables,
    fetchIngredients,
    fetchShiftsAndLogs,
    fetchUsers,
    fetchVouchers,
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

  const handleUpdateMenu = async (menuId: number, form: any): Promise<boolean> => {
    try {
      const res = await fetch(`/api/v1/admin/menus/${menuId}`, {
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

  const handleDeleteMenu = async (id: number, name: string): Promise<void> => {
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

  const handleToggleMenuAvailability = async (id: number, current: boolean): Promise<void> => {
    try {
      const res = await fetch(`/api/v1/admin/menus/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable: !current }),
      });
      const data = await res.json();
      if (data.success) {
        toast.info(
          `Status hidangan kini ${!current ? "Tersedia" : "Habis / Arsip"}.`,
          "Ketersediaan Menu"
        );
        fetchMenus();
      } else {
        toast.error(data.message || "Gagal mengubah ketersediaan.", "Gagal");
      }
    } catch {
      toast.error("Gagal mengupdate ketersediaan.", "Gangguan Koneksi");
    }
  };

  // TABLE ACTIONS
  const handleCreateTable = async (form: any): Promise<boolean> => {
    if (!form.tableNumber || !form.capacity) {
      toast.warning("Nomor meja dan kapasitas wajib ditentukan.", "Validasi Meja");
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
        toast.success(`Meja ${form.tableNumber} berhasil diinisialisasi.`, "Meja Didaftarkan");
        fetchTables();
        return true;
      } else {
        toast.error(data.message || "Gagal membuat meja.", "Gagal Tambah");
        return false;
      }
    } catch {
      toast.error("Gagal terhubung ke database meja.", "Gangguan Jaringan");
      return false;
    }
  };

  const handleUpdateTable = async (tableId: number, form: any): Promise<boolean> => {
    try {
      const res = await fetch(`/api/v1/admin/tables/${tableId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Konfigurasi meja ${form.tableNumber || tableId} diperbarui.`, "Meja Diupdate");
        fetchTables();
        return true;
      } else {
        toast.error(data.message || "Gagal mengupdate meja.", "Gagal");
        return false;
      }
    } catch {
      toast.error("Gagal memperbarui konfigurasi meja.", "Gangguan Koneksi");
      return false;
    }
  };

  const handleRegenerateQr = async (id: number): Promise<void> => {
    try {
      const res = await fetch(`/api/v1/admin/tables/${id}/qr`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        toast.success(`QR Dinamis Meja berhasil di-generate ulang!`, "QR Baru Aktif");
        fetchTables();
      } else {
        toast.error(data.message || "Gagal membuat token QR baru.", "Gagal Regenerate");
      }
    } catch {
      toast.error("Gagal meregenerasi token QR.", "Gangguan Koneksi");
    }
  };

  // INVENTORY ACTIONS
  const handleRestock = async (id: number, amount: number): Promise<boolean> => {
    try {
      const res = await fetch(`/api/v1/admin/inventory/${id}/restock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Stok bahan baku berhasil ditambahkan (+${amount}).`, "Restock Berhasil");
        fetchIngredients();
        return true;
      } else {
        toast.error(data.message || "Gagal menambah stok.", "Gagal Restock");
        return false;
      }
    } catch {
      toast.error("Gagal memproses restock bahan.", "Gangguan Jaringan");
      return false;
    }
  };

  const handleCreateIngredient = async (form: any): Promise<boolean> => {
    if (!form.name || !form.unit) {
      toast.warning("Nama bahan dan unit satuan wajib diisi.", "Validasi Form");
      return false;
    }
    try {
      const res = await fetch("/api/v1/admin/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Bahan baku "${form.name}" siap dipantau.`, "Bahan Terdaftar");
        fetchIngredients();
        return true;
      } else {
        toast.error(data.message || "Gagal membuat bahan baku.", "Gagal");
        return false;
      }
    } catch {
      toast.error("Gagal menambahkan bahan baku.", "Gangguan Jaringan");
      return false;
    }
  };

  // USER MANAGEMENT ACTIONS
  const handleCreateUser = async (form: any): Promise<boolean> => {
    if (!form.name || !form.email || !form.password || !form.role) {
      toast.warning("Mohon lengkapi seluruh field user akun.", "Validasi Akun");
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
        toast.success(`Akun staf "${form.name}" (${form.role.toUpperCase()}) dibuat!`, "Staf Didaftarkan");
        fetchUsers();
        return true;
      } else {
        toast.error(data.message || "Gagal membuat akun user.", "Gagal");
        return false;
      }
    } catch {
      toast.error("Gagal membuat akun staf.", "Gangguan Jaringan");
      return false;
    }
  };

  const handleDeleteUser = async (id: number, name: string): Promise<void> => {
    if (!confirm(`Hapus permanen akses akun "${name}"?`)) return;
    try {
      const res = await fetch(`/api/v1/admin/users/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast.success(`Akses akun "${name}" berhasil dicabut.`, "Akun Dihapus");
        fetchUsers();
      } else {
        toast.error(data.message || "Gagal menghapus user.", "Gagal");
      }
    } catch {
      toast.error("Gagal menghapus pengguna.", "Gangguan Jaringan");
    }
  };

  // VOUCHER MANAGEMENT ACTIONS
  const handleCreateVoucher = async (form: any): Promise<boolean> => {
    if (!form.code || !form.name || !form.discountValue || !form.maxUsage) {
      toast.warning("Mohon lengkapi semua field voucher yang diperlukan.", "Validasi Voucher");
      return false;
    }
    try {
      const res = await fetch("/api/v1/admin/vouchers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.message || "Gagal membuat voucher.", "Gagal");
        return false;
      }
      toast.success(`Voucher ${form.code} (${form.maxUsage} kuota) berhasil diterbitkan!`, "Voucher Dibuat");
      fetchVouchers();
      return true;
    } catch {
      toast.error("Gagal menghubungi server untuk membuat voucher.", "Gangguan Koneksi");
      return false;
    }
  };

  const handleToggleVoucher = async (id: string, currentActive: boolean): Promise<boolean> => {
    try {
      const res = await fetch(`/api/v1/admin/vouchers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentActive }),
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.message || "Gagal memperbarui status voucher.", "Gagal");
        return false;
      }
      toast.info("Status keaktifan voucher berhasil diperbarui.", "Status Diubah");
      fetchVouchers();
      return true;
    } catch {
      toast.error("Gagal mengubah status voucher.", "Gangguan Koneksi");
      return false;
    }
  };

  const handleDeleteVoucher = async (id: string): Promise<boolean> => {
    if (!confirm("Hapus voucher promo ini? Tindakan ini tidak dapat dibatalkan.")) return false;
    try {
      const res = await fetch(`/api/v1/admin/vouchers/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.message || "Gagal menghapus voucher.", "Gagal");
        return false;
      }
      toast.info("Voucher promo berhasil dihapus.", "Terhapus");
      fetchVouchers();
      return true;
    } catch {
      toast.error("Gagal menghapus voucher.", "Gangguan Koneksi");
      return false;
    }
  };

  // DYNAMIC COMPREHENSIVE EXCEL EXPORT (All Worksheets with Full Operasional Data)
  const handleExportExcel = async () => {
    setIsExportingExcel(true);
    toast.info("Sedang menyiapkan data operasional & finansial lengkap...", "Menyiapkan Ekspor");

    try {
      const res = await fetch("/api/v1/admin/reports/full-export");
      const json = await res.json();
      if (!json.success || !json.data) {
        throw new Error(json.message || "Gagal memuat data ekspor lengkap dari server.");
      }

      const { generateComprehensiveExcel } = await import("@/lib/excel-export");
      const filename = await generateComprehensiveExcel(
        json.data,
        user?.name ? `${user.name} (${user.role.toUpperCase()})` : "Administrator SAVORIA"
      );
      toast.success(
        `Laporan Excel komprehensif berhasil diunduh (${filename}) lengkap dengan 9 lembar kerja operasional.`,
        "Ekspor Excel Sukses"
      );
    } catch (err: any) {
      console.error("Export error:", err);
      toast.error(err.message || "Gagal mengunduh berkas Excel.", "Kendala Ekspor");
    } finally {
      setIsExportingExcel(false);
    }
  };

  // GUARDS
  if (authLoading) {
    return <AdminLoadingScreen />;
  }

  if (!user || user.role !== "admin") {
    return <AdminAccessDenied />;
  }

  return (
    <div className="h-screen bg-[#FDFBF7] text-[#18181B] flex flex-col md:flex-row font-sans overflow-hidden">
      {/* SIDEBAR NAVIGATION */}
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        menuCount={menus.length > 0 ? menus.length : sidebarCounts.menus}
        tableCount={tables.length > 0 ? tables.length : sidebarCounts.tables}
        ingredientCount={ingredients.length > 0 ? ingredients.length : sidebarCounts.ingredients}
        userCount={usersList.length > 0 ? usersList.length : sidebarCounts.users}
        voucherCount={vouchers.length > 0 ? vouchers.length : sidebarCounts.vouchers}
        onLogout={logout}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <AdminHeader
          user={user}
          activeTabTitle={
            activeTab === "analytics"
              ? "Ringkasan & Analitik Bisnis"
              : activeTab === "menus"
              ? "Katalog Menu & Resep Dapur"
              : activeTab === "tables"
              ? "Denah Meja & Tata Letak QR"
              : activeTab === "inventory"
              ? "Bahan Baku & Manajemen Stok"
              : activeTab === "shifts"
              ? "Pusat Log Kasir, Audit & Riwayat Update"
              : activeTab === "vouchers"
              ? "Katalog Voucher Promo & Diskon"
              : "Hak Akses & Otorisasi Pengguna"
          }
          isRefreshing={isRefreshing}
          onRefresh={refreshAllData}
          onToggleMobileSidebar={() => setMobileSidebarOpen((prev) => !prev)}
          onExportExcel={handleExportExcel}
          isExportingExcel={isExportingExcel}
        />

        <AdminTabRenderer
          activeTab={activeTab}
          salesData={salesData}
          loadingAnalytics={loadingAnalytics}
          onRefreshSales={fetchSalesSummary}
          onExportExcel={handleExportExcel}
          isExportingExcel={isExportingExcel}
          menus={menus}
          categories={categories}
          loadingMenus={loadingMenus}
          onCreateMenu={handleCreateMenu}
          onUpdateMenu={handleUpdateMenu}
          onDeleteMenu={handleDeleteMenu}
          onToggleMenuAvailability={handleToggleMenuAvailability}
          tables={tables}
          loadingTables={loadingTables}
          onCreateTable={handleCreateTable}
          onUpdateTable={handleUpdateTable}
          onRegenerateQr={handleRegenerateQr}
          ingredients={ingredients}
          loadingIngredients={loadingIngredients}
          onRestock={handleRestock}
          onCreateIngredient={handleCreateIngredient}
          shiftHistory={shiftHistory}
          auditLogs={auditLogs}
          cashierOrders={cashierOrders}
          systemUpdates={systemUpdates}
          loadingShifts={loadingShifts}
          onRefreshShifts={fetchShiftsAndLogs}
          vouchers={vouchers}
          loadingVouchers={loadingVouchers}
          onRefreshVouchers={fetchVouchers}
          onCreateVoucher={handleCreateVoucher}
          onToggleVoucher={handleToggleVoucher}
          onDeleteVoucher={handleDeleteVoucher}
          usersList={usersList}
          loadingUsers={loadingUsers}
          currentUser={user}
          onCreateUser={handleCreateUser}
          onDeleteUser={handleDeleteUser}
        />
      </div>
    </div>
  );
}
