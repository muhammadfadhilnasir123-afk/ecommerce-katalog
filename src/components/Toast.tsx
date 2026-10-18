'use client';

import React from 'react';
import { useCart } from '../lib/context/CartContext';
import { CheckCircle2, X, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export const ToastNotification: React.FC = () => {
  const { notification, dismissNotification } = useCart();

  if (!notification) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md animate-bounce-in">
      <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-slate-900/95 p-4 text-white shadow-2xl backdrop-blur-xl">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <div className="flex-1 pr-2">
          <p className="text-sm font-medium text-slate-100">{notification}</p>
          <Link
            href="/cart"
            onClick={dismissNotification}
            className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            Buka Keranjang Belanja &rarr;
          </Link>
        </div>
        <button
          onClick={dismissNotification}
          className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
