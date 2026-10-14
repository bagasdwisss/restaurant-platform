import * as XLSX from "xlsx";

interface FullExportData {
  summary: {
    totalGrossRevenue: number;
    totalSubtotal: number;
    totalTaxAmount: number;
    totalServiceCharge: number;
    totalDiscountAmount: number;
    estimatedCOGS: number;
    estimatedGrossProfit: number;
    paidOrdersCount: number;
    unpaidOrdersCount: number;
    cancelledOrdersCount: number;
    totalAllOrders: number;
    avgOrderValue: number;
    paymentMethodsSummary: {
      cash: { count: number; total: number };
      qris: { count: number; total: number };
      debit: { count: number; total: number };
      other: { count: number; total: number };
    };
    orderTypesSummary: {
      dine_in: { count: number; total: number };
      reservation: { count: number; total: number };
      takeaway: { count: number; total: number };
    };
    totalTables: number;
    totalMenuItems: number;
    totalIngredients: number;
    totalVouchers: number;
    generatedAt: string;
  };
  orders: any[];
  menus: any[];
  categories: any[];
  shifts: any[];
  ingredients: any[];
  vouchers: any[];
  auditLogs: any[];
  tables: any[];
}

/**
 * Format ISO Date String to Indonesian human-readable format: DD/MM/YYYY HH:mm
 */
function formatDateTime(dateInput?: string | Date | null): string {
  if (!dateInput) return "-";
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return String(dateInput);
  return d.toLocaleString("id-ID", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateOnly(dateInput?: string | Date | null): string {
  if (!dateInput) return "-";
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return String(dateInput);
  return d.toLocaleDateString("id-ID", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

/**
 * Auto-calculate column widths to prevent truncation in Excel
 */
function autoFitColumns(rows: Record<string, any>[]): { wch: number }[] {
  if (!rows || rows.length === 0) return [];
  const keys = Object.keys(rows[0]);
  return keys.map((key) => {
    let maxLen = key.length;
    for (const row of rows) {
      const val = row[key];
      const strVal = val !== null && val !== undefined ? String(val) : "";
      if (strVal.length > maxLen) {
        maxLen = strVal.length;
      }
    }
    return { wch: Math.min(Math.max(maxLen + 3, 12), 65) };
  });
}

/**
 * Translate order status code to clean Indonesian label
 */
function translateOrderStatus(status?: string): string {
  switch (status?.toLowerCase()) {
    case "pending":
      return "Menunggu Konfirmasi";
    case "confirmed":
      return "Dikonfirmasi Kasir";
    case "preparing":
      return "Dimasak Dapur";
    case "served":
      return "Disajikan di Meja";
    case "completed":
      return "Selesai (Lunas)";
    case "cancelled":
      return "Dibatalkan";
    case "voided":
      return "Void (Otorisasi Supervisor)";
    default:
      return status || "-";
  }
}

/**
 * Translate order type code to clean Indonesian label
 */
function translateOrderType(type?: string): string {
  switch (type?.toLowerCase()) {
    case "reservation":
      return "Reservasi Meja Online";
    case "dine_in":
      return "Dine In (Makan di Tempat)";
    case "takeaway":
      return "Takeaway (Bungkus Pulang)";
    default:
      return type || "Dine In";
  }
}

/**
 * Translate payment method code to clean Indonesian label
 */
function translatePaymentMethod(method?: string | null): string {
  switch (method?.toLowerCase()) {
    case "cash":
      return "Tunai (Cash Fisik)";
    case "qris":
      return "QRIS Dinamis (E-Wallet/BCA/Gopay)";
    case "debit":
      return "Kartu Debit / EDC Bank";
    default:
      return method ? method.toUpperCase() : "Belum Memilih Metode";
  }
}

/**
 * Main Comprehensive Excel Export Generator
 */
export async function generateComprehensiveExcel(
  data: FullExportData,
  adminName: string = "Administrator SAVORIA"
) {
  const wb = XLSX.utils.book_new();
  const exportDate = new Date();
  const dateFormatted = formatDateTime(exportDate);

  // =========================================================================
  // SHEET 1: RINGKASAN EKSEKUTIF & FINANSIAL
  // =========================================================================
  const summaryHeaderRows = [
    { Indikator: "ENTITAS USAHA", Nilai: "SAVORIA Haute Cuisine Fine Dining" },
    { Indikator: "DOKUMEN", Nilai: "Laporan Lengkap Audit Finansial & Operasional" },
    { Indikator: "WAKTU EKSPOR", Nilai: `${dateFormatted} WIB` },
    { Indikator: "DICETAK OLEH", Nilai: adminName },
    { Indikator: "-------------------------", Nilai: "-----------------------------------------" },
    { Indikator: "TOTAL OMZET KOTOR (GROSS REVENUE)", Nilai: data.summary.totalGrossRevenue },
    { Indikator: "Total Subtotal Pesanan Hidangan", Nilai: data.summary.totalSubtotal },
    { Indikator: "Total Pajak Restoran PB1 (10%)", Nilai: data.summary.totalTaxAmount },
    { Indikator: "Total Biaya Layanan Service Charge (5%)", Nilai: data.summary.totalServiceCharge },
    { Indikator: "Total Potongan Diskon Voucher Promo", Nilai: data.summary.totalDiscountAmount },
    { Indikator: "Estimasi Biaya Bahan Makanan (COGS 35%)", Nilai: data.summary.estimatedCOGS },
    { Indikator: "ESTIMASI LABA KOTOR (GROSS PROFIT)", Nilai: data.summary.estimatedGrossProfit },
    { Indikator: "-------------------------", Nilai: "-----------------------------------------" },
    { Indikator: "Total Transaksi Pesanan Lunas (Paid)", Nilai: data.summary.paidOrdersCount },
    { Indikator: "Total Transaksi Belum Lunas (Unpaid)", Nilai: data.summary.unpaidOrdersCount },
    { Indikator: "Total Transaksi Dibatalkan / Void", Nilai: data.summary.cancelledOrdersCount },
    { Indikator: "Total Keseluruhan Pesanan Terdaftar", Nilai: data.summary.totalAllOrders },
    { Indikator: "Rata-Rata Nilai Transaksi per Meja (AOV)", Nilai: data.summary.avgOrderValue },
    { Indikator: "-------------------------", Nilai: "-----------------------------------------" },
    { Indikator: "Total Fasilitas Meja Restoran", Nilai: `${data.summary.totalTables} Meja` },
    { Indikator: "Total Varian Hidangan Aktif di Menu", Nilai: `${data.summary.totalMenuItems} Menu` },
    { Indikator: "Total Jenis Bahan Baku Inventaris", Nilai: `${data.summary.totalIngredients} Item` },
    { Indikator: "Total Program Voucher Promo", Nilai: `${data.summary.totalVouchers} Voucher` },
  ];

  const wsSummary = XLSX.utils.json_to_sheet(summaryHeaderRows);
  wsSummary["!cols"] = [{ wch: 42 }, { wch: 38 }];
  XLSX.utils.book_append_sheet(wb, wsSummary, "Ringkasan Eksekutif");

  // =========================================================================
  // SHEET 2: REKAP METODE PEMBAYARAN & TIPE JAMUAN
  // =========================================================================
  const paymentRows = [
    {
      "Kategori Saluran": "Metode Pembayaran",
      "Nama Saluran / Tipe": "Tunai (Cash)",
      "Jumlah Transaksi": data.summary.paymentMethodsSummary.cash.count,
      "Total Penerimaan (Rp)": data.summary.paymentMethodsSummary.cash.total,
      "Porsi Kontribusi (%)":
        data.summary.totalGrossRevenue > 0
          ? `${((data.summary.paymentMethodsSummary.cash.total / data.summary.totalGrossRevenue) * 100).toFixed(2)}%`
          : "0%",
    },
    {
      "Kategori Saluran": "Metode Pembayaran",
      "Nama Saluran / Tipe": "QRIS Dinamis (GoPay, OVO, ShopeePay, BCA)",
      "Jumlah Transaksi": data.summary.paymentMethodsSummary.qris.count,
      "Total Penerimaan (Rp)": data.summary.paymentMethodsSummary.qris.total,
      "Porsi Kontribusi (%)":
        data.summary.totalGrossRevenue > 0
          ? `${((data.summary.paymentMethodsSummary.qris.total / data.summary.totalGrossRevenue) * 100).toFixed(2)}%`
          : "0%",
    },
    {
      "Kategori Saluran": "Metode Pembayaran",
      "Nama Saluran / Tipe": "Kartu Debit / Kartu Kredit EDC",
      "Jumlah Transaksi": data.summary.paymentMethodsSummary.debit.count,
      "Total Penerimaan (Rp)": data.summary.paymentMethodsSummary.debit.total,
      "Porsi Kontribusi (%)":
        data.summary.totalGrossRevenue > 0
          ? `${((data.summary.paymentMethodsSummary.debit.total / data.summary.totalGrossRevenue) * 100).toFixed(2)}%`
          : "0%",
    },
    {
      "Kategori Saluran": "Tipe Jamuan",
      "Nama Saluran / Tipe": "Reservasi Meja Online (VIP Booking)",
      "Jumlah Transaksi": data.summary.orderTypesSummary.reservation.count,
      "Total Penerimaan (Rp)": data.summary.orderTypesSummary.reservation.total,
      "Porsi Kontribusi (%)":
        data.summary.totalGrossRevenue > 0
          ? `${((data.summary.orderTypesSummary.reservation.total / data.summary.totalGrossRevenue) * 100).toFixed(2)}%`
          : "0%",
    },
    {
      "Kategori Saluran": "Tipe Jamuan",
      "Nama Saluran / Tipe": "Dine In (Makan di Meja Restoran)",
      "Jumlah Transaksi": data.summary.orderTypesSummary.dine_in.count,
      "Total Penerimaan (Rp)": data.summary.orderTypesSummary.dine_in.total,
      "Porsi Kontribusi (%)":
        data.summary.totalGrossRevenue > 0
          ? `${((data.summary.orderTypesSummary.dine_in.total / data.summary.totalGrossRevenue) * 100).toFixed(2)}%`
          : "0%",
    },
    {
      "Kategori Saluran": "Tipe Jamuan",
      "Nama Saluran / Tipe": "Takeaway (Bawa Pulang)",
      "Jumlah Transaksi": data.summary.orderTypesSummary.takeaway.count,
      "Total Penerimaan (Rp)": data.summary.orderTypesSummary.takeaway.total,
      "Porsi Kontribusi (%)":
        data.summary.totalGrossRevenue > 0
          ? `${((data.summary.orderTypesSummary.takeaway.total / data.summary.totalGrossRevenue) * 100).toFixed(2)}%`
          : "0%",
    },
  ];

  const wsPayments = XLSX.utils.json_to_sheet(paymentRows);
  wsPayments["!cols"] = autoFitColumns(paymentRows);
  XLSX.utils.book_append_sheet(wb, wsPayments, "Metode & Tipe Pesanan");

  // =========================================================================
  // SHEET 3: DAFTAR SEMUA PESANAN & TRANSAKSI (MASTER ORDERS)
  // =========================================================================
  const orderRows = data.orders.map((o, idx) => {
    // Generate clean item summaries
    const itemsSummary = (o.items || [])
      .map((it: any) => {
        let variantNote = "";
        if (it.selectedVariants) {
          try {
            const parsed = JSON.parse(it.selectedVariants);
            if (Array.isArray(parsed) && parsed.length > 0) {
              variantNote = ` (${parsed.map((p: any) => p.option || p.name).join(", ")})`;
            }
          } catch {}
        }
        return `${it.quantity}x ${it.menu?.name || "Hidangan"}${variantNote}`;
      })
      .join("; ");

    return {
      "No.": idx + 1,
      "No. Pesanan": `#${o.orderNumber}`,
      "Waktu Transaksi (WIB)": formatDateTime(o.createdAt),
      "Tanggal Reservasi/Jamuan": o.reservationDate ? formatDateOnly(o.reservationDate) : formatDateOnly(o.createdAt),
      "Sesi Jamuan / Jam": o.reservationTime || "Dine-in Langsung",
      "Nama Pelanggan": o.customerName || "Tamu Restoran",
      "No. Telepon / WhatsApp": o.customerPhone || "-",
      "Meja": o.table?.tableNumber ? `Meja ${o.table.tableNumber}` : "VIP / Takeaway",
      "Area Restoran": o.table?.area || "Main Hall",
      "Jumlah Tamu (Pax)": o.guestCount || 2,
      "Tipe Jamuan": translateOrderType(o.orderType),
      "Status Pesanan": translateOrderStatus(o.status),
      "Status Pembayaran": o.paymentStatus === "paid" ? "LUNAS" : "BELUM LUNAS",
      "Metode Pembayaran": translatePaymentMethod(o.paymentMethod),
      "Kasir yang Melayani": o.shift?.cashierName || "Sistem Reservasi",
      "Rincian Hidangan Dipesan": itemsSummary || "-",
      "Subtotal (Rp)": o.subtotal || 0,
      "Diskon Voucher (Rp)": o.discountAmount || 0,
      "Kode Voucher Digunakan": o.voucher?.code || "-",
      "Pajak PB1 10% (Rp)": o.taxAmount || 0,
      "Biaya Layanan 5% (Rp)": o.serviceCharge || 0,
      "TOTAL AKHIR TRANSAKSI (Rp)": o.totalAmount || 0,
      "Permintaan Khusus Tamu": o.specialRequests || "-",
    };
  });

  const wsOrders = XLSX.utils.json_to_sheet(orderRows);
  wsOrders["!cols"] = autoFitColumns(orderRows);
  XLSX.utils.book_append_sheet(wb, wsOrders, "Daftar Semua Pesanan");

  // =========================================================================
  // SHEET 4: RINCIAN ITEM TERJUAL (ITEMIZED ORDER ITEMS)
  // =========================================================================
  const itemRows: any[] = [];
  let itemCounter = 1;

  for (const order of data.orders) {
    if (!order.items || order.items.length === 0) continue;
    for (const it of order.items) {
      let variantDetail = "-";
      if (it.selectedVariants) {
        try {
          const parsed = JSON.parse(it.selectedVariants);
          if (Array.isArray(parsed) && parsed.length > 0) {
            variantDetail = parsed.map((p: any) => `${p.group}: ${p.option} (+Rp ${p.extraPrice || 0})`).join(" | ");
          }
        } catch {}
      }

      itemRows.push({
        "No.": itemCounter++,
        "No. Pesanan": `#${order.orderNumber}`,
        "Waktu Order (WIB)": formatDateTime(order.createdAt),
        "Nama Pelanggan": order.customerName || "Tamu",
        "Meja": order.table?.tableNumber ? `Meja ${order.table.tableNumber}` : "-",
        "Kategori Menu": it.menu?.category?.name || "General",
        "Nama Hidangan": it.menu?.name || "Menu",
        "Pilihan Varian / Custom": variantDetail,
        "Catatan Khusus": it.notes || "-",
        "Jumlah (Porsi)": it.quantity,
        "Harga Satuan (Rp)": it.unitPrice,
        "Total Subtotal Item (Rp)": it.subtotal,
        "Status Pembayaran Order": order.paymentStatus === "paid" ? "Lunas" : "Belum Lunas",
        "Status Void": it.isVoided ? "VOID" : "Aktif",
        "Alasan Void": it.voidReason || "-",
      });
    }
  }

  const wsItems = XLSX.utils.json_to_sheet(itemRows);
  wsItems["!cols"] = autoFitColumns(itemRows);
  XLSX.utils.book_append_sheet(wb, wsItems, "Rincian Item Terjual");

  // =========================================================================
  // SHEET 5: PERFORMA KATALOG MENU & PERINGKAT TERLARIS
  // =========================================================================
  const menuPerformanceMap = new Map<number, { menu: any; totalQty: number; totalRevenue: number }>();

  // Aggregate menu item quantities and revenues from orders
  for (const menu of data.menus) {
    let qty = 0;
    let rev = 0;
    if (menu.orderItems) {
      for (const oi of menu.orderItems) {
        if (oi.order?.paymentStatus === "paid") {
          qty += oi.quantity || 0;
          rev += oi.subtotal || 0;
        }
      }
    }
    menuPerformanceMap.set(menu.id, { menu, totalQty: qty, totalRevenue: rev });
  }

  const sortedMenus = Array.from(menuPerformanceMap.values()).sort(
    (a, b) => b.totalQty - a.totalQty || b.totalRevenue - a.totalRevenue
  );

  const menuPerformanceRows = sortedMenus.map((entry, idx) => {
    const { menu, totalQty, totalRevenue } = entry;
    const contribution =
      data.summary.totalGrossRevenue > 0
        ? `${((totalRevenue / data.summary.totalGrossRevenue) * 100).toFixed(2)}%`
        : "0%";

    return {
      "Peringkat": idx + 1,
      "Kategori Menu": menu.category?.name || "Kategori Umum",
      "Nama Hidangan": menu.name,
      "Harga Normal (Rp)": menu.price,
      "Total Porsi Terjual (Qty)": totalQty,
      "Total Omzet Dihasilkan (Rp)": totalRevenue,
      "Kontribusi terhadap Total Omzet (%)": contribution,
      "Status Ketersediaan": menu.isAvailable ? "Tersedia (Ready)" : "Habis (Sold Out)",
    };
  });

  const wsMenuPerf = XLSX.utils.json_to_sheet(menuPerformanceRows);
  wsMenuPerf["!cols"] = autoFitColumns(menuPerformanceRows);
  XLSX.utils.book_append_sheet(wb, wsMenuPerf, "Performa Menu Terlaris");

  // =========================================================================
  // SHEET 6: RIWAYAT SHIFT KASIR & REKONSILIASI KAS
  // =========================================================================
  const shiftRows = data.shifts.map((sh) => {
    const startCash = sh.startCash || 0;
    const actualCash = sh.endCashActual ?? null;
    const expectedCash = sh.endCashExpected ?? null;
    const variance = sh.variance ?? null;

    let varianceStatus = "-";
    if (variance !== null) {
      if (variance === 0) varianceStatus = "SEIMBANG (PAS)";
      else if (variance > 0) varianceStatus = `SURPLUS (+Rp ${Math.abs(variance).toLocaleString("id-ID")})`;
      else varianceStatus = `DEFISIT (-Rp ${Math.abs(variance).toLocaleString("id-ID")})`;
    }

    const orderCount = sh.orders ? sh.orders.length : 0;
    const totalShiftSales = (sh.orders || []).reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);

    return {
      "ID Shift": `#SHIFT-${sh.id}`,
      "Nama Kasir": sh.cashierName || "Kasir Utama",
      "Waktu Buka Shift (WIB)": formatDateTime(sh.openedAt),
      "Waktu Tutup Shift (WIB)": sh.closedAt ? formatDateTime(sh.closedAt) : "Sedang Aktif (Berjalan)",
      "Modal Awal Kas (Rp)": startCash,
      "Kas Diharapkan Sistem (Rp)": expectedCash !== null ? expectedCash : "-",
      "Kas Aktual Dihitung (Rp)": actualCash !== null ? actualCash : "-",
      "Selisih Kas / Variance (Rp)": variance !== null ? variance : "-",
      "Status Rekonsiliasi Kas": varianceStatus,
      "Total Transaksi Tertangani": orderCount,
      "Total Nilai Penjualan Shift (Rp)": totalShiftSales,
      "Status Shift": sh.status === "closed" ? "Ditutup (Closed)" : "Aktif (Open)",
    };
  });

  const wsShifts = XLSX.utils.json_to_sheet(shiftRows);
  wsShifts["!cols"] = autoFitColumns(shiftRows);
  XLSX.utils.book_append_sheet(wb, wsShifts, "Riwayat Shift Kasir");

  // =========================================================================
  // SHEET 7: INVENTARIS BAHAN BAKU & STOK
  // =========================================================================
  const ingredientRows = data.ingredients.map((ing, idx) => {
    let stockStatus = "Stok Aman";
    if (ing.stockQuantity <= 0) {
      stockStatus = "KRITIS / HABIS";
    } else if (ing.stockQuantity <= ing.minStock) {
      stockStatus = "MENIPIS (Perlu Restock)";
    }

    return {
      "No.": idx + 1,
      "Nama Bahan Baku": ing.name,
      "Satuan Ukur (Unit)": ing.unit,
      "Stok Saat Ini": ing.stockQuantity,
      "Batas Minimum Aman": ing.minStock,
      "Status Ketersediaan": stockStatus,
      "Selisih ke Batas Minimum": ing.stockQuantity - ing.minStock,
    };
  });

  const wsIngredients = XLSX.utils.json_to_sheet(ingredientRows);
  wsIngredients["!cols"] = autoFitColumns(ingredientRows);
  XLSX.utils.book_append_sheet(wb, wsIngredients, "Inventaris & Bahan Baku");

  // =========================================================================
  // SHEET 8: KATALOG & PENGGUNAAN VOUCHER
  // =========================================================================
  const voucherRows = data.vouchers.map((v, idx) => {
    const isExpired = new Date(v.validUntil).getTime() < new Date().getTime();
    const isExhausted = v.usedCount >= v.maxUsage;

    let statusDesc = "Aktif & Dapat Dipakai";
    if (!v.isActive) statusDesc = "Dinonaktifkan";
    else if (isExpired) statusDesc = "Kadaluarsa";
    else if (isExhausted) statusDesc = "Kuota Habis";

    return {
      "No.": idx + 1,
      "Kode Voucher": v.code,
      "Nama Program Promo": v.name,
      "Tipe Potongan": v.discountType === "percentage" ? "Persentase (%)" : "Nominal Tetap (Rp)",
      "Besar Potongan": v.discountType === "percentage" ? `${v.discountValue}%` : `Rp ${v.discountValue.toLocaleString("id-ID")}`,
      "Minimal Belanja (Rp)": v.minSpend || 0,
      "Maksimal Potongan (Rp)": v.maxDiscount || "Tanpa Batas",
      "Batas Kuota Pengguna": v.maxUsage,
      "Total Telah Digunakan": v.usedCount,
      "Sisa Kuota Tersedia": Math.max(0, v.maxUsage - v.usedCount),
      "Masa Berlaku Hingga": formatDateOnly(v.validUntil),
      "Status Voucher": statusDesc,
    };
  });

  const wsVouchers = XLSX.utils.json_to_sheet(voucherRows);
  wsVouchers["!cols"] = autoFitColumns(voucherRows);
  XLSX.utils.book_append_sheet(wb, wsVouchers, "Voucher & Promo Diskon");

  // =========================================================================
  // SHEET 9: LOG AUDIT & KEAMANAN SISTEM
  // =========================================================================
  const auditRows = data.auditLogs.map((log, idx) => {
    return {
      "No.": idx + 1,
      "Waktu Kejadian (WIB)": formatDateTime(log.createdAt),
      "Pengguna / Staf": log.user || "System",
      "Jenis Aksi / Aktivitas": log.action,
      "Detail Keterangan Lengkap": log.details,
    };
  });

  const wsAudit = XLSX.utils.json_to_sheet(auditRows);
  wsAudit["!cols"] = autoFitColumns(auditRows);
  XLSX.utils.book_append_sheet(wb, wsAudit, "Log Audit & Keamanan");

  // =========================================================================
  // EXPORT FILE DOWNLOAD
  // =========================================================================
  const dateStr = exportDate.toISOString().slice(0, 10);
  const timeStr = exportDate.toTimeString().slice(0, 5).replace(":", "");
  const fileName = `Laporan-Lengkap-SAVORIA-${dateStr}-${timeStr}.xlsx`;

  XLSX.writeFile(wb, fileName);
  return fileName;
}
