"use client";

import React, { useState, useMemo } from "react";
import { Sparkles, Plus, X, Info, Send, CheckCircle2 } from "lucide-react";

interface SystemUpdatesSubTabProps {
  systemUpdates?: any[];
  onRefresh?: () => void;
}

export function SystemUpdatesSubTab({
  systemUpdates = [],
  onRefresh,
}: SystemUpdatesSubTabProps) {
  const [versionFilter, setVersionFilter] = useState<string>("ALL");
  const [showAddUpdateModal, setShowAddUpdateModal] = useState(false);
  const [updateTitle, setUpdateTitle] = useState("");
  const [updateFeaturesText, setUpdateFeaturesText] = useState("");
  const [updateBadge, setUpdateBadge] = useState("Rilis Terkini");
  const [isSubmittingUpdate, setIsSubmittingUpdate] = useState(false);
  const [updateMsg, setUpdateMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const parsedFeatures = useMemo(() => {
    return updateFeaturesText
      .split("\n")
      .map((line) => line.replace(/^[-*•\d.]+\s*/, "").trim())
      .filter(Boolean);
  }, [updateFeaturesText]);

  const featureCount = parsedFeatures.length;

  const calculatedNextVersion = useMemo(() => {
    const latest = systemUpdates[0]?.version || "v2.5.0";
    const match = latest.match(/(\d+)\.(\d+)\.(\d+)/);
    let major = 2;
    let minor = 5;
    let patch = 0;
    if (match) {
      major = parseInt(match[1], 10);
      minor = parseInt(match[2], 10);
      patch = parseInt(match[3], 10);
    }
    if (featureCount >= 15) {
      major += 1;
      minor = 0;
      patch = 0;
    } else if (featureCount >= 5) {
      minor += 1;
      patch = 0;
    } else {
      patch += 1;
    }
    return `v${major}.${minor}.${patch}`;
  }, [systemUpdates, featureCount]);

  const handleCreateUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateTitle.trim() || parsedFeatures.length === 0) {
      setUpdateMsg({ type: "error", text: "Mohon isi judul dan minimal 1 fitur pembaruan." });
      return;
    }

    setIsSubmittingUpdate(true);
    setUpdateMsg(null);
    try {
      const res = await fetch("/api/v1/admin/reports/shifts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: updateTitle.trim(),
          features: parsedFeatures,
          badge: updateBadge.trim() || "Rilis Terkini",
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || "Gagal mencatat rilis.");
      }

      setUpdateMsg({ type: "success", text: `Versi ${data.data.version} berhasil dirilis!` });
      setUpdateTitle("");
      setUpdateFeaturesText("");
      setTimeout(() => {
        setShowAddUpdateModal(false);
        setUpdateMsg(null);
        if (onRefresh) onRefresh();
      }, 1000);
    } catch (err: any) {
      setUpdateMsg({ type: "error", text: err.message || "Terjadi kesalahan." });
    } finally {
      setIsSubmittingUpdate(false);
    }
  };

  const filteredSystemUpdates = useMemo(() => {
    if (versionFilter === "ALL") return systemUpdates;
    return systemUpdates.filter((u) => u.version === versionFilter);
  }, [systemUpdates, versionFilter]);

  return (
    <div className="space-y-6">
      {/* Header & Filter & Action */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-serif font-bold text-base text-[#18181B] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            Catatan Rilis & Pembaruan Fitur Sistem
          </h3>
          <p className="text-xs text-[#64748B] mt-0.5">
            Riwayat versi software Savoria Haute Cuisine dan daftar pembaruan setiap rilis.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          <button
            onClick={() => setShowAddUpdateModal(!showAddUpdateModal)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Catat Rilis Versi Baru
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Filter:</span>
            <select
              value={versionFilter}
              onChange={(e) => setVersionFilter(e.target.value)}
              className="text-xs border border-slate-200 rounded-xl px-2.5 py-1.5 bg-white text-[#18181B] focus:outline-none focus:ring-2 focus:ring-emerald-900/20"
            >
              <option value="ALL">Semua Versi</option>
              {systemUpdates.map((u) => (
                <option key={u.version} value={u.version}>
                  {u.version} ({u.status})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Form Modal: Catat Rilis Baru */}
      {showAddUpdateModal && (
        <div className="bg-gradient-to-br from-emerald-50/70 via-white to-slate-50 border-2 border-emerald-300 rounded-2xl p-5 shadow-md space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-emerald-100">
            <div>
              <h4 className="font-serif font-bold text-sm sm:text-base text-emerald-950 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                Form Catat Pembaruan Sistem (Auto-Versioning)
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Versi sistem akan dikalkulasi secara otomatis dari jumlah fitur baru yang ditambahkan.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddUpdateModal(false)}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {updateMsg && (
            <div
              className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
                updateMsg.type === "success"
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                  : "bg-rose-100 text-rose-800 border border-rose-200"
              }`}
            >
              <Info className="w-4 h-4 shrink-0" />
              {updateMsg.text}
            </div>
          )}

          <form onSubmit={handleCreateUpdate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2 space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  Judul / Ringkasan Rilis <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Modul Voucher Diskon Promo & Fix Shift Kasir"
                  value={updateTitle}
                  onChange={(e) => setUpdateTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Badge Status</label>
                <input
                  type="text"
                  placeholder="Contoh: Rilis Terkini / Major Update"
                  value={updateBadge}
                  onChange={(e) => setUpdateBadge(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>
                  Daftar Fitur / Perubahan <span className="text-rose-500">*</span> (1 per baris)
                </span>
                <span className="text-emerald-700 font-mono font-bold">
                  {featureCount} Fitur Terdeteksi
                </span>
              </label>
              <textarea
                rows={4}
                required
                placeholder="Ketik setiap fitur baru di baris baru, misalnya:&#10;Fitur Voucher Kuota 10 Pengguna di Admin&#10;Input Reedem Voucher di Pembayaran Tamu&#10;Fix Endpoint Shift Kasir Start 404"
                value={updateFeaturesText}
                onChange={(e) => setUpdateFeaturesText(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono leading-relaxed"
              />
            </div>

            {/* Auto Semantic Versioning Preview Box */}
            <div className="p-3.5 bg-emerald-50/90 rounded-xl border border-emerald-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900">
                  Kalkulasi Versi Otomatis:
                </span>
                <span className="px-2.5 py-0.5 rounded-lg text-xs font-mono font-black bg-emerald-600 text-white shadow-sm">
                  {calculatedNextVersion}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-600 pt-1 border-t border-emerald-200/60">
                <div className={featureCount < 5 ? "font-bold text-emerald-800" : "opacity-60"}>
                  • &lt; 5 Fitur: Patch bump (cth: 2.5.0 &rarr; 2.5.1)
                </div>
                <div
                  className={
                    featureCount >= 5 && featureCount < 15
                      ? "font-bold text-emerald-800"
                      : "opacity-60"
                  }
                >
                  • 5 - 14 Fitur: Minor bump (cth: 2.5.0 &rarr; 2.6.0)
                </div>
                <div className={featureCount >= 15 ? "font-bold text-emerald-800" : "opacity-60"}>
                  • &ge; 15 Fitur: Major bump (cth: 2.5.0 &rarr; 3.0.0)
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddUpdateModal(false)}
                className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-xl font-medium"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmittingUpdate}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow transition-all disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                {isSubmittingUpdate ? "Menyimpan ke Cloud..." : `Rilis ${calculatedNextVersion}`}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Version Cards Timeline */}
      <div className="space-y-4">
        {filteredSystemUpdates.map((release) => {
          if (!release) return null;
          const isLatest = release.status === "latest";
          return (
            <div
              key={release.version || Math.random()}
              className={`bg-white rounded-2xl border p-5 shadow-sm transition-all space-y-3 ${
                isLatest
                  ? "border-emerald-300 ring-2 ring-emerald-100"
                  : "border-slate-200/80"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-mono text-base font-bold text-[#18181B]">
                    {release.version}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono ${
                      isLatest
                        ? "bg-emerald-100 text-emerald-800"
                        : release.status === "stable"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {release.badge || release.status}
                  </span>
                  <span className="text-slate-300 hidden sm:inline">•</span>
                  <span className="text-xs text-slate-500 font-medium">
                    Tanggal Rilis: {release.releaseDate}
                  </span>
                </div>
              </div>

              <h4 className="font-serif font-bold text-sm sm:text-base text-slate-900">
                {release.title}
              </h4>

              {/* Feature Checklist */}
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Pembaruan & Fitur Baru:
                </span>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  {release.features?.map((feat: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="leading-tight">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
