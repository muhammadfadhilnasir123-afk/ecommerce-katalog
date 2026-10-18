'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Product } from '../../../lib/supabase/types';
import { StoreService } from '../../../lib/data/storeService';
import { useCart } from '../../../lib/context/CartContext';
import { formatRupiah } from '../../../lib/utils';
import {
  ArrowLeft,
  Sparkles,
  Package,
  ShoppingCart,
  Star,
  CheckCircle2,
  Download,
  ShieldCheck,
  Truck,
  RotateCcw,
  Zap,
} from 'lucide-react';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const found = await StoreService.getProductById(productId);
        setProduct(found);
      } catch (err) {
        console.error('Failed to load product:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [productId]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="h-96 rounded-3xl border border-slate-800 bg-slate-900/40 animate-pulse" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-white">Produk Tidak Ditemukan</h2>
        <p className="mt-2 text-slate-400">Produk yang Anda cari mungkin telah dihapus atau tidak tersedia.</p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-400"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Etalase
        </Link>
      </div>
    );
  }

  const isDigital = product.type === 'digital';

  const handleBuyNow = () => {
    addToCart(product, quantity);
    router.push('/checkout');
  };

  return (
    <div className="min-h-screen pb-24 pt-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb / Back button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-emerald-400 mb-8 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Katalog
        </Link>

        {/* Main Product Layout */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          {/* Left: Product Image */}
          <div className="space-y-4">
            <div className="relative aspect-square w-full overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl">
              <img
                src={product.image_url}
                alt={product.title}
                className="h-full w-full object-cover object-center"
              />
              <div className="absolute top-4 left-4 flex gap-2">
                {isDigital ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/90 px-3 py-1 text-xs font-bold text-slate-950 shadow-lg backdrop-blur-md">
                    <Sparkles className="h-3.5 w-3.5" />
                    Produk Digital (Download Instan)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-500/90 px-3 py-1 text-xs font-bold text-slate-950 shadow-lg backdrop-blur-md">
                    <Package className="h-3.5 w-3.5" />
                    Produk Fisik (Pengiriman Kurir)
                  </span>
                )}
              </div>
            </div>

            {/* Guarantees Box */}
            <div className="grid grid-cols-3 gap-3 rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4 text-center">
              <div className="flex flex-col items-center">
                <ShieldCheck className="h-5 w-5 text-emerald-400 mb-1" />
                <span className="text-[11px] font-semibold text-white">100% Terverifikasi</span>
                <span className="text-[10px] text-slate-400">Kualitas Terjamin</span>
              </div>
              <div className="flex flex-col items-center">
                {isDigital ? (
                  <>
                    <Zap className="h-5 w-5 text-teal-400 mb-1" />
                    <span className="text-[11px] font-semibold text-white">Akses Seketika</span>
                    <span className="text-[10px] text-slate-400">Download Langsung</span>
                  </>
                ) : (
                  <>
                    <Truck className="h-5 w-5 text-teal-400 mb-1" />
                    <span className="text-[11px] font-semibold text-white">Pengiriman Cepat</span>
                    <span className="text-[10px] text-slate-400">JNE, J&T, SiCepat</span>
                  </>
                )}
              </div>
              <div className="flex flex-col items-center">
                <RotateCcw className="h-5 w-5 text-indigo-400 mb-1" />
                <span className="text-[11px] font-semibold text-white">Garansi Pembeli</span>
                <span className="text-[10px] text-slate-400">Bantuan 24/7</span>
              </div>
            </div>
          </div>

          {/* Right: Product Details & Purchase Actions */}
          <div className="flex flex-col justify-between">
            <div>
              {/* Category & Rating */}
              <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                <span className="rounded-lg bg-slate-800 px-2.5 py-1 font-semibold text-slate-300">
                  {product.category}
                </span>
                <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                  <Star className="h-4 w-4 fill-amber-400" />
                  <span>{product.rating}</span>
                  <span className="text-slate-500 font-normal">({product.reviews_count} ulasan pembeli)</span>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-black text-white leading-snug">
                {product.title}
              </h1>

              {/* Price */}
              <div className="mt-4 flex items-baseline gap-3">
                <span className="text-3xl font-black text-emerald-400">
                  {formatRupiah(product.price)}
                </span>
                <span className="text-xs text-slate-400">Termasuk pajak & biaya lisensi</span>
              </div>

              {/* Stock or Digital Delivery Info */}
              <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                {isDigital ? (
                  <div className="flex items-start gap-3">
                    <Download className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-white">Pengiriman File Otomatis</h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Tautan unduhan aset digital akan langsung aktif di halaman pesanan Anda setelah proses checkout selesai.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    <Package className="h-5 w-5 text-teal-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-white">Ketersediaan Stok Fisik</h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Tersedia <strong className="text-white">{product.stock}</strong> unit siap kirim dari gudang pusat.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Full Description */}
              <div className="mt-6">
                <h3 className="text-sm font-bold text-white mb-2">Deskripsi Produk</h3>
                <div className="prose prose-invert max-w-none text-xs sm:text-sm text-slate-300 leading-relaxed space-y-3">
                  <p>{product.description}</p>
                </div>
              </div>

              {/* Specifications / Highlights */}
              <div className="mt-6 border-t border-slate-800 pt-6">
                <h3 className="text-sm font-bold text-white mb-3">Informasi Tambahan</h3>
                <dl className="grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-3">
                    <dt className="text-slate-500">Tipe Produk</dt>
                    <dd className="font-semibold text-slate-200 capitalize mt-0.5">{product.type}</dd>
                  </div>
                  <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-3">
                    <dt className="text-slate-500">Kategori</dt>
                    <dd className="font-semibold text-slate-200 mt-0.5">{product.category}</dd>
                  </div>
                  <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-3">
                    <dt className="text-slate-500">Format / Pengiriman</dt>
                    <dd className="font-semibold text-slate-200 mt-0.5">
                      {isDigital ? 'Direct Digital Download' : 'Jasa Kirim Ekspedisi'}
                    </dd>
                  </div>
                  <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-3">
                    <dt className="text-slate-500">Status Database</dt>
                    <dd className="font-semibold text-emerald-400 mt-0.5">Supabase Synchronized</dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Sticky/Bottom Purchase Bar */}
            <div className="mt-10 border-t border-slate-800 pt-6">
              {!isDigital && (
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-xs font-semibold text-slate-300">Jumlah Beli:</span>
                  <div className="flex items-center rounded-xl border border-slate-800 bg-slate-900">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-1.5 text-sm text-slate-400 hover:text-white"
                    >
                      -
                    </button>
                    <span className="px-4 py-1.5 text-xs font-bold text-white">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="px-3 py-1.5 text-sm text-slate-400 hover:text-white"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-xs text-slate-500">Maksimal {product.stock} unit</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => addToCart(product, quantity)}
                  className="flex-1 flex items-center justify-center gap-2 rounded-2xl border border-emerald-500/50 bg-emerald-500/10 py-3.5 text-xs sm:text-sm font-bold text-emerald-400 hover:bg-emerald-500/20 transition active:scale-95"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Tambah ke Keranjang
                </button>
                <button
                  onClick={handleBuyNow}
                  className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-3.5 text-xs sm:text-sm font-bold text-slate-950 shadow-xl shadow-emerald-500/20 hover:bg-emerald-400 transition active:scale-95"
                >
                  <Zap className="h-4 w-4" />
                  Beli Sekarang &rarr;
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
