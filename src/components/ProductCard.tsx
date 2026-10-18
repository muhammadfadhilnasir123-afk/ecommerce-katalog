'use client';

import React from 'react';
import Link from 'next/link';
import { Product } from '../lib/supabase/types';
import { useCart } from '../lib/context/CartContext';
import { formatRupiah } from '../lib/utils';
import {
  Sparkles,
  Package,
  ShoppingCart,
  Star,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const isDigital = product.type === 'digital';

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/40 hover:shadow-xl hover:shadow-emerald-500/5">
      {/* Top Image & Badges */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-800">
        <img
          src={product.image_url}
          alt={product.title}
          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-60" />

        {/* Product Type Badge */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {isDigital ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/90 px-2.5 py-1 text-[11px] font-bold text-slate-950 shadow-md backdrop-blur-md">
              <Sparkles className="h-3 w-3" />
              Digital Instan
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-teal-500/90 px-2.5 py-1 text-[11px] font-bold text-slate-950 shadow-md backdrop-blur-md">
              <Package className="h-3 w-3" />
              Produk Fisik
            </span>
          )}

          {product.is_featured && (
            <span className="inline-flex items-center rounded-full bg-amber-500/90 px-2 py-0.5 text-[10px] font-bold text-slate-950 shadow">
              Pilihan
            </span>
          )}
        </div>

        {/* Stock / Download status indicator */}
        <div className="absolute bottom-2.5 left-3 text-[11px] font-medium text-slate-300">
          {isDigital ? (
            <span className="inline-flex items-center gap-1 text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" />
              File Unduhan Langsung
            </span>
          ) : (
            <span className="text-slate-300">
              Stok: <strong className="text-white">{product.stock}</strong> unit
            </span>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="flex flex-1 flex-col p-5">
        {/* Category & Rating */}
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span className="rounded-md bg-slate-800/80 px-2 py-0.5 text-[11px] font-medium text-slate-300">
            {product.category}
          </span>
          <div className="flex items-center gap-1 text-amber-400 font-semibold">
            <Star className="h-3.5 w-3.5 fill-amber-400" />
            <span>{product.rating}</span>
            <span className="text-slate-500 text-[10px]">({product.reviews_count})</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-white line-clamp-2 hover:text-emerald-400 transition-colors">
          <Link href={`/products/${product.id}`}>{product.title}</Link>
        </h3>

        {/* Short description */}
        <p className="mt-2 text-xs text-slate-400 line-clamp-2 leading-relaxed">
          {product.description}
        </p>

        {/* Price & Action Button */}
        <div className="mt-5 pt-4 border-t border-slate-800/60 flex items-center justify-between gap-2">
          <div>
            <span className="block text-[10px] text-slate-400 uppercase tracking-wider">Harga</span>
            <span className="text-lg font-black text-emerald-400 tracking-tight">
              {formatRupiah(product.price)}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Link
              href={`/products/${product.id}`}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-800/50 text-slate-300 hover:bg-slate-800 hover:text-white transition"
              title="Lihat Detail Produk"
            >
              <ArrowRight className="h-4 w-4" />
            </Link>

            <button
              onClick={() => addToCart(product, 1)}
              className="flex h-9 items-center gap-1.5 rounded-xl bg-emerald-500 px-3.5 text-xs font-bold text-slate-950 shadow-md shadow-emerald-500/10 hover:bg-emerald-400 hover:shadow-emerald-500/25 transition active:scale-95"
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              <span>Beli</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
