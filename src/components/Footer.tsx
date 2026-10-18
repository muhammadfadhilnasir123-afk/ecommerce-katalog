import React from 'react';
import Link from 'next/link';
import { Layers, ShieldCheck, Zap, Truck, Headphones, Github, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950 text-slate-400">
      {/* Feature Value Props Banner */}
      <div className="border-b border-slate-800/50 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-start gap-4 rounded-2xl border border-slate-800/60 bg-slate-900/40 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Pengiriman Digital Instan</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Akses langsung tautan unduhan setelah konfirmasi pembayaran.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-2xl border border-slate-800/60 bg-slate-900/40 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-500/10 text-teal-400">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Pengiriman Fisik Aman</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Packing kardus kokoh & bubble wrap berlapis ke seluruh Indonesia.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-2xl border border-slate-800/60 bg-slate-900/40 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Didukung Supabase</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Keamanan data transaksi terproteksi Row Level Security (RLS).
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-2xl border border-slate-800/60 bg-slate-900/40 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
                <Headphones className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Bantuan Pelanggan</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Dukungan tim teknis siap menjawab kendala Anda.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 font-black">
                <Layers className="h-4 w-4" />
              </div>
              <span className="text-lg font-black tracking-tight text-white">
                NEXU<span className="text-emerald-400">STORE</span>
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              Platform katalog dan toko daring produk digital (source code, e-book, preset) serta produk fisik berkualitas tinggi, terintegrasi penuh dengan Supabase Database dan Autentikasi.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white">Kategori Populer</h4>
            <ul className="mt-3 space-y-2 text-xs">
              <li>
                <Link href="/?category=Source%20Code%20%26%20Template" className="hover:text-emerald-400 transition">
                  Source Code & Template Web
                </Link>
              </li>
              <li>
                <Link href="/?category=E-Book" className="hover:text-emerald-400 transition">
                  E-Book Arsitektur & Coding
                </Link>
              </li>
              <li>
                <Link href="/?category=Design%20Asset" className="hover:text-emerald-400 transition">
                  Figma UI Kits & Design System
                </Link>
              </li>
              <li>
                <Link href="/?category=Hardware%20%26%20Aksesoris" className="hover:text-emerald-400 transition">
                  Keyboard Mekanikal & Aksesoris
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white">Menu & Navigasi</h4>
            <ul className="mt-3 space-y-2 text-xs">
              <li>
                <Link href="/" className="hover:text-emerald-400 transition">
                  Etalase Produk
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-emerald-400 transition">
                  Keranjang Belanja
                </Link>
              </li>
              <li>
                <Link href="/orders" className="hover:text-emerald-400 transition">
                  Status & Riwayat Pesanan
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-emerald-400 transition">
                  Panel Manajemen Admin
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white">Metode Pembayaran</h4>
            <p className="text-xs text-slate-400 mt-2 mb-3">
              Mendukung transaksi instan via QRIS, Virtual Account bank nasional, dan transfer dompet digital.
            </p>
            <div className="flex flex-wrap gap-2 text-[10px] font-bold text-slate-300">
              <span className="rounded bg-slate-900 border border-slate-800 px-2.5 py-1">QRIS</span>
              <span className="rounded bg-slate-900 border border-slate-800 px-2.5 py-1">BCA</span>
              <span className="rounded bg-slate-900 border border-slate-800 px-2.5 py-1">Mandiri</span>
              <span className="rounded bg-slate-900 border border-slate-800 px-2.5 py-1">GoPay</span>
              <span className="rounded bg-slate-900 border border-slate-800 px-2.5 py-1">ShopeePay</span>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} NEXUSTORE. Dibangun dengan Next.js App Router, Tailwind CSS & Supabase.</p>
          <div className="flex items-center gap-1 mt-2 sm:mt-0">
            <span>Dibuat dengan dedikasi penuh untuk performa & estetika</span>
            <Heart className="h-3 w-3 text-red-500 inline fill-red-500" />
          </div>
        </div>
      </div>
    </footer>
  );
};
