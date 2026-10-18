'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '../../lib/context/AuthContext';
import { Order } from '../../lib/supabase/types';
import { StoreService } from '../../lib/data/storeService';
import { formatRupiah, formatDate } from '../../lib/utils';
import {
  Package,
  Sparkles,
  Download,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShoppingBag,
} from 'lucide-react';

function OrdersContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const showSuccessBanner = searchParams.get('success') === 'true';

  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    async function loadUserOrders() {
      setLoadingOrders(true);
      try {
        const data = await StoreService.getOrders(user ? user.id : undefined);
        setOrders(data);
      } catch (err) {
        console.error('Failed to load orders:', err);
      } finally {
        setLoadingOrders(false);
      }
    }
    loadUserOrders();
  }, [user]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Selesai':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Selesai
          </span>
        );
      case 'Diproses':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/20 px-3 py-1 text-xs font-bold text-blue-400 border border-blue-500/30">
            <Clock className="h-3.5 w-3.5" />
            Diproses
          </span>
        );
      case 'Dibatalkan':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/20 px-3 py-1 text-xs font-bold text-red-400 border border-red-500/30">
            Dibatalkan
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-300 border border-amber-500/30">
            <Clock className="h-3.5 w-3.5" />
            Menunggu Pembayaran
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen pb-24 pt-8">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {showSuccessBanner && (
          <div className="mb-8 overflow-hidden rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/60 to-slate-900 p-6 backdrop-blur-xl shadow-2xl">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white">Pesanan Anda Berhasil Dibuat!</h3>
                <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                  Terima kasih telah berbelanja di NEXUSTORE. Transaksi Anda telah tersimpan dengan aman di database. Item digital Anda dapat diunduh langsung melalui tombol unduh di bawah ini.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between border-b border-slate-800 pb-5 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">Riwayat & Status Pesanan</h1>
            <p className="text-xs text-slate-400 mt-1">
              Pantau status pengiriman barang fisik dan akses file unduhan produk digital Anda
            </p>
          </div>
          <Link
            href="/"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300"
          >
            <ShoppingBag className="h-4 w-4" />
            Belanja Lagi &rarr;
          </Link>
        </div>

        {loadingOrders ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-48 rounded-3xl border border-slate-800 bg-slate-900/40 animate-pulse"
              />
            ))}
          </div>
        ) : orders.length > 0 ? (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm transition hover:border-slate-700"
              >
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 bg-slate-900/90 px-6 py-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-white">ID Pesanan: #{order.id}</span>
                      {getStatusBadge(order.status)}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Waktu Pemesanan: {formatDate(order.created_at)} &bull; Metode: {order.payment_method}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="block text-[10px] uppercase text-slate-400">Total Transaksi</span>
                    <span className="text-lg font-black text-emerald-400">
                      {formatRupiah(order.total_amount)}
                    </span>
                  </div>
                </div>

                <div className="p-6 divide-y divide-slate-800/60">
                  {order.order_items && order.order_items.length > 0 ? (
                    order.order_items.map((item) => {
                      const isDigital = item.product_type === 'digital';

                      return (
                        <div
                          key={item.id}
                          className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-3.5">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-slate-400">
                              {isDigital ? (
                                <Sparkles className="h-5 w-5 text-emerald-400" />
                              ) : (
                                <Package className="h-5 w-5 text-teal-400" />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span
                                  className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${
                                    isDigital
                                      ? 'bg-emerald-500/20 text-emerald-300'
                                      : 'bg-teal-500/20 text-teal-300'
                                  }`}
                                >
                                  {isDigital ? 'Digital' : 'Fisik'}
                                </span>
                                <h4 className="text-xs sm:text-sm font-bold text-white">
                                  {item.product_title}
                                </h4>
                              </div>
                              <p className="text-[11px] text-slate-400 mt-0.5">
                                {item.quantity} unit &times; {formatRupiah(item.price)}
                              </p>
                            </div>
                          </div>

                          <div>
                            {isDigital ? (
                              <a
                                href={item.file_url || 'https://github.com/example/sample-asset'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-2 text-xs font-bold text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300 transition"
                              >
                                <Download className="h-3.5 w-3.5" />
                                <span>Unduh Aset Digital</span>
                                <ExternalLink className="h-3 w-3 opacity-60" />
                              </a>
                            ) : (
                              <span className="text-xs text-slate-400">
                                Tujuan: {order.shipping_address ? order.shipping_address.slice(0, 30) + '...' : 'Alamat Reguler'}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-xs text-slate-500">Rincian produk tidak tersedia.</p>
                  )}
                </div>

                {order.shipping_address && (
                  <div className="border-t border-slate-800/60 bg-slate-950/40 px-6 py-3 text-xs text-slate-400 flex items-center gap-2">
                    <Package className="h-3.5 w-3.5 text-teal-400" />
                    <span>
                      Alamat Pengiriman:{' '}
                      <strong className="text-slate-300 font-medium">{order.shipping_address}</strong>
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-800 bg-slate-900/30 py-20 px-4 text-center">
            <Package className="mx-auto h-12 w-12 text-slate-600 mb-4" />
            <h3 className="text-lg font-bold text-white">Belum Ada Pesanan</h3>
            <p className="mt-2 text-xs text-slate-400 max-w-sm mx-auto">
              Anda belum melakukan transaksi belanja apapun. Beli produk digital atau fisik pertama Anda sekarang!
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition"
            >
              Mulai Belanja &rarr;
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-400 text-sm">Memuat pesanan...</div>}>
      <OrdersContent />
    </Suspense>
  );
}
