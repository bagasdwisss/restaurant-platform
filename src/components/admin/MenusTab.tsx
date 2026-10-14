"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Plus, Search, Edit, Trash2, Coffee, X } from "lucide-react";
import { formatIDR } from "@/lib/utils";

interface MenusTabProps {
  menus: any[];
  categories: any[];
  onCreateMenu: (form: any) => Promise<boolean>;
  onUpdateMenu: (menuId: number, form: any) => Promise<boolean>;
  onDeleteMenu: (menuId: number, menuName: string) => Promise<void>;
  onToggleAvailability: (menuId: number, currentStatus: boolean) => Promise<void>;
}

export function MenusTab({
  menus,
  categories,
  onCreateMenu,
  onUpdateMenu,
  onDeleteMenu,
  onToggleAvailability,
}: MenusTabProps) {
  const [menuSearch, setMenuSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Add modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [menuForm, setMenuForm] = useState({
    categoryId: "",
    name: "",
    description: "",
    price: "",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
    isAvailable: true,
  });

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editMenuForm, setEditMenuForm] = useState<any>(null);

  const handleCreate = async () => {
    const success = await onCreateMenu(menuForm);
    if (success) {
      setShowAddModal(false);
      setMenuForm({
        categoryId: "",
        name: "",
        description: "",
        price: "",
        image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
        isAvailable: true,
      });
    }
  };

  const handleUpdate = async () => {
    if (!editMenuForm) return;
    const success = await onUpdateMenu(editMenuForm.id, editMenuForm);
    if (success) {
      setShowEditModal(false);
      setEditMenuForm(null);
    }
  };

  const filteredMenus = menus.filter((m) => {
    const matchesSearch = m.name.toLowerCase().includes(menuSearch.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || String(m.categoryId) === String(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#18181B]">
            Master Data Menu & Varian
          </h2>
          <p className="text-xs text-[#64748B]">
            Kelola konfigurasi harga, foto produk, ketersediaan, dan kelompok varian hidangan SAVORIA.
          </p>
        </div>

        <button
          onClick={() => {
            if (categories.length > 0 && !menuForm.categoryId) {
              setMenuForm((prev) => ({ ...prev, categoryId: String(categories[0].id) }));
            }
            setShowAddModal(true);
          }}
          className="px-5 py-2.5 bg-[#EA580C] hover:bg-[#C2410C] text-white rounded-full text-xs font-bold flex items-center gap-1.5 shadow-md shadow-[#EA580C]/25 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Menu Baru</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari menu berdasarkan nama..."
            value={menuSearch}
            onChange={(e) => setMenuSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200/80 rounded-full text-xs text-[#18181B] focus:ring-2 focus:ring-[#EA580C] focus:outline-none shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === "all"
                ? "bg-[#14281D] text-white"
                : "bg-white text-[#64748B] hover:text-[#18181B] border border-slate-200"
            }`}
          >
            Semua ({menus.length})
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(String(c.id))}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                String(selectedCategory) === String(c.id)
                  ? "bg-[#14281D] text-white"
                  : "bg-white text-[#64748B] hover:text-[#18181B] border border-slate-200"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[650px]">
            <thead className="bg-[#FDFBF7] border-b border-slate-200/80 text-[#64748B] font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-4">Foto & Nama Menu</th>
                <th className="p-4">Kategori</th>
                <th className="p-4">Harga</th>
                <th className="p-4">Status Stok</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMenus.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[#64748B]">
                    Tidak ada menu yang sesuai dengan filter pencarian.
                  </td>
                </tr>
              ) : (
                filteredMenus.map((menu) => (
                  <tr key={menu.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                          {menu.image ? (
                            <Image
                              src={menu.image}
                              alt={menu.name}
                              fill
                              className="object-cover"
                              sizes="48px"
                              loading="lazy"
                            />
                          ) : (
                            <Coffee className="w-6 h-6 m-auto text-slate-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-serif font-bold text-sm text-[#18181B]">{menu.name}</p>
                          <p className="text-[11px] text-[#64748B] line-clamp-1">
                            {menu.description || "Tidak ada deskripsi"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-[#64748B]">
                      {menu.category?.name || "-"}
                    </td>
                    <td className="p-4 font-mono font-bold text-[#18181B]">
                      {formatIDR(menu.price)}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => onToggleAvailability(menu.id, menu.isAvailable)}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                          menu.isAvailable
                            ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                            : "bg-rose-100 text-rose-800 hover:bg-rose-200"
                        }`}
                      >
                        {menu.isAvailable ? "Tersedia (Ready)" : "Habis (Sold Out)"}
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => {
                          setEditMenuForm({
                            id: menu.id,
                            name: menu.name,
                            categoryId: String(menu.categoryId),
                            description: menu.description || "",
                            price: String(menu.price),
                            image: menu.image || "",
                            isAvailable: menu.isAvailable,
                          });
                          setShowEditModal(true);
                        }}
                        className="p-2 text-[#64748B] hover:text-[#EA580C] hover:bg-orange-50 rounded-full mr-1 cursor-pointer transition-colors"
                        title="Edit Menu"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteMenu(menu.id, menu.name)}
                        className="p-2 text-[#64748B] hover:text-rose-600 hover:bg-rose-50 rounded-full cursor-pointer transition-colors"
                        title="Hapus Menu"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: ADD MENU */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-serif font-bold text-[#18181B] text-base">Tambah Menu Baru</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[#64748B] hover:text-[#18181B] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[#18181B] block mb-1">Kategori</label>
                <select
                  value={menuForm.categoryId}
                  onChange={(e) => setMenuForm({ ...menuForm, categoryId: e.target.value })}
                  className="w-full text-xs p-3 border border-slate-200/80 rounded-2xl bg-white"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#18181B] block mb-1">Nama Menu</label>
                <input
                  type="text"
                  placeholder="Contoh: Wagyu A5 Striploin"
                  value={menuForm.name}
                  onChange={(e) => setMenuForm({ ...menuForm, name: e.target.value })}
                  className="w-full text-xs p-3 border border-slate-200/80 rounded-2xl"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#18181B] block mb-1">Harga (IDR)</label>
                <input
                  type="number"
                  placeholder="450000"
                  value={menuForm.price}
                  onChange={(e) => setMenuForm({ ...menuForm, price: e.target.value })}
                  className="w-full text-xs p-3 border border-slate-200/80 rounded-2xl font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#18181B] block mb-1">URL Foto (Unsplash)</label>
                <input
                  type="text"
                  value={menuForm.image}
                  onChange={(e) => setMenuForm({ ...menuForm, image: e.target.value })}
                  className="w-full text-xs p-3 border border-slate-200/80 rounded-2xl"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#18181B] block mb-1">Deskripsi Singkat</label>
                <textarea
                  rows={2}
                  value={menuForm.description}
                  onChange={(e) => setMenuForm({ ...menuForm, description: e.target.value })}
                  className="w-full text-xs p-3 border border-slate-200/80 rounded-2xl"
                />
              </div>
            </div>

            <button
              onClick={handleCreate}
              className="w-full bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold py-3 rounded-full text-xs transition-all shadow-md shadow-[#EA580C]/25 cursor-pointer"
            >
              Simpan Menu Baru
            </button>
          </div>
        </div>
      )}

      {/* MODAL: EDIT MENU */}
      {showEditModal && editMenuForm && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-serif font-bold text-[#18181B] text-base">Edit Menu</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditMenuForm(null);
                }}
                className="text-[#64748B] hover:text-[#18181B] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[#18181B] block mb-1">Kategori</label>
                <select
                  value={editMenuForm.categoryId}
                  onChange={(e) => setEditMenuForm({ ...editMenuForm, categoryId: e.target.value })}
                  className="w-full text-xs p-3 border border-slate-200/80 rounded-2xl bg-white"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#18181B] block mb-1">Nama Menu</label>
                <input
                  type="text"
                  value={editMenuForm.name}
                  onChange={(e) => setEditMenuForm({ ...editMenuForm, name: e.target.value })}
                  className="w-full text-xs p-3 border border-slate-200/80 rounded-2xl"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#18181B] block mb-1">Harga (IDR)</label>
                <input
                  type="number"
                  value={editMenuForm.price}
                  onChange={(e) => setEditMenuForm({ ...editMenuForm, price: e.target.value })}
                  className="w-full text-xs p-3 border border-slate-200/80 rounded-2xl font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#18181B] block mb-1">URL Foto Menu</label>
                <input
                  type="text"
                  value={editMenuForm.image}
                  onChange={(e) => setEditMenuForm({ ...editMenuForm, image: e.target.value })}
                  className="w-full text-xs p-3 border border-slate-200/80 rounded-2xl"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#18181B] block mb-1">Deskripsi</label>
                <textarea
                  rows={2}
                  value={editMenuForm.description}
                  onChange={(e) => setEditMenuForm({ ...editMenuForm, description: e.target.value })}
                  className="w-full text-xs p-3 border border-slate-200/80 rounded-2xl"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="editMenuAvailable"
                  checked={editMenuForm.isAvailable}
                  onChange={(e) =>
                    setEditMenuForm({ ...editMenuForm, isAvailable: e.target.checked })
                  }
                  className="w-4 h-4 rounded text-[#EA580C]"
                />
                <label htmlFor="editMenuAvailable" className="text-xs font-bold text-[#18181B]">
                  Menu Tersedia (Ready to Order)
                </label>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setShowEditModal(false);
                  setEditMenuForm(null);
                }}
                className="flex-1 py-3 rounded-full border border-slate-200 text-xs font-bold text-[#64748B] hover:bg-slate-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleUpdate}
                className="flex-1 py-3 rounded-full bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-bold cursor-pointer shadow-md shadow-[#EA580C]/25"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
