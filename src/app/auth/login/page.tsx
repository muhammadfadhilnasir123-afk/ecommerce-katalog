'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../lib/context/AuthContext';
import {
  Layers,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Loader2,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';
  const emailParam = searchParams.get('email') || '';

  const { signIn, demoSignIn } = useAuth();
  const [email, setEmail] = useState(emailParam);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const { error } = await signIn(email, password);
      if (error) {
        setErrorMessage(error.message);
      } else {
        router.push(redirectUrl);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Terjadi kesalahan saat masuk.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (role: 'customer' | 'admin') => {
    demoSignIn(role);
    router.push(role === 'admin' ? '/admin' : redirectUrl);
  };

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-4 group">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 font-black shadow-xl shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <Layers className="h-6 w-6" />
          </div>
          <span className="text-2xl font-black text-white">
            NEXU<span className="text-emerald-400">STORE</span>
          </span>
        </Link>
        <h2 className="text-2xl font-black tracking-tight text-white">
          Masuk ke Akun Anda
        </h2>
        <p className="mt-2 text-xs text-slate-400">
          Terhubung langsung dengan Supabase Auth untuk perlindungan data Anda
        </p>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 backdrop-blur-md">
        <span className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2">
          🚀 Masuk Cepat Sekali Klik (Demo Testing):
        </span>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleQuickDemo('customer')}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs font-semibold text-emerald-400 hover:bg-slate-700 hover:text-emerald-300 transition"
          >
            <UserCheck className="h-4 w-4" />
            <span>Login Pembeli</span>
          </button>
          <button
            type="button"
            onClick={() => handleQuickDemo('admin')}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs font-semibold text-indigo-400 hover:bg-slate-700 hover:text-indigo-300 transition"
          >
            <ShieldCheck className="h-4 w-4" />
            <span>Login Admin</span>
          </button>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        {errorMessage && (
          <div className="mb-6 flex items-center gap-2.5 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-200">
            <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Alamat Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 pl-10 pr-3 text-xs text-white placeholder-slate-600 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Kata Sandi (Password)
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 pl-10 pr-3 text-xs text-white placeholder-slate-600 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-3.5 text-xs sm:text-sm font-bold text-slate-950 shadow-xl shadow-emerald-500/20 hover:bg-emerald-400 transition disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Memverifikasi...</span>
              </>
            ) : (
              <>
                <span>Masuk Sekarang</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400">
          Belum memiliki akun?{' '}
          <Link
            href={`/auth/register?redirect=${redirectUrl}`}
            className="font-bold text-emerald-400 hover:text-emerald-300 underline"
          >
            Daftar Akun Baru
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Suspense fallback={<div className="text-slate-400 text-sm">Memuat form login...</div>}>
        <LoginContent />
      </Suspense>
    </div>
  );
}
