'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { StoreService } from '../../../lib/data/storeService';
import { Order, OrderStatus } from '../../../lib/supabase/types';
import { formatRupiah, formatDate } from '../../../lib/utils';
import {
  ShoppingBag,
  Search,
  CheckCircle2,
  Clock,
  Package,
  Sparkles,
  AlertCircle,
  Truck,
  ExternalLink,
} from 'lucide-react';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'all'>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await StoreService.getOrders();
      setOrders(data);
    } catch (err) {
      console.error('Failed to load admin orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingId(orderId);
    try {
      await StoreService.updateOrderStatus(orderId, newStatus);
      await loadOrders();
    } catch (err) {
      console.error('Failed to update order status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesSearch =
        o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.customer_email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = selectedStatus === 'all' || o.status === selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, selectedStatus]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-white">Manajemen Pesanan Pembeli</h2>
        <p className="text-xs text-slate-400 mt-1">
          Perbarui status pesanan (Menunggu Pembayaran, Diproses, Selesai, Dibatalkan) langsung ke Supabase
        </p>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-semibold">
          {(['all', 'Menunggu Pembayaran', 'Diproses', 'Selesai', 'Dibatalkan'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`rounded-xl px-3 py-1.5 transition whitespace-nowrap ${
                selectedStatus === status
                  ? 'bg-indigo-600 text-white shadow'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {status === 'all' ? `Semua (${orders.length})` : status}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari ID, nama, email..."
            className="w-full rounded-xl border border-slate-800 bg-slate-900 py-1.5 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Orders Cards List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 rounded-3xl bg-slate-900/40 animate-pulse" />
          ))}
        </div>
      ) : filteredOrders.length > 0 ? (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm transition hover:border-slate-700"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-black text-white">ID Pesanan #{order.id}</span>
                    <span className="text-xs text-slate-500">&bull;</span>
                    <span className="text-xs text-slate-400">{formatDate(order.created_at)}</span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-300">
                    <span className="font-semibold text-white">{order.customer_name}</span>
                    <span>({order.customer_email})</span>
                    {order.customer_phone && <span>&bull; {order.customer_phone}</span>}
                  </div>
                </div>

                {/* Status selector */}
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400 font-medium">Ubah Status:</span>
                  <select
                    disabled={updatingId === order.id}
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                    className="rounded-xl border border-indigo-500/40 bg-slate-800 px-3 py-1.5 text-xs font-bold text-indigo-300 focus:border-indigo-500 focus:outline-none cursor-pointer"
                  >
                    <option value="Menunggu Pembayaran">Menunggu Pembayaran</option>
                    <option value="Diproses">Diproses</option>
                    <option value="Selesai">Selesai</option>
                    <option value="Dibatalkan">Dibatalkan</option>
                  </select>
                </div>
              </div>

              {/* Items & Shipping row */}
              <div className="py-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {/* Items */}
                <div className="md:col-span-2 space-y-2">
                  <h4 className="font-bold text-slate-400 text-[11px] uppercase tracking-wider">
                    Daftar Item ({order.order_items?.length || 0})
                  </h4>
                  {order.order_items && order.order_items.length > 0 ? (
                    <ul className="space-y-1.5">
                      {order.order_items.map((it) => (
                        <li key={it.id} className="flex items-center justify-between gap-2 text-slate-200">
                          <div className="flex items-center gap-2">
                            <span
                              className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${
                                it.product_type === 'digital'
                                  ? 'bg-emerald-500/20 text-emerald-400'
                                  : 'bg-teal-500/20 text-teal-400'
                              }`}
                            >
                              {it.product_type}
                            </span>
                            <span className="font-medium truncate max-w-sm">{it.product_title}</span>
                            <span className="text-slate-500">x{it.quantity}</span>
                          </div>
                          <span className="font-bold text-white shrink-0">
                            {formatRupiah(it.price * it.quantity)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-slate-500">Detail item tidak ditemukan.</p>
                  )}
                </div>

                {/* Delivery & Payment Info */}
                <div className="border-t md:border-t-0 md:border-l border-slate-800 pt-3 md:pt-0 md:pl-4 space-y-2">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
                      Metode Pembayaran
                    </span>
                    <span className="font-semibold text-slate-200">{order.payment_method}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
                      Tujuan Pengiriman
                    </span>
                    <span className="text-slate-300 text-[11px]">
                      {order.shipping_address || 'Produk Digital (Tidak memerlukan ekspedisi)'}
                    </span>
                  </div>

                  {order.notes && (
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
                        Catatan Pembeli
                      </span>
                      <span className="text-slate-400 italic text-[11px]">&ldquo;{order.notes}&rdquo;</span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-800 flex justify-between items-baseline">
                    <span className="text-slate-400">Total Tagihan:</span>
                    <span className="text-base font-black text-emerald-400">
                      {formatRupiah(order.total_amount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-800 bg-slate-900/30 py-16 text-center text-xs text-slate-400">
          Tidak ditemukan pesanan dengan kriteria pencarian ini.
        </div>
      )}
    </div>
  );
}
