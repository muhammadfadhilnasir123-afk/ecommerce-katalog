'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '../../lib/context/CartContext';
import { useAuth } from '../../lib/context/AuthContext';
import { StoreService } from '../../lib/data/storeService';
import { formatRupiah } from '../../lib/utils';
import {
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  QrCode,
  CreditCard,
  Wallet,
  Truck,
  Sparkles,
  Package,
  AlertCircle,
  Loader2,
} from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, clearCart, hasPhysicalItems, hasDigitalItems } = useCart();
  const { user, profile, isLoading: authLoading } = useAuth();

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('QRIS Instant');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Protect route & prefill
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login?redirect=/checkout');
      return;
    }

    if (user) {
      setCustomerEmail(user.email || '');
      setCustomerName(profile?.full_name || user.user_metadata?.full_name || '');
      setCustomerPhone(user.user_metadata?.phone || '081234567890');
      if (hasPhysicalItems) {
        setShippingAddress('Jl. Boulevard Raya Blok A4 No. 12, Kelapa Gading, Jakarta Utara 14240');
      }
    }
  }, [user, profile, authLoading, router, hasPhysicalItems]);

  const shippingCost = hasPhysicalItems ? 25000 : 0;
  const finalTotal = totalPrice + shippingCost;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (items.length === 0) {
      setErrorMsg('Keranjang belanja Anda kosong.');
      return;
    }

    if (!customerName || !customerEmail) {
      setErrorMsg('Mohon lengkapi nama dan email pemesan.');
      return;
    }

    if (hasPhysicalItems && !shippingAddress.trim()) {
      setErrorMsg('Alamat pengiriman wajib diisi untuk produk fisik.');
      return;
    }

    setSubmitting(true);
    try {
      await StoreService.createOrder({
        userId: user ? user.id : null,
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress: hasPhysicalItems ? shippingAddress : undefined,
        paymentMethod,
        notes,
        items,
        totalAmount: finalTotal,
      });

      // Clear cart and redirect
      clearCart();
      router.push('/orders?success=true');
    } catch (err: any) {
      console.error('Checkout error:', err);
      setErrorMsg(err.message || 'Gagal memproses pesanan. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-white">Tidak Ada Item untuk Di-checkout</h2>
        <p className="mt-2 text-slate-400">Keranjang belanja Anda kosong.</p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-xs font-bold text-slate-950"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Katalog
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 pt-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Link
          href="/cart"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-emerald-400 mb-6 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Keranjang
        </Link>

        <h1 className="text-2xl sm:text-3xl font-black text-white mb-2">Proses Checkout & Pembayaran</h1>
        <p className="text-xs text-slate-400 mb-8">
          Data transaksi akan otomatis tercatat ke dalam tabel Supabase database `orders` & `order_items`.
        </p>

        {errorMsg && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-200">
            <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          {/* Left 2 Columns: Forms */}
          <div className="lg:col-span-2 space-y-8">
            {/* 1. Customer Information */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
              <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-xs">
                  1
                </span>
                Informasi Pelanggan
              </h2>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Nama Lengkap *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                    placeholder="Contoh: Budi Santoso"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Alamat Email (Akses File Digital) *
                  </label>
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                    placeholder="nama@email.com"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Nomor WhatsApp / Telepon
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                    placeholder="08xxxxxxxxxx"
                  />
                </div>
              </div>
            </div>

            {/* 2. Shipping Address (Only if physical products present) */}
            {hasPhysicalItems ? (
              <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
                <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-500/20 text-teal-400 text-xs">
                    2
                  </span>
                  Alamat Pengiriman Produk Fisik
                </h2>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Alamat Lengkap & Kode Pos *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-white focus:border-emerald-500 focus:outline-none"
                    placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan, kecamatan, kota, kode pos..."
                  />
                </div>

                <div className="mt-3">
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Catatan untuk Kurir (Opsional)
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                    placeholder="Contoh: Titipkan di pos satpam bila rumah kosong"
                  />
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border border-emerald-500/20 bg-emerald-950/20 p-5 flex items-center gap-3 text-xs text-emerald-300">
                <Sparkles className="h-5 w-5 shrink-0 text-emerald-400" />
                <span>
                  Semua item dalam pesanan Anda adalah <strong>Produk Digital</strong>. Anda tidak perlu memasukkan alamat fisik, file unduhan akan langsung tersedia seketika!
                </span>
              </div>
            )}

            {/* 3. Payment Method */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
              <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400 text-xs">
                  {hasPhysicalItems ? '3' : '2'}
                </span>
                Metode Pembayaran
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    id: 'QRIS Instant',
                    title: 'QRIS Instant (Semua Bank & E-Wallet)',
                    icon: QrCode,
                    desc: 'BCA, Mandiri, GoPay, OVO, ShopeePay',
                  },
                  {
                    id: 'Virtual Account BCA / Mandiri',
                    title: 'Virtual Account',
                    icon: CreditCard,
                    desc: 'Verifikasi otomatis 24 jam',
                  },
                  {
                    id: 'E-Wallet Transfer',
                    title: 'E-Wallet Direct',
                    icon: Wallet,
                    desc: 'GoPay, DANA, OVO',
                  },
                ].map((method) => {
                  const Icon = method.icon;
                  const isSelected = paymentMethod === method.id;

                  return (
                    <label
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      className={`cursor-pointer rounded-2xl border p-4 flex flex-col justify-between transition ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/10'
                          : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Icon
                            className={`h-5 w-5 ${
                              isSelected ? 'text-emerald-400' : 'text-slate-400'
                            }`}
                          />
                          <div
                            className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                              isSelected ? 'border-emerald-500 bg-emerald-500' : 'border-slate-700'
                            }`}
                          >
                            {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-slate-950" />}
                          </div>
                        </div>
                        <span className="block text-xs font-bold text-white">{method.title}</span>
                      </div>
                      <span className="block text-[10px] text-slate-400 mt-2">{method.desc}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Order Review & Submit */}
          <div>
            <div className="sticky top-28 rounded-3xl border border-slate-800 bg-slate-900/90 p-6 backdrop-blur-xl shadow-2xl space-y-6">
              <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3">
                Rincian Pesanan ({items.length} Item)
              </h3>

              {/* Items Mini List */}
              <div className="max-h-60 overflow-y-auto space-y-3 pr-1 text-xs">
                {items.map(({ product, quantity }) => (
                  <div key={product.id} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <img
                        src={product.image_url}
                        alt={product.title}
                        className="h-10 w-10 shrink-0 rounded-lg object-cover bg-slate-800"
                      />
                      <div className="truncate">
                        <p className="font-semibold text-slate-200 truncate">{product.title}</p>
                        <p className="text-[10px] text-slate-500">
                          {quantity}x {formatRupiah(product.price)}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-white shrink-0">
                      {formatRupiah(product.price * quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Price Calculation */}
              <div className="border-t border-slate-800 pt-4 space-y-2 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Subtotal Produk</span>
                  <span className="font-semibold text-white">{formatRupiah(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Ongkos Kirim Fisik</span>
                  <span className="font-semibold text-white">
                    {hasPhysicalItems ? formatRupiah(shippingCost) : 'Rp 0'}
                  </span>
                </div>
                <div className="border-t border-slate-800 pt-3 flex justify-between text-sm font-black text-white">
                  <span>Total Tagihan</span>
                  <span className="text-xl text-emerald-400">{formatRupiah(finalTotal)}</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-3.5 text-xs sm:text-sm font-bold text-slate-950 shadow-xl shadow-emerald-500/20 hover:bg-emerald-400 transition disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Menyimpan ke Database...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    <span>Bayar Sekarang ({formatRupiah(finalTotal)})</span>
                  </>
                )}
              </button>

              <p className="text-[10px] text-center text-slate-500">
                🔒 Transaksi aman terenkripsi & tercatat ke sistem Supabase PostgreSQL.
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
