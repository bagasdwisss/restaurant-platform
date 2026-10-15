"use client";

import React, { useState, useMemo } from "react";
import { Modal } from "@/components/ui/Modal";
import { formatIDR } from "@/lib/utils";
import {
  Flame,
  Thermometer,
  Sparkles,
  CheckCircle2,
  X,
  ChefHat,
  Award,
  Info,
} from "lucide-react";

export interface SteakCustomization {
  doneness: string;
  temperatureC: number;
  temperatureF: number;
  saltLevelName: string;
  saltPercentage: number;
  butterGlaze: string;
  butterExtraPrice: number;
  pepperCrust: string;
  summaryNotes: string;
  extraTotalPrice: number;
}

interface SteakDonenessFlavorModalProps {
  isOpen: boolean;
  onClose: () => void;
  menuItem: {
    id: number;
    name: string;
    price: number;
    image?: string | null;
  } | null;
  onConfirm: (customization: SteakCustomization) => void;
}

const DONENESS_LEVELS = [
  {
    key: "rare",
    name: "Rare",
    tempC: 48,
    tempF: 118,
    colorCore: "#8B0000",
    colorGradient: "radial-gradient(circle, #8B0000 35%, #590000 70%, #2B1108 100%)",
    desc: "Tengah merah dingin, ultra empuk dan lumer di lidah dengan sari daging alami melimpah.",
    tenderness: 10,
    juiciness: 10,
    isChefChoice: false,
  },
  {
    key: "medium_rare",
    name: "Medium Rare",
    tempC: 54,
    tempF: 130,
    colorCore: "#C72C41",
    colorGradient: "radial-gradient(circle, #C72C41 40%, #801323 75%, #2B1108 100%)",
    desc: "Pusat merah hangat selembut sutra. Standar emas para chef untuk daging wagyu & prime cut.",
    tenderness: 9,
    juiciness: 9,
    isChefChoice: true,
  },
  {
    key: "medium",
    name: "Medium",
    tempC: 60,
    tempF: 140,
    colorCore: "#D9534F",
    colorGradient: "radial-gradient(circle, #D9534F 45%, #8B3A3A 80%, #2B1108 100%)",
    desc: "Tengah merah muda hangat merata dengan tekstur kenyal empuk dan aroma panggang seimbang.",
    tenderness: 8,
    juiciness: 8,
    isChefChoice: false,
  },
  {
    key: "medium_well",
    name: "Medium Well",
    tempC: 65,
    tempF: 149,
    colorCore: "#9E6B65",
    colorGradient: "radial-gradient(circle, #A26769 30%, #6E4748 70%, #2B1108 100%)",
    desc: "Hanya sedikit rona merah muda tersisa, tekstur lebih padat dengan rasa gurih pekat.",
    tenderness: 7,
    juiciness: 6,
    isChefChoice: false,
  },
  {
    key: "well_done",
    name: "Well Done",
    tempC: 71,
    tempF: 160,
    colorCore: "#5D4037",
    colorGradient: "radial-gradient(circle, #5D4037 40%, #3E2723 75%, #20120D 100%)",
    desc: "Matang sempurna menyeluruh hingga ke serat terdalam, kerak karamelisasi renyah smokey.",
    tenderness: 6,
    juiciness: 5,
    isChefChoice: false,
  },
];

const BUTTER_GLAZES = [
  { id: "garlic_thyme", name: "Normandy Garlic & Herb Thyme Butter", price: 0 },
  { id: "black_truffle", name: "Périgord Black Truffle Infused Butter", price: 25000 },
  { id: "bone_marrow", name: "Rich Roasted Bone Marrow Emulsion", price: 35000 },
  { id: "olive_herb", name: "Extra Virgin Olive Oil & Rosemary Mist", price: 0 },
];

const PEPPER_CRUSTS = [
  { id: "gentle", name: "Aromatik Halus (Gentle Tellicherry Pepper Dust)" },
  { id: "cracked", name: "Cracked Black Peppercorn Crust (Karakter Pedas Hangat)" },
  { id: "charred", name: "Hardwood Charcoal Sear (Aroma Asap Kayu Ek)" },
];

export function SteakDonenessFlavorModal({
  isOpen,
  onClose,
  menuItem,
  onConfirm,
}: SteakDonenessFlavorModalProps) {
  const [donenessIdx, setDonenessIdx] = useState(1); // Default: Medium Rare
  const [saltPct, setSaltPct] = useState(50); // 50%
  const [selectedButterId, setSelectedButterId] = useState("black_truffle");
  const [selectedPepperId, setSelectedPepperId] = useState("cracked");

  const currentDoneness = DONENESS_LEVELS[donenessIdx];

  const currentSaltName = useMemo(() => {
    if (saltPct <= 25) return "Delikat Alami (Fleur de Sel Minimalis)";
    if (saltPct <= 70) return "Klasik Seimbang (Maldon Smoked Sea Salt)";
    return "Tebal Berkerak (Sel Gris Guérande Bolder Crust)";
  }, [saltPct]);

  const currentButter = useMemo(() => {
    return BUTTER_GLAZES.find((b) => b.id === selectedButterId) || BUTTER_GLAZES[0];
  }, [selectedButterId]);

  const currentPepper = useMemo(() => {
    return PEPPER_CRUSTS.find((p) => p.id === selectedPepperId) || PEPPER_CRUSTS[0];
  }, [selectedPepperId]);

  if (!isOpen || !menuItem) return null;

  const handleApply = () => {
    const summary = `Doneness: ${currentDoneness.name} (${currentDoneness.tempC}°C) • Glaze: ${currentButter.name} • Salt: ${currentSaltName} • Crust: ${currentPepper.name}`;
    onConfirm({
      doneness: `${currentDoneness.name} (${currentDoneness.tempC}°C / ${currentDoneness.tempF}°F)`,
      temperatureC: currentDoneness.tempC,
      temperatureF: currentDoneness.tempF,
      saltLevelName: currentSaltName,
      saltPercentage: saltPct,
      butterGlaze: currentButter.name,
      butterExtraPrice: currentButter.price,
      pepperCrust: currentPepper.name,
      summaryNotes: summary,
      extraTotalPrice: currentButter.price,
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-[#14281D] text-white rounded-3xl border border-white/15 p-5 sm:p-7 max-w-xl w-full space-y-6 shadow-2xl relative animate-in fade-in zoom-in-95 my-auto max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EA580C]/20 border border-[#EA580C]/30 text-[#FB923C] text-[10px] font-mono font-bold tracking-wider uppercase mb-1">
            <Flame className="w-3.5 h-3.5 text-[#EA580C] animate-pulse" />
            <span>Interactive Gastronomy Studio</span>
          </div>
          <h3 className="font-serif text-2xl font-bold text-white">
            Kustomisasi Kematangan &amp; Cita Rasa
          </h3>
          <p className="text-xs text-slate-300">
            {menuItem.name} • <strong className="text-amber-400 font-mono">{formatIDR(menuItem.price)}</strong>
          </p>
        </div>

        {/* 1. VISUAL STEAK DONENESS SLIDER SECTION */}
        <div className="bg-black/40 rounded-2xl p-4 sm:p-5 border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-[#EA580C]" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                1. Tingkat Kematangan Daging
              </span>
            </div>
            {currentDoneness.isChefChoice && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30 font-mono">
                <ChefHat className="w-3 h-3" />
                <span>Pilihan Chef</span>
              </span>
            )}
          </div>

          {/* Interactive Graphic Meat Cross Section Simulation */}
          <div className="relative h-32 rounded-2xl overflow-hidden border border-white/15 shadow-inner flex items-center justify-center p-3 transition-all duration-300"
            style={{ background: currentDoneness.colorGradient }}
          >
            {/* Outer Charred Grill Marks SVG Overlay */}
            <div className="absolute inset-0 opacity-40 pointer-events-none bg-[radial-gradient(#20120D_1px,transparent_1px)] [background-size:16px_16px]" />
            <div className="absolute top-0 bottom-0 left-0 right-0 border-y-4 border-[#20120D] opacity-80" />

            {/* Glowing Internal Readout */}
            <div className="relative z-10 text-center bg-black/60 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/20 shadow-xl space-y-0.5">
              <div className="flex items-center justify-center gap-1.5">
                <span className="font-serif font-black text-xl sm:text-2xl text-white">
                  {currentDoneness.name}
                </span>
                <span className="text-sm font-mono font-bold text-amber-400">
                  {currentDoneness.tempC}°C
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  / {currentDoneness.tempF}°F
                </span>
              </div>
              <p className="text-[11px] text-slate-200 font-sans max-w-sm line-clamp-2">
                {currentDoneness.desc}
              </p>
            </div>
          </div>

          {/* Continuous Step Slider */}
          <div className="space-y-2 pt-1">
            <input
              type="range"
              min={0}
              max={4}
              step={1}
              value={donenessIdx}
              onChange={(e) => setDonenessIdx(Number(e.target.value))}
              className="w-full h-2.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#EA580C]"
            />
            <div className="flex justify-between text-[10px] font-mono font-bold text-slate-400 px-1">
              {DONENESS_LEVELS.map((lvl, i) => (
                <button
                  key={lvl.key}
                  type="button"
                  onClick={() => setDonenessIdx(i)}
                  className={`cursor-pointer transition-colors ${
                    i === donenessIdx ? "text-[#FB923C] font-extrabold underline underline-offset-4" : "hover:text-white"
                  }`}
                >
                  {lvl.name}
                </button>
              ))}
            </div>
          </div>

          {/* Quality Metrics */}
          <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] font-mono text-slate-300">
            <div className="bg-white/5 rounded-xl p-2 border border-white/5 flex justify-between items-center">
              <span>Kelembutan (Tenderness):</span>
              <strong className="text-emerald-400">{currentDoneness.tenderness}/10</strong>
            </div>
            <div className="bg-white/5 rounded-xl p-2 border border-white/5 flex justify-between items-center">
              <span>Keberjusan (Juiciness):</span>
              <strong className="text-amber-400">{currentDoneness.juiciness}/10</strong>
            </div>
          </div>
        </div>

        {/* 2. FLAVOR & SEASONING MATRIX */}
        <div className="bg-black/40 rounded-2xl p-4 sm:p-5 border border-white/10 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#FB923C]" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
              2. Intensitas Kristal Garam Laut &amp; Bumbu
            </span>
          </div>

          {/* Salt Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-300">Intensitas Garam:</span>
              <span className="text-amber-400 font-bold">{currentSaltName} ({saltPct}%)</span>
            </div>
            <input
              type="range"
              min={10}
              max={100}
              step={5}
              value={saltPct}
              onChange={(e) => setSaltPct(Number(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>

          {/* Finishing Butter Glaze */}
          <div className="space-y-1.5 pt-2">
            <label className="text-xs font-mono font-bold text-slate-300 block">
              Sentuhan Akhir Mentega Istimewa (Artisan Glaze):
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {BUTTER_GLAZES.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setSelectedButterId(b.id)}
                  className={`p-2.5 rounded-xl text-left border text-xs transition-all cursor-pointer flex flex-col justify-between ${
                    selectedButterId === b.id
                      ? "bg-[#EA580C]/20 border-[#EA580C] text-white shadow-md shadow-[#EA580C]/20"
                      : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                  }`}
                >
                  <span className="font-semibold leading-tight">{b.name}</span>
                  <span className="text-[10px] font-mono text-amber-400 font-bold mt-1">
                    {b.price > 0 ? `+${formatIDR(b.price)}` : "Termasuk (Gratis)"}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Pepper & Sear Char */}
          <div className="space-y-1.5 pt-2">
            <label className="text-xs font-mono font-bold text-slate-300 block">
              Karakter Kerak Panggang (Crust Sear):
            </label>
            <div className="space-y-1.5">
              {PEPPER_CRUSTS.map((p) => (
                <label
                  key={p.id}
                  onClick={() => setSelectedPepperId(p.id)}
                  className={`flex items-center gap-2.5 p-2 rounded-xl border text-xs transition-colors cursor-pointer ${
                    selectedPepperId === p.id
                      ? "bg-white/15 border-amber-400/80 text-white"
                      : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                  }`}
                >
                  <input
                    type="radio"
                    name="pepper"
                    checked={selectedPepperId === p.id}
                    onChange={() => setSelectedPepperId(p.id)}
                    className="accent-[#EA580C] w-3.5 h-3.5"
                  />
                  <span>{p.name}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Footer & Confirm Button */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/10">
          <div className="text-xs">
            <span className="text-slate-400">Total Biaya Kustomisasi: </span>
            <strong className="text-amber-400 font-mono text-sm font-bold">
              +{formatIDR(currentButter.price)}
            </strong>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-full border border-white/20 hover:bg-white/10 text-slate-300 text-xs font-semibold cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="flex-1 sm:flex-initial px-6 py-2.5 rounded-full bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-[#EA580C]/25 cursor-pointer active:scale-95 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Terapkan Kematangan &amp; Rasa</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
