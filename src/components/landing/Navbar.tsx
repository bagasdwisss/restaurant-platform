"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShoppingBag, ChevronRight, LogIn, LogOut, ArrowRight, Menu as MenuIcon } from "lucide-react";

interface NavbarProps {
  mounted: boolean;
  user: any;
  logout: () => void;
  cartCount: number;
}

export function Navbar({ mounted, user, logout, cartCount }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#FDFBF7]/90 backdrop-blur-md border-b border-[#E2E8F0]/70 px-3.5 sm:px-6 lg:px-12 py-3.5 sm:py-4 transition-all">
      <div className="max-w-[1280px] mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-full bg-[#EA580C] text-white flex items-center justify-center font-display font-black text-xl shadow-cta group-hover:scale-105 transition-transform">
            S
          </div>
          <div>
            <span className="font-display text-2xl font-black tracking-tight text-[#18181B]">
              SAVOR<span className="text-[#EA580C]">IA</span>
            </span>
            <span className="hidden sm:inline-block ml-2 text-[10px] font-bold text-[#64748B] uppercase tracking-widest font-mono">
              HAUTE RESTAURANT
            </span>
          </div>
        </Link>

        {/* Center Navigation Links with Active Dot */}
        <nav className="hidden lg:flex items-center gap-8 text-[14px] font-semibold text-[#18181B]">
          <a href="#" className="text-[#EA580C] flex flex-col items-center">
            <span>Home</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#EA580C] mt-0.5" />
          </a>
          <a href="#popular" className="hover:text-[#EA580C] transition-colors">
            Chef&apos;s Special
          </a>
          <a href="#menu" className="hover:text-[#EA580C] transition-colors">
            Menu
          </a>
          <a href="#about" className="hover:text-[#EA580C] transition-colors">
            About Us
          </a>
          <a href="#reviews" className="hover:text-[#EA580C] transition-colors">
            Reviews
          </a>
        </nav>

        {/* Right Action Group */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile Instant Booking Button */}
          <Link
            href="/reservation"
            className="sm:hidden px-3 py-1.5 rounded-full bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold text-xs shadow-xs flex items-center gap-1"
          >
            <span>Booking</span>
          </Link>

          {/* Cart Icon with Badge */}
          <Link
            href="/reservation"
            className="relative p-2.5 rounded-full bg-white hover:bg-[#F3EFE6] text-[#18181B] border border-[#E2E8F0] transition-colors shadow-sm cursor-pointer"
            title="Cart Items"
          >
            <ShoppingBag className="w-4 h-4 text-[#18181B]" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#EA580C] text-white text-[10px] font-bold flex items-center justify-center shadow-md">
                {cartCount}
              </span>
            )}
          </Link>

          {/* User Session or Login */}
          {mounted && user ? (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                href={user.role === "admin" ? "/admin" : user.role === "kasir" ? "/pos" : "/user"}
                className="px-3.5 py-2 rounded-full bg-[#14281D] hover:bg-[#0f1f16] text-white font-semibold text-xs shadow-md transition-all flex items-center gap-1.5"
              >
                <span>Dashboard</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
              <button
                onClick={logout}
                title="Keluar"
                className="p-2 rounded-full bg-white hover:bg-rose-50 text-[#64748B] hover:text-rose-600 border border-[#E2E8F0] transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                href="/login"
                className="px-3.5 py-2 rounded-full border border-[#18181B]/20 hover:border-[#18181B] text-[#18181B] font-semibold text-xs bg-white transition-all shadow-sm flex items-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5 text-[#EA580C]" />
                <span>Unique Key</span>
              </Link>
            </div>
          )}

          {/* Always Visible Primary CTA: Booking Reservasi */}
          <Link
            href="/reservation"
            className="hidden sm:flex px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold text-xs shadow-cta transition-all items-center gap-1.5"
          >
            <span>Booking Reservasi</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          {/* Mobile Hamburger Trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-full bg-white border border-[#E2E8F0] text-[#18181B]"
          >
            <MenuIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-3 pt-3 border-t border-[#E2E8F0] space-y-2 pb-2">
          <a
            href="#popular"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-[#18181B] hover:bg-[#F3EFE6]"
          >
            Chef&apos;s Special
          </a>
          <a
            href="#menu"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-[#18181B] hover:bg-[#F3EFE6]"
          >
            Menu
          </a>
          <a
            href="#about"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-[#18181B] hover:bg-[#F3EFE6]"
          >
            About Us
          </a>
          <a
            href="#reviews"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-[#18181B] hover:bg-[#F3EFE6]"
          >
            Reviews
          </a>
          <div className="pt-2 border-t border-[#E2E8F0]">
            {mounted && user ? (
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <Link
                    href={user.role === "admin" ? "/admin" : user.role === "kasir" ? "/pos" : "/user"}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 text-center py-2 text-xs font-semibold rounded-full bg-[#14281D] text-white"
                  >
                    Dashboard ({user.name})
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="px-4 py-2 text-xs font-semibold rounded-full border border-rose-200 text-rose-600 hover:bg-rose-50"
                  >
                    Keluar
                  </button>
                </div>
                <Link
                  href="/reservation"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 text-xs font-bold rounded-full bg-[#EA580C] text-white"
                >
                  Booking Reservasi
                </Link>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 text-xs font-semibold rounded-full border border-[#18181B]/20 text-[#18181B]"
                >
                  Unique Key Login
                </Link>
                <Link
                  href="/reservation"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 text-xs font-bold rounded-full bg-[#EA580C] text-white"
                >
                  Booking Reservasi
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
