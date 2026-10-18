'use client';

import React from 'react';
import Link from 'next/navigation';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../lib/context/AuthContext';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  ArrowLeft,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import LinkItem from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, profile, isAdmin, demoSignIn } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      {/* Admin Top Header */}
      <div className="border-b border-indigo-500/20 bg-indigo-950/20 px-4 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-md shadow-indigo-600/30">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-sm font-black tracking-tight text-white">
                NEXU<span className="text-indigo-400">ADMIN</span> PORTAL
              </h1>
              <p className="text-[10px] text-indigo-300">
                Manajemen Katalog Produk & Pesanan Pembeli Terintegrasi Supabase
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <LinkItem
              href="/"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Kembali ke Toko
            </LinkItem>

            {/* Quick admin privilege activator if user is not admin */}
            {!isAdmin && (
              <button
                onClick={() => demoSignIn('admin')}
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white shadow-md hover:bg-indigo-500 transition"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                Masuk Mode Admin
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Admin Subnav */}
      <div className="border-b border-slate-800 bg-slate-900/60 sticky top-20 z-30 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 overflow-x-auto py-3 text-xs font-semibold">
            <LinkItem
              href="/admin"
              className={`flex items-center gap-2 rounded-xl px-4 py-2 transition whitespace-nowrap ${
                pathname === '/admin'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              Ringkasan Dashboard
            </LinkItem>

            <LinkItem
              href="/admin/products"
              className={`flex items-center gap-2 rounded-xl px-4 py-2 transition whitespace-nowrap ${
                pathname.startsWith('/admin/products')
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Package className="h-4 w-4" />
              Kelola Produk (CRUD)
            </LinkItem>

            <LinkItem
              href="/admin/orders"
              className={`flex items-center gap-2 rounded-xl px-4 py-2 transition whitespace-nowrap ${
                pathname.startsWith('/admin/orders')
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <ShoppingBag className="h-4 w-4" />
              Manajemen Pesanan Masuk
            </LinkItem>
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8">
        {children}
      </div>
    </div>
  );
}
