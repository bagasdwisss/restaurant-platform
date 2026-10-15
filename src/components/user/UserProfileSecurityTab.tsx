"use client";

import React, { useState } from "react";
import { User, Mail, Phone, Lock, KeyRound, CheckCircle2 } from "lucide-react";

interface UserProfileSecurityTabProps {
  user: any;
  onUpdateProfile: (formData: {
    name: string;
    phone: string;
    oldPassword?: string;
    newPassword?: string;
  }) => Promise<boolean>;
  isUpdatingProfile: boolean;
}

export function UserProfileSecurityTab({
  user,
  onUpdateProfile,
  isUpdatingProfile,
}: UserProfileSecurityTabProps) {
  const [profileName, setProfileName] = useState(user?.name || "");
  const [profilePhone, setProfilePhone] = useState(user?.phone || "");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [validationError, setValidationError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    if (!profileName.trim()) {
      setValidationError("Nama lengkap wajib diisi.");
      return;
    }

    if (newPassword) {
      if (newPassword.length < 6) {
        setValidationError("Kata sandi baru minimal 6 karakter.");
        return;
      }
      if (newPassword !== confirmPassword) {
        setValidationError("Konfirmasi kata sandi baru tidak cocok.");
        return;
      }
      if (!oldPassword) {
        setValidationError("Masukkan kata sandi lama untuk konfirmasi pergantian sandi.");
        return;
      }
    }

    const success = await onUpdateProfile({
      name: profileName,
      phone: profilePhone,
      oldPassword: oldPassword || undefined,
      newPassword: newPassword || undefined,
    });

    if (success) {
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-8 shadow-sm max-w-2xl">
      <div className="border-b border-slate-100 pb-4 mb-6">
        <h3 className="font-serif font-bold text-xl text-[#18181B]">
          Pengaturan Profil & Keamanan Akun
        </h3>
        <p className="text-xs text-[#64748B] mt-1">
          Perbarui nama lengkap, nomor kontak, serta kata sandi akun Anda.
        </p>
      </div>

      {validationError && (
        <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
          {validationError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Account Identity */}
        <div className="space-y-4">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono block">
            Informasi Utama Pelanggan
          </span>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#18181B] flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#EA580C]" />
              <span>Nama Lengkap</span>
            </label>
            <input
              type="text"
              required
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              className="w-full text-xs p-3 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#EA580C] focus:outline-none"
              placeholder="Nama Lengkap Anda"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#18181B] flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>Alamat Email (Akun)</span>
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ""}
                className="w-full text-xs p-3 bg-slate-100 text-slate-500 border border-slate-200 rounded-2xl cursor-not-allowed font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#18181B] flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#EA580C]" />
                <span>Nomor Handphone / WA</span>
              </label>
              <input
                type="tel"
                value={profilePhone}
                onChange={(e) => setProfilePhone(e.target.value)}
                className="w-full text-xs p-3 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#EA580C] focus:outline-none font-mono"
                placeholder="0812xxxxxxxx"
              />
            </div>
          </div>
        </div>

        {/* Security & Password */}
        <div className="pt-4 border-t border-slate-100 space-y-4">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono block">
            Ubah Kata Sandi (Kosongkan jika tidak ingin mengubah)
          </span>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#18181B] flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Kata Sandi Lama</span>
            </label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full text-xs p-3 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#EA580C] focus:outline-none"
              placeholder="Masukkan kata sandi lama Anda"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#18181B] flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                <span>Kata Sandi Baru</span>
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full text-xs p-3 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#EA580C] focus:outline-none"
                placeholder="Minimal 6 karakter"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#18181B] flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                <span>Ulangi Kata Sandi Baru</span>
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full text-xs p-3 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#EA580C] focus:outline-none"
                placeholder="Konfirmasi password baru"
              />
            </div>
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={isUpdatingProfile}
            className="px-6 py-3 bg-[#EA580C] hover:bg-[#C2410C] text-white rounded-full text-xs font-bold flex items-center gap-2 shadow-md shadow-[#EA580C]/25 transition-all cursor-pointer disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isUpdatingProfile ? "Menyimpan Perubahan..." : "Simpan Perubahan Profil"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
