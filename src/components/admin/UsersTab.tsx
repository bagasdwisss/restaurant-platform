"use client";

import React, { useState } from "react";
import { Users, Plus, Trash2, KeyRound, ShieldCheck, X, Sparkles, RefreshCw } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Modal } from "@/components/ui/Modal";

interface UsersTabProps {
  usersList: any[];
  loadingUsers: boolean;
  currentUser: any;
  onCreateUser: (form: any) => Promise<boolean>;
  onDeleteUser: (userId: number, userName: string) => Promise<void>;
}

export function UsersTab({
  usersList,
  loadingUsers,
  currentUser,
  onCreateUser,
  onDeleteUser,
}: UsersTabProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [userForm, setUserForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    role: "kasir",
    phone: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const success = await onCreateUser(userForm);
    setSubmitting(false);
    if (success) {
      setShowAddModal(false);
      setUserForm({
        name: "",
        username: "",
        email: "",
        password: "",
        role: "kasir",
        phone: "",
      });
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-2xl font-bold text-[#18181B]">
              Manajemen Pengguna & Otorisasi Akses
            </h2>
            <span className="text-[10px] font-mono uppercase bg-[#14281D]/10 text-[#14281D] px-2 py-0.5 rounded-full font-bold">
              RBAC Key System
            </span>
          </div>
          <p className="text-xs text-[#64748B] mt-0.5">
            Setiap peran (<strong className="text-[#18181B]">Pembeli</strong>, <strong className="text-[#18181B]">Kasir</strong>, <strong className="text-[#18181B]">Admin</strong>) berfungsi sebagai kunci otorisasi akses (Unique Access Key) ke modul sistem.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-[#EA580C] hover:bg-[#C2410C] text-white rounded-full text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-[#EA580C]/25 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Akun Baru</span>
        </button>
      </div>

      {/* Role explanation summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#14281D] text-white font-bold">
              ADMIN
            </span>
            <span className="text-xs font-bold text-[#18181B]">Administrator</span>
          </div>
          <p className="text-[11px] text-[#64748B]">
            Otorisasi penuh back-office: kelola menu, harga, meja, inventaris, laporan keuangan & pengguna.
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#EA580C] text-white font-bold">
              KASIR
            </span>
            <span className="text-xs font-bold text-[#18181B]">Staff Kasir (POS)</span>
          </div>
          <p className="text-[11px] text-[#64748B]">
            Otorisasi operasional: buka/tutup kasir (shift), terima pesanan meja, cetak struk, dan proses pembayaran.
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-600 text-white font-bold">
              PEMBELI
            </span>
            <span className="text-xs font-bold text-[#18181B]">Pelanggan VIP</span>
          </div>
          <p className="text-[11px] text-[#64748B]">
            Otorisasi tamu kehormatan: booking meja reservasi, pantau antrean masak dapur, dan struk digital QR.
          </p>
        </div>
      </div>

      {/* Users List Container */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Mobile View: Cards */}
        <div className="block md:hidden divide-y divide-slate-100 p-3 space-y-3">
          {loadingUsers ? (
            <div className="py-8 text-center text-xs text-[#64748B]">Memuat daftar pengguna...</div>
          ) : usersList.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#64748B]">Belum ada data pengguna.</div>
          ) : (
            usersList.map((u) => {
              const isCurrent = currentUser?.id === u.id;
              const roleBadge =
                u.role === "admin"
                  ? "bg-[#14281D] text-white"
                  : u.role === "kasir"
                  ? "bg-[#EA580C] text-white"
                  : "bg-emerald-100 text-emerald-800 border border-emerald-300";

              const roleLabel =
                u.role === "admin"
                  ? "ADMIN"
                  : u.role === "kasir"
                  ? "KASIR"
                  : "PEMBELI";

              return (
                <div key={u.id} className="p-3 bg-[#FDFBF7] rounded-2xl border border-slate-200/80 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-200 text-[#18181B] font-bold flex items-center justify-center font-mono text-xs">
                        {u.name?.charAt(0) || "U"}
                      </div>
                      <div>
                        <span className="font-bold text-[#18181B] block">{u.name}</span>
                        {isCurrent && (
                          <span className="text-[10px] text-emerald-700 font-semibold font-mono">
                            (Akun Anda Saat Ini)
                          </span>
                        )}
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono tracking-wider ${roleBadge}`}>
                      {roleLabel}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-200/60 font-mono">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Username & Email</span>
                      <span className="text-slate-800 font-semibold">@{u.username}</span>
                      <span className="text-slate-500 block truncate">{u.email}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Kontak HP</span>
                      <span className="text-slate-700">{u.phone || "-"}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[10px] text-slate-400">
                    <span>Terdaftar: {formatDate(u.createdAt)}</span>
                    {!isCurrent && (
                      <button
                        onClick={() => onDeleteUser(u.id, u.name)}
                        className="px-2 py-1 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Hapus</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop View: Full Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[650px]">
            <thead className="bg-[#FDFBF7] border-b border-slate-200/80 text-[#64748B] font-mono uppercase text-[10px]">
              <tr>
                <th className="py-3.5 px-4 font-bold">Profil Pengguna</th>
                <th className="py-3.5 px-4 font-bold">Username & Email</th>
                <th className="py-3.5 px-4 font-bold">Wewenang Peran (Unique Key)</th>
                <th className="py-3.5 px-4 font-bold">Kontak HP</th>
                <th className="py-3.5 px-4 font-bold">Terdaftar Sejak</th>
                <th className="py-3.5 px-4 font-bold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loadingUsers ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#64748B]">
                    Memuat daftar pengguna...
                  </td>
                </tr>
              ) : usersList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#64748B]">
                    Belum ada data pengguna.
                  </td>
                </tr>
              ) : (
                usersList.map((u) => {
                  const isCurrent = currentUser?.id === u.id;
                  const roleBadge =
                    u.role === "admin"
                      ? "bg-[#14281D] text-white"
                      : u.role === "kasir"
                      ? "bg-[#EA580C] text-white"
                      : "bg-emerald-100 text-emerald-800 border border-emerald-300";

                  const roleLabel =
                    u.role === "admin"
                      ? "ADMIN (Full Access)"
                      : u.role === "kasir"
                      ? "KASIR (POS Access)"
                      : "PEMBELI (VIP Patron)";

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-100 text-[#18181B] font-bold flex items-center justify-center font-mono text-xs">
                            {u.name?.charAt(0) || "U"}
                          </div>
                          <div>
                            <span className="font-bold text-[#18181B] block">{u.name}</span>
                            {isCurrent && (
                              <span className="text-[10px] text-emerald-700 font-semibold font-mono">
                                (Akun Anda Saat Ini)
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono">
                        <div className="text-[#18181B] font-semibold">@{u.username}</div>
                        <div className="text-[11px] text-[#64748B]">{u.email}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-mono tracking-wider ${roleBadge}`}>
                          {roleLabel}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[#64748B]">
                        {u.phone || "-"}
                      </td>
                      <td className="py-3.5 px-4 text-[#64748B] text-[11px]">
                        {formatDate(u.createdAt)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {!isCurrent && (
                          <button
                            onClick={() => onDeleteUser(u.id, u.name)}
                            className="p-1.5 rounded-full hover:bg-rose-50 text-rose-500 hover:text-rose-700 transition-colors cursor-pointer"
                            title="Hapus Pengguna"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: ADD USER / STAFF */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)}>
        <div className="bg-white w-full max-w-md rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto my-auto">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-serif font-bold text-[#18181B] text-base">
                Tambah Akun Baru
              </h3>
              <p className="text-[11px] text-[#64748B]">
                Pilih peran sebagai kunci otorisasi akses sistem
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(false)}
              className="text-[#64748B] hover:text-[#18181B] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-xs font-bold text-[#18181B] block mb-1">
                Pilihan Peran (Role as Unique Key)
              </label>
              <select
                value={userForm.role}
                onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                className="w-full text-xs p-3 border border-slate-200/80 rounded-2xl bg-white font-semibold"
              >
                <option value="user">Pembeli (Pelanggan / VIP Patron Reservasi)</option>
                <option value="kasir">Kasir (Staff POS & Pembayaran Meja)</option>
                <option value="admin">Admin (Executive Back-Office & Manajemen)</option>
              </select>
              <p className="text-[10px] text-[#64748B] mt-1 font-mono">
                *Email apapun yang didaftarkan akan memperoleh hak akses sesuai peran yang dipilih.
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-[#18181B] block mb-1">Nama Lengkap</label>
              <input
                type="text"
                required
                placeholder="Contoh: Rina Melati"
                value={userForm.name}
                onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                className="w-full text-xs p-3 border border-slate-200/80 rounded-2xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-bold text-[#18181B] block mb-1">Username</label>
                <input
                  type="text"
                  required
                  placeholder="rina_kasir"
                  value={userForm.username}
                  onChange={(e) =>
                    setUserForm({
                      ...userForm,
                      username: e.target.value.toLowerCase().replace(/\s+/g, ""),
                    })
                  }
                  className="w-full text-xs p-3 border border-slate-200/80 rounded-2xl font-mono"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#18181B] block mb-1">Nomor WhatsApp / HP</label>
                <input
                  type="text"
                  placeholder="08123456789"
                  value={userForm.phone}
                  onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                  className="w-full text-xs p-3 border border-slate-200/80 rounded-2xl font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#18181B] block mb-1">Alamat Email</label>
              <input
                type="email"
                required
                placeholder="rina@savoria.com"
                value={userForm.email}
                onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                className="w-full text-xs p-3 border border-slate-200/80 rounded-2xl"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#18181B] block mb-1">Kata Sandi (Password)</label>
              <input
                type="password"
                required
                placeholder="Minimal 6 karakter"
                value={userForm.password}
                onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                className="w-full text-xs p-3 border border-slate-200/80 rounded-2xl"
              />
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-3 rounded-full border border-slate-200 text-xs font-bold text-[#64748B] hover:bg-slate-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-3 rounded-full bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-bold cursor-pointer shadow-md shadow-[#EA580C]/25 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <span>Simpan Akun</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
