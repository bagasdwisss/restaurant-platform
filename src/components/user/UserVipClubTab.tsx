"use client";

import React from "react";
import { Award, Gift, Sparkles, RefreshCw } from "lucide-react";

interface ClubRewardItem {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  discountValue: number;
  category: string;
  badge: string;
}

interface UserVipClubTabProps {
  vipTier: {
    level: string;
    name: string;
    discount: string;
    icon: React.ElementType;
  };
  loyaltyPoints: number;
  nextTierInfo: {
    currentTierName: string;
    nextTierName: string;
    pointsNeeded: number;
    progressPct: number;
  };
  clubRewards: ClubRewardItem[];
  onRedeemReward: (reward: ClubRewardItem) => void;
  isRedeemingReward: boolean;
}

export function UserVipClubTab({
  vipTier,
  loyaltyPoints,
  nextTierInfo,
  clubRewards,
  onRedeemReward,
  isRedeemingReward,
}: UserVipClubTabProps) {
  const TierIcon = vipTier.icon;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* VIP Tier Progression Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-7 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold font-mono bg-[#EA580C]/10 text-[#EA580C] border border-[#EA580C]/20 flex items-center gap-1.5">
                <TierIcon className="w-3.5 h-3.5" />
                <span>{vipTier.level}</span>
              </span>
              <span className="text-xs text-slate-400 font-mono">•</span>
              <span className="text-xs font-semibold text-slate-600">{vipTier.name}</span>
            </div>
            <h3 className="font-serif font-bold text-2xl text-[#18181B] tracking-tight">
              Savoria Club VIP Membership
            </h3>
            <p className="text-xs text-[#64748B]">
              Kumpulkan 1 Poin setiap pembelanjaan Rp 1.000. Tukarkan poin Anda dengan voucher diskon langsung dan hidangan karya chef.
            </p>
          </div>

          <div className="bg-[#FDFBF7] border border-amber-200/80 p-4 rounded-2xl sm:text-right shrink-0">
            <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block font-semibold">
              Saldo Poin Aktif
            </span>
            <div className="flex items-baseline sm:justify-end gap-1.5 mt-0.5">
              <span className="font-serif text-3xl font-black text-[#EA580C]">
                {loyaltyPoints}
              </span>
              <span className="text-xs font-mono font-bold text-slate-600">Pts</span>
            </div>
            <span className="text-[11px] text-emerald-700 font-semibold block mt-0.5">
              {vipTier.discount}
            </span>
          </div>
        </div>

        {/* Tier Progress Bar */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#18181B] flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Progress Tingkat: {nextTierInfo.currentTierName}</span>
            </span>
            <span className="text-slate-500 font-mono text-[11px]">
              {nextTierInfo.pointsNeeded > 0
                ? `${nextTierInfo.pointsNeeded} Poin menuju ${nextTierInfo.nextTierName}`
                : "Tingkat VIP Tertinggi"}
            </span>
          </div>
          <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden relative">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 via-[#EA580C] to-amber-600 transition-all duration-700"
              style={{ width: `${nextTierInfo.progressPct}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-mono text-slate-400">
            <span>Bronze (0 Pts)</span>
            <span>Silver (500 Pts)</span>
            <span>Gold (1.500 Pts)</span>
            <span>Platinum VIP (3.500 Pts)</span>
          </div>
        </div>
      </div>

      {/* Savoria Club Rewards Store (Tukar Poin) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-serif font-bold text-xl text-[#18181B] flex items-center gap-2">
              <Gift className="w-5 h-5 text-[#EA580C]" />
              <span>Tukar Poin Hadiah (Rewards Store)</span>
            </h4>
            <p className="text-xs text-[#64748B] mt-0.5">
              Pilih reward yang diinginkan dan gunakan kode voucher yang didapat saat reservasi atau di kasir.
            </p>
          </div>
          <span className="hidden sm:inline-block text-xs font-mono font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
            Poin Anda: <strong className="text-[#EA580C]">{loyaltyPoints} Pts</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clubRewards.map((rew) => {
            if (!rew) return null;
            const canRedeem = loyaltyPoints >= (rew.pointsCost || 0);

            return (
              <div
                key={rew?.id || Math.random()}
                className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm flex flex-col justify-between space-y-4 hover:border-amber-300 transition-all relative overflow-hidden group"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200">
                      {rew?.category || "Hadiah"}
                    </span>
                    {rew?.badge && (
                      <span className="text-[10px] font-semibold text-[#EA580C] bg-[#EA580C]/10 px-2 py-0.5 rounded-full font-mono">
                        {rew.badge}
                      </span>
                    )}
                  </div>

                  <div>
                    <h5 className="font-serif font-bold text-base text-[#18181B] group-hover:text-[#EA580C] transition-colors">
                      {rew?.title || "Hadiah Eksklusif"}
                    </h5>
                    <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                      {rew?.description || ""}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-mono">Biaya Tukar:</span>
                    <span className="font-serif text-lg font-black text-[#EA580C]">
                      {rew?.pointsCost || 0} <span className="text-xs font-sans font-normal text-slate-500">Pts</span>
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onRedeemReward(rew)}
                    disabled={!canRedeem || isRedeemingReward}
                    className={`w-full py-2.5 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                      canRedeem
                        ? "bg-[#EA580C] hover:bg-[#C2410C] text-white shadow-md shadow-[#EA580C]/20"
                        : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                    }`}
                  >
                    {isRedeemingReward ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Memproses...</span>
                      </>
                    ) : canRedeem ? (
                      <>
                        <Gift className="w-3.5 h-3.5" />
                        <span>Tukar {rew.pointsCost} Pts</span>
                      </>
                    ) : (
                      <span>Poin Belum Cukup ({rew.pointsCost - loyaltyPoints} lagi)</span>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Permanent VIP Member Privileges */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <div>
          <h4 className="font-serif font-bold text-lg text-[#18181B] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Keuntungan Eksklusif Status Member VIP Anda</span>
          </h4>
          <p className="text-xs text-[#64748B] mt-0.5">
            Hak istimewa otomatis yang aktif di akun Anda pada setiap reservasi dan kunjungan ke SAVORIA.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-amber-100 text-amber-900">
                DISCOUNT VOUCHER
              </span>
              <span className="font-mono text-xs font-bold text-[#EA580C]">10% OFF</span>
            </div>
            <div>
              <h5 className="font-serif font-bold text-base text-[#18181B]">
                Diskon Jamuan Malam VIP
              </h5>
              <p className="text-xs text-[#64748B] mt-0.5">
                Potongan 10% untuk pemesanan set menu signature dinner di sesi mana pun.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Kode: SAVORIA-VIP10</span>
              <span className="text-emerald-700 font-bold">Aktif & Berlaku</span>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-purple-100 text-purple-900">
                COMPLIMENTARY
              </span>
              <span className="font-mono text-xs font-bold text-purple-700">GRATIS</span>
            </div>
            <div>
              <h5 className="font-serif font-bold text-base text-[#18181B]">
                Signature Petit Fours on Birthday
              </h5>
              <p className="text-xs text-[#64748B] mt-0.5">
                Nikmati sajian dessert istimewa kreasi chef koki saat Anda merayakan hari ulang tahun di SAVORIA.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Otomatis Tersemat</span>
              <span className="text-emerald-700 font-bold">Aktif & Berlaku</span>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-blue-100 text-blue-900">
                SEATING GUARANTEE
              </span>
              <span className="font-mono text-xs font-bold text-blue-700">PRIORITY</span>
            </div>
            <div>
              <h5 className="font-serif font-bold text-base text-[#18181B]">
                Jaminan Meja Utama Grand Salle
              </h5>
              <p className="text-xs text-[#64748B] mt-0.5">
                Prioritas alokasi meja dengan pemandangan terbaik saat melakukan booking reservasi.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Status Akun VIP</span>
              <span className="text-emerald-700 font-bold">Aktif Permanen</span>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-100 text-emerald-900">
                SALON PRIVÉ
              </span>
              <span className="font-mono text-xs font-bold text-emerald-700">EXCLUSIVE</span>
            </div>
            <div>
              <h5 className="font-serif font-bold text-base text-[#18181B]">
                Akses Mezzanine VIP Suite
              </h5>
              <p className="text-xs text-[#64748B] mt-0.5">
                Hak akses eksklusif untuk memesan meja lantai 2 Mezzanine privat untuk jamuan keluarga atau pertemuan bisnis.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Patron Privilege</span>
              <span className="text-emerald-700 font-bold">Aktif Permanen</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
