'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Product, ProductType } from '../lib/supabase/types';
import { StoreService } from '../lib/data/storeService';
import { CATEGORIES } from '../lib/data/mockProducts';
import { ProductCard } from '../components/ProductCard';
import {
  Search,
  Sparkles,
  Package,
  Layers,
  Flame,
  ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';

function CatalogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialType = searchParams.get('type') as ProductType | null;
  const initialCat = searchParams.get('category');

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<ProductType | 'all'>(initialType || 'all');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCat || 'Semua');
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc' | 'rating'>('newest');

  // Synchronize state with URL query parameters
  useEffect(() => {
    setSelectedType(initialType || 'all');
  }, [initialType]);

  useEffect(() => {
    setSelectedCategory(initialCat || 'Semua');
  }, [initialCat]);

  // Load products from Supabase database
  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await StoreService.getProducts();
      setProducts(data);
    } catch (err) {
      console.error('Failed to load products from database:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Filter change handlers that sync with browser URL
  const handleTypeSelect = (type: ProductType | 'all') => {
    setSelectedType(type);
    const params = new URLSearchParams(searchParams.toString());
    if (type === 'all') {
      params.delete('type');
    } else {
      params.set('type', type);
    }
    const newQuery = params.toString();
    router.replace(newQuery ? `/?${newQuery}` : '/', { scroll: false });
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    const params = new URLSearchParams(searchParams.toString());
    if (category === 'Semua') {
      params.delete('category');
    } else {
      params.set('category', category);
    }
    const newQuery = params.toString();
    router.replace(newQuery ? `/?${newQuery}` : '/', { scroll: false });
  };

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchesSearch =
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesType = selectedType === 'all' || p.type === selectedType;
        const matchesCategory = selectedCategory === 'Semua' || p.category === selectedCategory;

        return matchesSearch && matchesType && matchesCategory;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'rating') return b.rating - a.rating;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [products, searchQuery, selectedType, selectedCategory, sortBy]);

  const featuredProducts = useMemo(() => {
    return products.filter((p) => p.is_featured).slice(0, 4);
  }, [products]);

  return (
    <div className="min-h-screen pb-20">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden border-b border-slate-800/80 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 pt-12 pb-20 sm:pt-20 sm:pb-28">
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-emerald-500/10 blur-[130px] rounded-full" />
        <div className="pointer-events-none absolute top-40 right-10 w-[400px] h-[250px] bg-teal-500/10 blur-[120px] rounded-full" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-400 mb-6 backdrop-blur-md">
            <Sparkles className="h-4 w-4" />
            <span>Koleksi Terkurasi: Digital Source & Hardware Fisik Premium</span>
          </div>

          <h1 className="text-4xl font-black tracking-tight sm:text-6xl text-white max-w-4xl mx-auto leading-tight">
            Etalase Produk Digital & Fisik Terintegrasi{' '}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
              Supabase Auth & Database
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Dapatkan source code siap deploy, e-book praktisi, dan aset kreatif berunduhan langsung, serta perangkat keras dan perlengkapan meja kerja terbaik dengan jaminan keamanan transaksi penuh.
          </p>

          <div className="mt-10 mx-auto max-w-2xl">
            <div className="relative flex items-center rounded-2xl border border-slate-700/80 bg-slate-900/90 p-2 shadow-2xl backdrop-blur-xl focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
              <Search className="ml-3 h-5 w-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari produk: misal 'Next.js', 'Mechanical Keyboard', 'Lightroom'..."
                className="w-full bg-transparent px-4 py-2.5 text-sm sm:text-base text-white placeholder-slate-400 focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="mr-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">Populer:</span>
            {['Next.js 15', 'Mechanical Keyboard', 'E-Book', 'Figma', 'Lightroom'].map((tag) => (
              <button
                key={tag}
                onClick={() => setSearchQuery(tag)}
                className="rounded-lg border border-slate-800 bg-slate-900/60 px-2.5 py-1 text-slate-300 hover:border-emerald-500/40 hover:text-emerald-400 transition"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED HIGHLIGHTS */}
      {!searchQuery && selectedCategory === 'Semua' && selectedType === 'all' && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-10 mb-16 relative z-10">
          <div className="rounded-3xl border border-slate-800/80 bg-slate-900/90 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400">
                  <Flame className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Produk Unggulan</h2>
                  <p className="text-xs text-slate-400">Rekomendasi terbaik pilihan komunitas pengembang dan kreator</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* MAIN CATALOG SECTION */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between border-b border-slate-800 pb-6 mb-8">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
            <button
              onClick={() => handleTypeSelect('all')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold transition whitespace-nowrap ${
                selectedType === 'all'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'border border-slate-800 bg-slate-900/60 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Layers className="h-4 w-4" />
              Semua Jenis ({products.length})
            </button>

            <button
              onClick={() => handleTypeSelect('digital')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold transition whitespace-nowrap ${
                selectedType === 'digital'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'border border-slate-800 bg-slate-900/60 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Sparkles className="h-4 w-4 text-emerald-400 group-hover:text-slate-950" />
              Produk Digital ({products.filter((p) => p.type === 'digital').length})
            </button>

            <button
              onClick={() => handleTypeSelect('physical')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold transition whitespace-nowrap ${
                selectedType === 'physical'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'border border-slate-800 bg-slate-900/60 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Package className="h-4 w-4 text-teal-400 group-hover:text-slate-950" />
              Produk Fisik ({products.filter((p) => p.type === 'physical').length})
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-medium whitespace-nowrap">Urutkan:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs sm:text-sm font-medium text-slate-200 focus:border-emerald-500 focus:outline-none"
            >
              <option value="newest">Terbaru</option>
              <option value="price-asc">Harga Terendah</option>
              <option value="price-desc">Harga Tertinggi</option>
              <option value="rating">Rating Tertinggi</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 text-xs scrollbar-none">
          <span className="text-slate-400 font-medium whitespace-nowrap mr-2">Kategori:</span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategorySelect(cat)}
              className={`rounded-lg px-3 py-1.5 font-medium transition whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                  : 'border border-slate-800/80 bg-slate-900/40 text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 py-12">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div
                key={n}
                className="h-96 rounded-2xl border border-slate-800 bg-slate-900/40 animate-pulse p-4"
              />
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-6">
              <p>
                Menampilkan <strong className="text-white">{filteredProducts.length}</strong> produk
                {selectedCategory !== 'Semua' && ` di kategori "${selectedCategory}"`}
                {selectedType !== 'all' && ` jenis ${selectedType}`}
                {searchQuery && ` untuk pencarian "${searchQuery}"`}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-800 bg-slate-900/30 py-20 px-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800/80 text-slate-400 mb-4">
              <Search className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-white">Tidak ada produk yang cocok</h3>
            <p className="mt-2 text-sm text-slate-400 max-w-md">
              Coba gunakan kata kunci pencarian yang berbeda atau hapus filter kategori & jenis produk yang dipilih.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                handleTypeSelect('all');
                handleCategorySelect('Semua');
              }}
              className="mt-6 rounded-xl bg-emerald-500 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition"
            >
              Reset Semua Filter
            </button>
          </div>
        )}
      </section>

      {/* TECH ARCHITECTURE CALLOUT */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-24">
        <div className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-indigo-950/40 p-8 sm:p-12">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-400 mb-4">
              <ShieldCheck className="h-4 w-4" />
              Keamanan Data & Performa Tinggi
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Ditenagai Next.js App Router & Supabase PostgreSQL
            </h2>
            <p className="mt-3 text-sm text-slate-300 leading-relaxed">
              Dilengkapi skrip skema database lengkap, autentikasi sesi terproteksi, Row Level Security (RLS) untuk memisahkan hak akses pelanggan dan admin, serta sinkronisasi keranjang belanja instan.
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition shadow-lg shadow-emerald-500/20"
              >
                Buka Panel Admin &rarr;
              </Link>
              <Link
                href="/cart"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition"
              >
                Cek Keranjang Belanja
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-400 text-sm">Memuat etalase toko...</div>}>
      <CatalogContent />
    </Suspense>
  );
}
