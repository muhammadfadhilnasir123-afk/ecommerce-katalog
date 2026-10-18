'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { StoreService } from '../../lib/data/storeService';
import { Product, Order, OrderStatus } from '../../lib/supabase/types';
import { formatRupiah, formatDate } from '../../lib/utils';
import {
  DollarSign,
  ShoppingBag,
  Package,
  Sparkles,
  TrendingUp,
  Clock,
  ArrowRight,
  PlusCircle,
  CheckCircle2,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [prods, ords] = await Promise.all([
        StoreService.getProducts(),
        StoreService.getOrders(),
      ]);
      setProducts(prods);
      setOrders(ords);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total_amount), 0);
  const digitalProductsCount = products.filter((p) => p.type === 'digital').length;
  const physicalProductsCount = products.filter((p) => p.type === 'physical').length;
  const pendingOrdersCount = orders.filter((o) => o.status === 'Menunggu Pembayaran').length;

  const handleQuickStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await StoreService.updateOrderStatus(orderId, newStatus);
      await loadData();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white">Ringkasan Aktivitas Toko</h2>
          <p className="text-xs text-slate-400 mt-1">
            Data statistik real-time katalog produk digital & fisik dan pesanan yang masuk
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Tambah Produk Baru</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Revenue */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Transaksi</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-black text-white">{formatRupiah(totalRevenue)}</span>
            <p className="mt-1 text-[11px] text-emerald-400 flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Dari {orders.length} akumulasi pesanan</span>
            </p>
          </div>
        </div>

        {/* Total Orders */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Pesanan Masuk</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400">
              <ShoppingBag className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-black text-white">{orders.length}</span>
            <p className="mt-1 text-[11px] text-amber-400 flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              <span>{pendingOrdersCount} menunggu pembayaran</span>
            </p>
          </div>
        </div>

        {/* Products Digital */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Produk Digital</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-400">
              <Sparkles className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-black text-white">{digitalProductsCount}</span>
            <p className="mt-1 text-[11px] text-slate-400">
              Template, E-Book, Design Assets
            </p>
          </div>
        </div>

        {/* Products Physical */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Produk Fisik</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
              <Package className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-black text-white">{physicalProductsCount}</span>
            <p className="mt-1 text-[11px] text-slate-400">
              Keyboard, Tas, Setup Aksesoris
            </p>
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
          <div>
            <h3 className="text-base font-bold text-white">Pesanan Pembeli Terbaru</h3>
            <p className="text-xs text-slate-400">Daftar transaksi yang baru saja masuk</p>
          </div>
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
          >
            Lihat Semua Pesanan &rarr;
          </Link>
        </div>

        {loading ? (
          <div className="h-40 rounded-2xl bg-slate-800/40 animate-pulse" />
        ) : orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="pb-3 font-semibold">ID & Waktu</th>
                  <th className="pb-3 font-semibold">Nama Pembeli</th>
                  <th className="pb-3 font-semibold">Item Dipesan</th>
                  <th className="pb-3 font-semibold">Total</th>
                  <th className="pb-3 font-semibold">Status Saat Ini</th>
                  <th className="pb-3 font-semibold text-right">Ubah Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {orders.slice(0, 5).map((order) => (
                  <tr key={order.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3.5 pr-4">
                      <span className="block font-bold text-white">#{order.id}</span>
                      <span className="text-[10px] text-slate-500">{formatDate(order.created_at)}</span>
                    </td>
                    <td className="py-3.5 pr-4">
                      <span className="block font-semibold text-slate-200">{order.customer_name}</span>
                      <span className="text-[10px] text-slate-400 truncate block max-w-[140px]">{order.customer_email}</span>
                    </td>
                    <td className="py-3.5 pr-4">
                      <span className="font-medium text-slate-300">
                        {order.order_items?.length || 0} produk
                      </span>
                    </td>
                    <td className="py-3.5 pr-4 font-bold text-emerald-400">
                      {formatRupiah(order.total_amount)}
                    </td>
                    <td className="py-3.5 pr-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          order.status === 'Selesai'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : order.status === 'Diproses'
                            ? 'bg-blue-500/20 text-blue-400'
                            : order.status === 'Dibatalkan'
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      <select
                        value={order.status}
                        onChange={(e) => handleQuickStatusChange(order.id, e.target.value as OrderStatus)}
                        className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-[11px] font-medium text-slate-200 focus:border-indigo-500 focus:outline-none"
                      >
                        <option value="Menunggu Pembayaran">Menunggu Pembayaran</option>
                        <option value="Diproses">Diproses</option>
                        <option value="Selesai">Selesai</option>
                        <option value="Dibatalkan">Dibatalkan</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-slate-500 py-6 text-center">Belum ada pesanan masuk.</p>
        )}
      </div>
    </div>
  );
}
