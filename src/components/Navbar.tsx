'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSearchParams, usePathname } from 'next/navigation';
import { useAuth } from '../lib/context/AuthContext';
import { useCart } from '../lib/context/CartContext';
import {
  ShoppingBag,
  User,
  ShieldAlert,
  LogOut,
  Package,
  Layers,
  Menu,
  X,
  Sparkles,
  Search,
  ExternalLink,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, profile, isAdmin, isConfigured, signOut, demoSignIn } = useAuth();
  const { totalItems } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentType = searchParams.get('type');
  const isCatalogHome = pathname === '/';

  return (
    <>
      {/* Top Demo Bar if Supabase not configured */}
      {!isConfigured && (
        <div className="bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-indigo-500/10 border-b border-amber-500/20 px-4 py-2 text-xs text-amber-200">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-semibold text-emerald-300">Mode Interaktif Aktif:</span>
              <span className="text-slate-300">
                Aplikasi berjalan dalam mode demo dengan Supabase fallback. Anda dapat beralih peran untuk mencoba seluruh fitur:
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => demoSignIn('customer')}
                className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                  user && !isAdmin
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                👤 Masuk Pembeli (Budi)
              </button>
              <button
                onClick={() => demoSignIn('admin')}
                className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                  isAdmin
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                🛡️ Masuk Admin Toko
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl transition-all">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link href="/" className="group flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 font-black shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <Layers className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xl font-black tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                  NEXU<span className="text-emerald-400">STORE</span>
                </span>
                <span className="block text-[10px] font-medium tracking-wider text-slate-400 uppercase">
                  Digital & Physical Catalog
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links with Active State Highlighting */}
            <nav className="hidden md:flex items-center gap-1.5 text-sm font-medium">
              <Link
                href="/"
                className={`rounded-xl px-3 py-2 transition ${
                  isCatalogHome && !currentType
                    ? 'bg-slate-800 text-white font-semibold shadow-inner'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                Etalase
              </Link>
              <Link
                href="/?type=digital"
                className={`flex items-center gap-1.5 rounded-xl px-3 py-2 transition ${
                  isCatalogHome && currentType === 'digital'
                    ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40 shadow-sm shadow-emerald-500/10'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <Sparkles className="h-4 w-4 text-emerald-400" />
                Produk Digital
              </Link>
              <Link
                href="/?type=physical"
                className={`flex items-center gap-1.5 rounded-xl px-3 py-2 transition ${
                  isCatalogHome && currentType === 'physical'
                    ? 'bg-teal-500/20 text-teal-300 font-bold border border-teal-500/40 shadow-sm shadow-teal-500/10'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <Package className="h-4 w-4 text-teal-400" />
                Produk Fisik
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  className="flex items-center gap-1 rounded-xl bg-indigo-500/10 px-3 py-2 text-indigo-400 hover:bg-indigo-500/20 transition font-semibold"
                >
                  <ShieldAlert className="h-4 w-4" />
                  Admin Panel
                </Link>
              )}
            </nav>
          </div>

          {/* Right Action Icons & Auth */}
          <div className="flex items-center gap-3">
            {/* Cart Icon with reactive badge */}
            <Link
              href="/cart"
              className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/60 text-slate-200 hover:border-emerald-500/50 hover:text-emerald-400 transition"
              aria-label="Keranjang Belanja"
            >
              <ShoppingBag className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[11px] font-bold text-slate-950 shadow-md animate-pulse">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* User Dropdown / Auth Buttons */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-slate-200 hover:border-slate-700 transition"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs">
                    {profile?.full_name ? profile.full_name[0].toUpperCase() : 'U'}
                  </div>
                  <span className="hidden sm:inline font-medium max-w-[120px] truncate text-slate-200">
                    {profile?.full_name || user.email}
                  </span>
                  {isAdmin && (
                    <span className="rounded bg-indigo-500/20 px-1.5 py-0.5 text-[10px] font-bold text-indigo-300">
                      ADMIN
                    </span>
                  )}
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-800 bg-slate-900/95 p-2 shadow-2xl backdrop-blur-xl z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="border-b border-slate-800 px-3 py-2 text-xs">
                      <p className="font-semibold text-white">{profile?.full_name || 'Pengguna'}</p>
                      <p className="text-slate-400 truncate">{user.email}</p>
                    </div>

                    <div className="py-1">
                      <Link
                        href="/orders"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white"
                      >
                        <Package className="h-4 w-4 text-emerald-400" />
                        Pesanan Saya
                      </Link>

                      {isAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-indigo-300 hover:bg-indigo-950/50 hover:text-indigo-200"
                        >
                          <ShieldAlert className="h-4 w-4 text-indigo-400" />
                          Dashboard Admin
                        </Link>
                      )}
                    </div>

                    <div className="border-t border-slate-800 pt-1">
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          signOut();
                        }}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300"
                      >
                        <LogOut className="h-4 w-4" />
                        Keluar Akun
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/auth/login"
                  className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60 transition"
                >
                  Masuk
                </Link>
                <Link
                  href="/auth/register"
                  className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400 shadow-md shadow-emerald-500/20 transition"
                >
                  Daftar
                </Link>
              </div>
            )}

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 text-slate-400 hover:text-white"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Panel */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-slate-800 bg-slate-950/95 px-4 pt-2 pb-6 space-y-2">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`block rounded-xl px-3 py-2 text-base font-medium transition ${
                isCatalogHome && !currentType
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'text-slate-200 hover:bg-slate-800'
              }`}
            >
              Etalase Utama
            </Link>
            <Link
              href="/?type=digital"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2 rounded-xl px-3 py-2 text-base font-medium transition ${
                isCatalogHome && currentType === 'digital'
                  ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30'
                  : 'text-emerald-400 hover:bg-slate-800'
              }`}
            >
              <Sparkles className="h-4 w-4" />
              Katalog Produk Digital
            </Link>
            <Link
              href="/?type=physical"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2 rounded-xl px-3 py-2 text-base font-medium transition ${
                isCatalogHome && currentType === 'physical'
                  ? 'bg-teal-500/20 text-teal-300 font-bold border border-teal-500/30'
                  : 'text-teal-400 hover:bg-slate-800'
              }`}
            >
              <Package className="h-4 w-4" />
              Katalog Produk Fisik
            </Link>
            <Link
              href="/orders"
              onClick={() => setMobileMenuOpen(false)}
              className="block rounded-xl px-3 py-2 text-base font-medium text-slate-200 hover:bg-slate-800"
            >
              Riwayat Pesanan
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 rounded-xl bg-indigo-950/40 px-3 py-2 text-base font-medium text-indigo-300"
              >
                <ShieldAlert className="h-4 w-4" />
                Panel Admin
              </Link>
            )}
          </div>
        )}
      </header>
    </>
  );
};
