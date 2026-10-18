'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '../../lib/context/CartContext';
import { useAuth } from '../../lib/context/AuthContext';
import { formatRupiah } from '../../lib/utils';
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Package,
  Tag,
  AlertCircle,
} from 'lucide-react';

export default function CartPage() {
  const router = useRouter();
  const {
    items,
    updateQuantity,
    removeFromCart,
    clearCart,
    totalItems,
    totalPrice,
    hasPhysicalItems,
    hasDigitalItems,
  } = useCart();
  const { user } = useAuth();

  const [couponCode, setCouponCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponMessage, setCouponMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const applyCoupon = () => {
    if (couponCode.trim().toUpperCase() === 'DISKON20') {
      setDiscountPercent(0.2);
      setCouponMessage({ text: 'Kupon DISKON20 berhasil diterapkan! (Hemat 20%)', isError: false });
    } else if (couponCode.trim().toUpperCase() === 'NEXUS50') {
      setDiscountPercent(0.5);
      setCouponMessage({ text: 'Kupon NEXUS50 berhasil diterapkan! (Hemat 50%)', isError: false });
    } else {
      setCouponMessage({ text: 'Kode kupon tidak valid. Coba gunakan "DISKON20" atau "NEXUS50".', isError: true });
    }
  };

  const shippingCost = hasPhysicalItems ? 25000 : 0;
  const discountAmount = totalPrice * discountPercent;
  const finalTotal = Math.max(0, totalPrice - discountAmount + shippingCost);

  const handleProceedToCheckout = () => {
    if (!user) {
      router.push('/auth/login?redirect=/checkout');
      return;
    }
    router.push('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-24 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-900 border border-slate-800 text-slate-500 mb-6">
          <ShoppingBag className="h-10 w-10 text-emerald-400" />
        </div>
        <h2 className="text-2xl font-black text-white">Keranjang Belanja Anda Kosong</h2>
        <p className="mt-2 text-sm text-slate-400 max-w-md mx-auto">
          Belum ada produk yang ditambahkan ke keranjang belanja Anda. Jelajahi etalase kami untuk menemukan produk digital maupun fisik impian Anda.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-6 py-3 text-xs sm:text-sm font-bold text-slate-950 hover:bg-emerald-400 shadow-xl shadow-emerald-500/20 transition"
        >
          <span>Mulai Belanja Sekarang</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 pt-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between border-b border-slate-800 pb-5 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">Keranjang Belanja</h1>
            <p className="text-xs text-slate-400 mt-1">
              Menampilkan {totalItems} item dalam keranjang Anda
            </p>
          </div>
          <button
            onClick={clearCart}
            className="text-xs font-semibold text-slate-400 hover:text-red-400 transition"
          >
            Kosongkan Keranjang
          </button>
        </div>

        {/* Not logged in alert */}
        {!user && (
          <div className="mb-6 flex items-center justify-between rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-200">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="h-4 w-4 shrink-0 text-amber-400" />
              <span>
                Anda belum masuk akun. Sesuai spesifikasi keamanan, Anda harus <strong>login</strong> untuk melanjutkan proses checkout.
              </span>
            </div>
            <Link
              href="/auth/login?redirect=/cart"
              className="font-bold underline hover:text-white ml-2 whitespace-nowrap"
            >
              Masuk Sekarang &rarr;
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Items List */}
          <div className="lg:col-span-2 space-y-4">
            {items.map(({ product, quantity }) => {
              const isDigital = product.type === 'digital';

              return (
                <div
                  key={product.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 backdrop-blur-sm"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={product.image_url}
                      alt={product.title}
                      className="h-20 w-20 shrink-0 rounded-xl object-cover bg-slate-800"
                    />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {isDigital ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                            <Sparkles className="h-3 w-3" />
                            Digital
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-md bg-teal-500/20 px-2 py-0.5 text-[10px] font-bold text-teal-400">
                            <Package className="h-3 w-3" />
                            Fisik
                          </span>
                        )}
                        <span className="text-[10px] text-slate-500">{product.category}</span>
                      </div>
                      <Link
                        href={`/products/${product.id}`}
                        className="text-sm font-bold text-white hover:text-emerald-400 transition line-clamp-1"
                      >
                        {product.title}
                      </Link>
                      <p className="text-xs font-black text-emerald-400 mt-1">
                        {formatRupiah(product.price)}
                      </p>
                    </div>
                  </div>

                  {/* Quantity & Remove */}
                  <div className="flex w-full sm:w-auto items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 border-slate-800 pt-3 sm:pt-0">
                    {!isDigital ? (
                      <div className="flex items-center rounded-xl border border-slate-800 bg-slate-950">
                        <button
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          className="p-1.5 text-slate-400 hover:text-white"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="px-3 text-xs font-bold text-white">{quantity}</span>
                        <button
                          onClick={() => updateQuantity(product.id, Math.min(product.stock, quantity + 1))}
                          className="p-1.5 text-slate-400 hover:text-white"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs font-medium text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-lg">
                        1 Lisensi
                      </span>
                    )}

                    <div className="text-right">
                      <span className="block text-xs font-bold text-white">
                        {formatRupiah(product.price * quantity)}
                      </span>
                    </div>

                    <button
                      onClick={() => removeFromCart(product.id)}
                      className="rounded-lg p-2 text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition"
                      title="Hapus dari keranjang"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Delivery type info summary */}
            <div className="rounded-2xl border border-slate-800/60 bg-slate-900/30 p-4 text-xs text-slate-400">
              <div className="flex items-center gap-2 text-slate-300 font-semibold mb-1">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>Rincian Pengiriman Pesanan:</span>
              </div>
              <ul className="list-disc list-inside space-y-1 ml-1 text-[11px]">
                {hasDigitalItems && (
                  <li>Item digital akan langsung dapat diunduh pada halaman pesanan selesai.</li>
                )}
                {hasPhysicalItems && (
                  <li>Item fisik dikirimkan via ekspedisi reguler dengan packing aman (est. 2-3 hari kerja).</li>
                )}
              </ul>
            </div>
          </div>

          {/* Order Summary Card */}
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-xl shadow-xl">
              <h3 className="text-base font-bold text-white mb-4">Ringkasan Belanja</h3>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Subtotal ({totalItems} item)</span>
                  <span className="font-semibold text-white">{formatRupiah(totalPrice)}</span>
                </div>

                <div className="flex justify-between text-slate-300">
                  <span>Biaya Pengiriman Fisik</span>
                  <span className="font-semibold text-white">
                    {hasPhysicalItems ? formatRupiah(shippingCost) : 'Gratis (Digital)'}
                  </span>
                </div>

                {discountPercent > 0 && (
                  <div className="flex justify-between text-emerald-400 font-semibold">
                    <span>Diskon Kupon ({discountPercent * 100}%)</span>
                    <span>-{formatRupiah(discountAmount)}</span>
                  </div>
                )}

                <div className="border-t border-slate-800 pt-3 flex justify-between text-sm font-black text-white">
                  <span>Total Tagihan</span>
                  <span className="text-xl text-emerald-400">{formatRupiah(finalTotal)}</span>
                </div>
              </div>

              {/* Coupon Code Input */}
              <div className="mt-6 border-t border-slate-800 pt-5">
                <label className="block text-[11px] font-semibold text-slate-400 mb-2">
                  Punya Kode Kupon Promo?
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Contoh: DISKON20"
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2 pl-9 pr-3 text-xs text-white uppercase placeholder-slate-600 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <button
                    onClick={applyCoupon}
                    className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3.5 py-2 text-xs font-bold text-emerald-400 hover:bg-emerald-500/20"
                  >
                    Gunakan
                  </button>
                </div>
                {couponMessage && (
                  <p
                    className={`mt-2 text-[11px] ${
                      couponMessage.isError ? 'text-red-400' : 'text-emerald-400'
                    }`}
                  >
                    {couponMessage.text}
                  </p>
                )}
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleProceedToCheckout}
                className="mt-6 w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-3.5 text-xs sm:text-sm font-bold text-slate-950 shadow-xl shadow-emerald-500/20 hover:bg-emerald-400 transition active:scale-98"
              >
                <span>{user ? 'Lanjut ke Pembayaran' : 'Login & Proses Checkout'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
