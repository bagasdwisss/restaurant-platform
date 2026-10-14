"use client";

import React, { useState, useMemo } from "react";
import {
  Sparkles,
  Trees,
  Crown,
  Users,
  CheckCircle2,
  RefreshCw,
  Flame,
  Info,
  MapPin,
  UtensilsCrossed,
} from "lucide-react";
import { VisualTableCard, TableItemData } from "./VisualTableCard";

interface VisualFloorPlanProps {
  tables: TableItemData[];
  mode: "reservation" | "pos" | "admin";
  selectedTable?: TableItemData | null;
  guestCount?: number;
  onSelectTable?: (table: TableItemData) => void;
  onOpenBill?: (table: TableItemData) => void;
  onPayOrder?: (order: any) => void;
  onMoveTable?: (table: TableItemData) => void;
  onRefresh?: () => void;
}

type ZoneFilter = "all" | "indoor" | "outdoor" | "mezzanine";

export function VisualFloorPlan({
  tables,
  mode,
  selectedTable,
  guestCount = 2,
  onSelectTable,
  onOpenBill,
  onPayOrder,
  onMoveTable,
  onRefresh,
}: VisualFloorPlanProps) {
  const [activeZone, setActiveZone] = useState<ZoneFilter>("all");

  // Zone metadata with immersive culinary atmospheres
  const zoneProfiles = {
    all: {
      name: "Semua Suasana",
      badge: "Koleksi Lengkap Meja",
      icon: MapPin,
      ambiance: "Jelajahi seluruh denah meja eksklusif SAVORIA Haute Gastronomie dari lantai utama hingga balkon VIP.",
      features: ["3 Zona Jamuan", "Kapasitas 2-10 Pax", "Tata Letak Simetris"],
      bgTint: "from-stone-50 to-white",
    },
    indoor: {
      name: "Indoor Grand Salle",
      badge: "Chandelier Kristal & AC Sejuk",
      icon: Sparkles,
      ambiance: "Kemewahan ruang jamuan utama Prancis klasik dengan chandelier kristal bersinar hangat, pendingin udara sejuk, alunan musik jazz/klasik, dan meja perjamuan makan berkelas.",
      features: ["Pendingin Udara (AC) Sejuk", "Chandelier Kristal", "Alunan Jazz/Piano", "Taplak Linen Mewah"],
      bgTint: "from-amber-50/60 to-white",
    },
    outdoor: {
      name: "Outdoor Jardin Patio",
      badge: "Taman Asri & Al Fresco",
      icon: Trees,
      ambiance: "Sensasi santap terbuka (al fresco) di kelilingi lanskap taman Prancis tropis, gemericik air mancur, semilir angin malam yang sejuk, dan kehangatan lampion taman.",
      features: ["Nuansa Al Fresco", "Pemandangan Air Mancur", "Lampion Romantis", "Angin Malam Sejuk"],
      bgTint: "from-emerald-50/60 to-white",
    },
    mezzanine: {
      name: "Lantai 2 Mezzanine VIP",
      badge: "Privat, Wine Cellar & Luxury Lounge",
      icon: Crown,
      ambiance: "Ruang perjamuan privat di lantai dua dengan pemandangan terbuka balkon ke ruang utama, display koleksi botol wine vintage, sofa beludru premium, dan layanan personal butler.",
      features: ["Balkon Privat Eksklusif", "Sofa Velvet Mewah", "Vintage Wine Display", "Personal Butler Service"],
      bgTint: "from-purple-50/60 to-white",
    },
  };

  // Filter tables by active zone
  const filteredTables = useMemo(() => {
    if (activeZone === "all") return tables;

    return tables.filter((t) => {
      const area = (t.area || "").toLowerCase();
      if (activeZone === "outdoor") {
        return (
          area.includes("garden") ||
          area.includes("outdoor") ||
          area.includes("patio") ||
          area.includes("veranda") ||
          area.includes("teras")
        );
      }
      if (activeZone === "mezzanine") {
        return (
          area.includes("lantai 2") ||
          area.includes("mezzanine") ||
          area.includes("vip") ||
          area.includes("salon") ||
          area.includes("president")
        );
      }
      // indoor
      return (
        area.includes("indoor") ||
        area.includes("grand salon") ||
        (!area.includes("garden") && !area.includes("outdoor") && !area.includes("lantai 2") && !area.includes("mezzanine"))
      );
    });
  }, [tables, activeZone]);

  // Statistics
  const availableCount = tables.filter((t) => t.status === "available").length;
  const occupiedCount = tables.filter((t) => t.status === "occupied" || (t.orders && t.orders.length > 0)).length;
  const reservedCount = tables.filter((t) => t.status === "reserved").length;

  const currentZoneProfile = zoneProfiles[activeZone];
  const CurrentZoneIcon = currentZoneProfile.icon;

  return (
    <div className="space-y-6">
      {/* Zone Selector Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] pb-4">
        {/* Atmosphere Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
          {(["all", "indoor", "outdoor", "mezzanine"] as ZoneFilter[]).map((zoneKey) => {
            const profile = zoneProfiles[zoneKey];
            const Icon = profile.icon;
            const isActive = activeZone === zoneKey;

            // Count per zone
            const count =
              zoneKey === "all"
                ? tables.length
                : tables.filter((t) => {
                    const area = (t.area || "").toLowerCase();
                    if (zoneKey === "outdoor") {
                      return area.includes("garden") || area.includes("outdoor") || area.includes("veranda");
                    }
                    if (zoneKey === "mezzanine") {
                      return area.includes("lantai 2") || area.includes("mezzanine") || area.includes("vip");
                    }
                    return (
                      area.includes("indoor") ||
                      (!area.includes("garden") && !area.includes("outdoor") && !area.includes("lantai 2"))
                    );
                  }).length;

            return (
              <button
                key={zoneKey}
                type="button"
                onClick={() => setActiveZone(zoneKey)}
                className={`px-3.5 sm:px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0 shadow-xs ${
                  isActive
                    ? "bg-[#14281D] text-white shadow-md shadow-[#14281D]/20 scale-[1.02]"
                    : "bg-white border border-[#E2E8F0] text-[#64748B] hover:text-[#18181B] hover:border-[#EA580C]/40"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#EA580C]" : "text-stone-400"}`} />
                <span>{profile.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                    isActive ? "bg-white/20 text-white font-bold" : "bg-stone-100 text-stone-600"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Legend / Status summary badge */}
        <div className="flex items-center gap-3 text-xs font-semibold shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-[#64748B]">Tersedia ({availableCount})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="text-[#64748B]">Terisi ({occupiedCount})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
            <span className="text-[#64748B]">Dipesan ({reservedCount})</span>
          </div>
          {onRefresh && (
            <button
              onClick={onRefresh}
              title="Perbarui Denah Meja"
              className="p-1.5 rounded-full bg-white border border-[#E2E8F0] hover:text-[#EA580C] text-[#64748B] transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Selected Ambiance Sensory Atmosphere Card */}
      <div className={`p-4 sm:p-5 rounded-3xl border border-[#E2E8F0] bg-gradient-to-r ${currentZoneProfile.bgTint} shadow-sm space-y-3`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-white border border-[#E2E8F0] flex items-center justify-center text-[#EA580C] shadow-xs">
              <CurrentZoneIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-[#18181B] leading-tight">
                {currentZoneProfile.name}
              </h3>
              <p className="text-[11px] font-mono text-[#EA580C] font-semibold">
                {currentZoneProfile.badge}
              </p>
            </div>
          </div>

          {/* Key ambiance feature pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {currentZoneProfile.features.map((feat, i) => (
              <span
                key={i}
                className="text-[10px] font-medium bg-white/90 border border-stone-200/80 px-2.5 py-1 rounded-full text-stone-700 shadow-xs"
              >
                ✓ {feat}
              </span>
            ))}
          </div>
        </div>

        <p className="text-xs text-[#64748B] leading-relaxed max-w-3xl">
          {currentZoneProfile.ambiance}
        </p>
      </div>

      {/* Tables Grid with Architectural Chairs Layout */}
      {filteredTables.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#E2E8F0] p-12 text-center text-[#64748B] shadow-sm">
          <UtensilsCrossed className="w-10 h-10 mx-auto mb-2 text-stone-300" />
          <h4 className="font-serif font-bold text-base text-[#18181B]">
            Tidak ada meja di zona suasana ini
          </h4>
          <p className="text-xs text-[#64748B] mt-1">
            Silakan pilih tab &ldquo;Semua Suasana&rdquo; untuk melihat seluruh denah meja restoran.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {filteredTables.map((tbl) => (
            <VisualTableCard
              key={tbl.id}
              table={tbl}
              mode={mode}
              isSelected={selectedTable?.id === tbl.id}
              guestCount={guestCount}
              onSelect={onSelectTable}
              onOpenBill={onOpenBill}
              onPayOrder={onPayOrder}
              onMoveTable={onMoveTable}
            />
          ))}
        </div>
      )}

      {/* Selected Table Floating Summary Bar for Reservation Mode */}
      {mode === "reservation" && selectedTable && (
        <div className="sticky bottom-4 z-30 bg-[#14281D] text-white p-3.5 sm:p-4 rounded-2xl sm:rounded-full shadow-2xl border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#EA580C] text-white flex items-center justify-center font-serif font-black text-sm shrink-0 shadow-cta">
              {selectedTable.tableNumber}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-sm text-white">
                  Meja {selectedTable.tableNumber} Terpilih
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {selectedTable.capacity} Kursi
                </span>
              </div>
              <p className="text-[11px] text-stone-300 font-light">
                Area: {selectedTable.area} • Suasana Terkonfirmasi
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <span className="text-xs text-stone-300 hidden md:inline">
              Siap untuk melanjutkan ke tahap Pembayaran
            </span>
            <div className="px-4 py-2 rounded-full bg-[#EA580C] text-white text-xs font-bold flex items-center gap-1.5 shadow-cta">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Meja Terkunci untuk Anda</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
