"use client";

import React from "react";
import dynamic from "next/dynamic";
import { AdminTab } from "./AdminSidebar";
import { TabSkeleton } from "./TabSkeleton";

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

const VouchersTab = dynamic(
  () => import("@/components/admin/VouchersTab").then((m) => m.VouchersTab),
  {
    loading: () => <TabSkeleton title="Memuat Katalog Voucher & Promo Diskon..." count={4} />,
    ssr: false,
  }
);

interface AdminTabRendererProps {
  activeTab: AdminTab;
  salesData: any;
  loadingAnalytics: boolean;
  onRefreshSales: () => void;
  onExportExcel: () => void;
  isExportingExcel: boolean;

  // Menus
  menus: any[];
  categories: any[];
  loadingMenus: boolean;
  onCreateMenu: (form: any) => Promise<boolean>;
  onUpdateMenu: (menuId: number, form: any) => Promise<boolean>;
  onDeleteMenu: (id: number, name: string) => Promise<void>;
  onToggleMenuAvailability: (id: number, current: boolean) => Promise<void>;

  // Tables
  tables: any[];
  loadingTables: boolean;
  onCreateTable: (form: any) => Promise<boolean>;
  onUpdateTable: (id: number, form: any) => Promise<boolean>;
  onRegenerateQr: (id: number) => Promise<void>;

  // Inventory
  ingredients: any[];
  loadingIngredients: boolean;
  onRestock: (id: number, amount: number) => Promise<boolean>;
  onCreateIngredient: (form: any) => Promise<boolean>;

  // Shifts
  shiftHistory: any[];
  auditLogs: any[];
  cashierOrders: any[];
  systemUpdates: any[];
  loadingShifts: boolean;
  onRefreshShifts: () => void;

  // Vouchers
  vouchers: any[];
  loadingVouchers: boolean;
  onRefreshVouchers: () => void;
  onCreateVoucher: (form: any) => Promise<boolean>;
  onToggleVoucher: (id: string, current: boolean) => Promise<boolean>;
  onDeleteVoucher: (id: string) => Promise<boolean>;

  // Users
  usersList: any[];
  loadingUsers: boolean;
  currentUser: any;
  onCreateUser: (form: any) => Promise<boolean>;
  onDeleteUser: (id: number, name: string) => Promise<void>;
}

export function AdminTabRenderer({
  activeTab,
  salesData,
  loadingAnalytics,
  onRefreshSales,
  onExportExcel,
  isExportingExcel,
  menus,
  categories,
  loadingMenus,
  onCreateMenu,
  onUpdateMenu,
  onDeleteMenu,
  onToggleMenuAvailability,
  tables,
  loadingTables,
  onCreateTable,
  onUpdateTable,
  onRegenerateQr,
  ingredients,
  loadingIngredients,
  onRestock,
  onCreateIngredient,
  shiftHistory,
  auditLogs,
  cashierOrders,
  systemUpdates,
  loadingShifts,
  onRefreshShifts,
  vouchers,
  loadingVouchers,
  onRefreshVouchers,
  onCreateVoucher,
  onToggleVoucher,
  onDeleteVoucher,
  usersList,
  loadingUsers,
  currentUser,
  onCreateUser,
  onDeleteUser,
}: AdminTabRendererProps) {
  return (
    <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
      {activeTab === "analytics" && (
        <AnalyticsTab
          salesData={salesData}
          isLoading={loadingAnalytics}
          onRefresh={onRefreshSales}
          onExportExcel={onExportExcel}
          isExportingExcel={isExportingExcel}
        />
      )}

      {activeTab === "menus" &&
        (loadingMenus && menus.length === 0 ? (
          <TabSkeleton title="Memuat Master Katalog Menu & Resep Dapur..." count={4} />
        ) : (
          <MenusTab
            menus={menus}
            categories={categories}
            onCreateMenu={onCreateMenu}
            onUpdateMenu={onUpdateMenu}
            onDeleteMenu={onDeleteMenu}
            onToggleAvailability={onToggleMenuAvailability}
          />
        ))}

      {activeTab === "tables" &&
        (loadingTables && tables.length === 0 ? (
          <TabSkeleton title="Memuat Denah Meja & Tata Letak Restoran..." count={4} />
        ) : (
          <TablesTab
            tables={tables}
            onCreateTable={onCreateTable}
            onUpdateTable={onUpdateTable}
            onRegenerateQr={onRegenerateQr}
          />
        ))}

      {activeTab === "inventory" &&
        (loadingIngredients && ingredients.length === 0 ? (
          <TabSkeleton title="Memuat Stok Bahan Baku & Inventaris Dapur..." count={4} />
        ) : (
          <InventoryTab
            ingredients={ingredients}
            onRestock={onRestock}
            onCreateIngredient={onCreateIngredient}
          />
        ))}

      {activeTab === "shifts" &&
        (loadingShifts && shiftHistory.length === 0 ? (
          <TabSkeleton title="Memuat Riwayat Shift Kasir & Log Audit..." count={4} />
        ) : (
          <ShiftsTab
            shiftHistory={shiftHistory}
            auditLogs={auditLogs}
            cashierOrders={cashierOrders}
            systemUpdates={systemUpdates}
            onRefresh={onRefreshShifts}
          />
        ))}

      {activeTab === "vouchers" &&
        (loadingVouchers && vouchers.length === 0 ? (
          <TabSkeleton title="Memuat Katalog Voucher & Promo Diskon..." count={4} />
        ) : (
          <VouchersTab
            vouchers={vouchers}
            isLoading={loadingVouchers}
            onRefresh={onRefreshVouchers}
            onCreateVoucher={onCreateVoucher}
            onToggleVoucher={onToggleVoucher}
            onDeleteVoucher={onDeleteVoucher}
          />
        ))}

      {activeTab === "users" &&
        (loadingUsers && usersList.length === 0 ? (
          <TabSkeleton title="Memuat Manajemen Hak Akses Pengguna..." count={4} />
        ) : (
          <UsersTab
            usersList={usersList}
            loadingUsers={loadingUsers}
            currentUser={currentUser}
            onCreateUser={onCreateUser}
            onDeleteUser={onDeleteUser}
          />
        ))}
    </main>
  );
}
