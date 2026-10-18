'use client';

import React, { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../lib/context/AuthContext';
import {
  Layers,
  Lock,
  Mail,
  User,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Eye,
  EyeOff,
  MailCheck,
  ShieldCheck,
  Check,
  X,
  Sparkles,
} from 'lucide-react';

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';

  const { signUp, isConfigured } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [isSuccess, setIsSuccess] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  // Email format validation helper
  const isValidEmail = (val: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  };

  // Password strength calculation
  const passwordStrength = useMemo(() => {
    if (!password) return { score: 0, label: '', color: 'bg-slate-700' };
    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 1) return { score: 1, label: 'Lemah', color: 'bg-red-500', textColor: 'text-red-400' };
    if (score === 2) return { score: 2, label: 'Cukup', color: 'bg-amber-500', textColor: 'text-amber-400' };
    if (score === 3) return { score: 3, label: 'Bagus', color: 'bg-teal-500', textColor: 'text-teal-400' };
    return { score: 4, label: 'Sangat Kuat', color: 'bg-emerald-500', textColor: 'text-emerald-400' };
  }, [password]);

  // Client-side validation prior to sending to Supabase
  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!fullName.trim()) {
      errors.fullName = 'Nama lengkap wajib diisi.';
    } else if (fullName.trim().length < 2) {
      errors.fullName = 'Nama lengkap minimal 2 karakter.';
    }

    if (!email.trim()) {
      errors.email = 'Alamat email wajib diisi.';
    } else if (!isValidEmail(email)) {
      errors.email = 'Format alamat email tidak valid (contoh: budi@gmail.com).';
    }

    if (!password) {
      errors.password = 'Kata sandi wajib diisi.';
    } else if (password.length < 6) {
      errors.password = 'Kata sandi minimal 6 karakter.';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Konfirmasi kata sandi wajib diisi.';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Kata sandi dan konfirmasi kata sandi tidak cocok.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const result = await signUp(email.trim(), password, fullName.trim());

      if (result.error) {
        setErrorMessage(result.error.message);
        setLoading(false);
        return;
      }

      if (result.needsEmailConfirmation) {
        // Supabase has email confirmation enabled
        setNeedsConfirmation(true);
        setLoading(false);
      } else {
        // Auto-confirmed or demo login
        setIsSuccess(true);
        setTimeout(() => {
          router.push(redirectUrl);
        }, 1200);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Terjadi kesalahan sistem saat menghubungi Supabase.');
      setLoading(false);
    }
  };

  // State: Email Confirmation Required by Supabase
  if (needsConfirmation) {
    return (
      <div className="w-full max-w-md space-y-6 animate-in fade-in zoom-in-95 duration-300">
        <div className="rounded-3xl border border-emerald-500/30 bg-slate-900/90 p-8 backdrop-blur-xl shadow-2xl text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 shadow-xl shadow-emerald-500/20">
            <MailCheck className="h-8 w-8" />
          </div>

          <h2 className="text-2xl font-black text-white">
            Konfirmasi Email Anda
          </h2>

          <p className="mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
            Akun Anda berhasil didaftarkan di Supabase Auth! Kami telah mengirimkan tautan konfirmasi ke alamat email:
          </p>

          <div className="my-4 rounded-xl bg-slate-950 border border-slate-800 p-3 text-sm font-semibold text-emerald-400 font-mono break-all">
            {email}
          </div>

          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            Silakan buka email Anda (cek juga folder <span className="text-slate-300 font-medium">Spam/Junk</span> jika tidak ada di Inbox) dan klik tombol verifikasi untuk mengaktifkan akun Anda sebelum masuk.
          </p>

          <div className="space-y-3">
            <Link
              href={`/auth/login?email=${encodeURIComponent(email)}&redirect=${encodeURIComponent(redirectUrl)}`}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-3.5 text-xs sm:text-sm font-bold text-slate-950 shadow-xl shadow-emerald-500/20 hover:bg-emerald-400 transition"
            >
              <span>Lanjut ke Halaman Masuk</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <button
              type="button"
              onClick={() => {
                setNeedsConfirmation(false);
                setPassword('');
                setConfirmPassword('');
              }}
              className="w-full text-xs text-slate-400 hover:text-white transition py-2"
            >
              Daftar dengan Email Lain
            </button>
          </div>
        </div>
      </div>
    );
  }

  // State: Instant Success
  if (isSuccess) {
    return (
      <div className="w-full max-w-md space-y-6 text-center animate-in fade-in zoom-in-95 duration-300">
        <div className="rounded-3xl border border-emerald-500/30 bg-slate-900/90 p-8 backdrop-blur-xl shadow-2xl">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500 text-slate-950 shadow-xl shadow-emerald-500/20">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-black text-white">Pendaftaran Berhasil!</h2>
          <p className="mt-2 text-xs text-slate-300">
            Akun Anda telah aktif dan siap digunakan. Mengalihkan Anda...
          </p>
          <div className="mt-6 flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-400" />
          </div>
        </div>
      </div>
    );
  }

  const isEmailAlreadyRegistered = errorMessage?.toLowerCase().includes('sudah terdaftar');

  return (
    <div className="w-full max-w-md space-y-7">
      {/* Brand Header */}
      <div className="text-center">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-3 group">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 font-black shadow-xl shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <Layers className="h-6 w-6" />
          </div>
          <span className="text-2xl font-black text-white tracking-wide">
            NEXU<span className="text-emerald-400">STORE</span>
          </span>
        </Link>
        <h2 className="text-2xl font-black tracking-tight text-white">
          Buat Akun Pembeli Baru
        </h2>
        <p className="mt-1.5 text-xs text-slate-400">
          Daftar sekarang untuk checkout produk digital & fisik serta akses riwayat unduhan
        </p>

        {/* Backend Indicator Badge */}
        <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-900/80 px-3 py-1 text-[11px] font-medium text-slate-400">
          <span className={`h-2 w-2 rounded-full ${isConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
          <span>{isConfigured ? 'Terhubung ke Supabase Auth' : 'Mode Offline / Demo'}</span>
        </div>
      </div>

      {/* Main Registration Card */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        {/* Glow Accent */}
        <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        {/* Prominent Error Message Card */}
        {errorMessage && (
          <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-200 animate-in fade-in duration-200">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1 space-y-1">
                <p className="font-semibold text-red-300">Pendaftaran Tidak Berhasil</p>
                <p className="text-slate-300 leading-relaxed">{errorMessage}</p>

                {isEmailAlreadyRegistered && (
                  <div className="mt-3 pt-2.5 border-t border-red-500/20">
                    <Link
                      href={`/auth/login?email=${encodeURIComponent(email)}&redirect=${encodeURIComponent(redirectUrl)}`}
                      className="inline-flex items-center gap-1.5 font-bold text-emerald-400 hover:text-emerald-300 underline"
                    >
                      <span>Masuk ke Akun Anda Sekarang</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Nama Lengkap
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (fieldErrors.fullName) {
                    setFieldErrors((prev) => ({ ...prev, fullName: '' }));
                  }
                }}
                disabled={loading}
                placeholder="Contoh: Budi Santoso"
                className={`w-full rounded-xl border bg-slate-950 py-2.5 pl-10 pr-3 text-xs sm:text-sm text-white placeholder-slate-600 transition focus:outline-none ${
                  fieldErrors.fullName
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-slate-800 focus:border-emerald-500'
                }`}
              />
            </div>
            {fieldErrors.fullName && (
              <p className="mt-1 text-[11px] text-red-400 flex items-center gap-1">
                <AlertCircle className="h-3 w-3 shrink-0" />
                <span>{fieldErrors.fullName}</span>
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Alamat Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) {
                    setFieldErrors((prev) => ({ ...prev, email: '' }));
                  }
                }}
                disabled={loading}
                placeholder="nama@email.com"
                className={`w-full rounded-xl border bg-slate-950 py-2.5 pl-10 pr-3 text-xs sm:text-sm text-white placeholder-slate-600 transition focus:outline-none ${
                  fieldErrors.email
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-slate-800 focus:border-emerald-500'
                }`}
              />
            </div>
            {fieldErrors.email && (
              <p className="mt-1 text-[11px] text-red-400 flex items-center gap-1">
                <AlertCircle className="h-3 w-3 shrink-0" />
                <span>{fieldErrors.email}</span>
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Kata Sandi
              </label>
              {password && (
                <span className={`text-[11px] font-semibold ${passwordStrength.textColor}`}>
                  Kekuatan: {passwordStrength.label}
                </span>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) {
                    setFieldErrors((prev) => ({ ...prev, password: '' }));
                  }
                }}
                disabled={loading}
                placeholder="Minimal 6 karakter"
                className={`w-full rounded-xl border bg-slate-950 py-2.5 pl-10 pr-10 text-xs sm:text-sm text-white placeholder-slate-600 transition focus:outline-none ${
                  fieldErrors.password
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-slate-800 focus:border-emerald-500'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 transition"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {/* Strength Bar */}
            {password && (
              <div className="mt-2 flex gap-1 h-1">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`h-full flex-1 rounded-full transition-all duration-300 ${
                      step <= passwordStrength.score ? passwordStrength.color : 'bg-slate-800'
                    }`}
                  />
                ))}
              </div>
            )}

            {fieldErrors.password && (
              <p className="mt-1 text-[11px] text-red-400 flex items-center gap-1">
                <AlertCircle className="h-3 w-3 shrink-0" />
                <span>{fieldErrors.password}</span>
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Konfirmasi Kata Sandi
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (fieldErrors.confirmPassword) {
                    setFieldErrors((prev) => ({ ...prev, confirmPassword: '' }));
                  }
                }}
                disabled={loading}
                placeholder="Ketik ulang kata sandi Anda"
                className={`w-full rounded-xl border bg-slate-950 py-2.5 pl-10 pr-10 text-xs sm:text-sm text-white placeholder-slate-600 transition focus:outline-none ${
                  fieldErrors.confirmPassword
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-slate-800 focus:border-emerald-500'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex={-1}
                className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 transition"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {confirmPassword && password && (
              <div className="mt-1 flex items-center gap-1 text-[11px]">
                {confirmPassword === password ? (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <Check className="h-3 w-3" /> Kata sandi cocok
                  </span>
                ) : (
                  <span className="text-red-400 flex items-center gap-1">
                    <X className="h-3 w-3" /> Kata sandi belum cocok
                  </span>
                )}
              </div>
            )}

            {fieldErrors.confirmPassword && (
              <p className="mt-1 text-[11px] text-red-400 flex items-center gap-1">
                <AlertCircle className="h-3 w-3 shrink-0" />
                <span>{fieldErrors.confirmPassword}</span>
              </p>
            )}
          </div>

          {/* Requirements Hint */}
          <div className="rounded-xl bg-slate-950/60 border border-slate-800/80 p-3 text-[11px] text-slate-400 space-y-1">
            <div className="flex items-center gap-1.5 font-medium text-slate-300">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>Persyaratan Pendaftaran:</span>
            </div>
            <ul className="list-disc list-inside space-y-0.5 text-slate-400 pl-1">
              <li>Email valid untuk notifikasi pesanan & link unduhan produk digital</li>
              <li>Kata sandi minimal 6 karakter</li>
            </ul>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-3.5 text-xs sm:text-sm font-bold text-slate-950 shadow-xl shadow-emerald-500/20 hover:bg-emerald-400 active:scale-[0.99] transition disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Mendaftarkan ke Supabase Auth...</span>
              </>
            ) : (
              <>
                <span>Daftar Sekarang</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Link to Login */}
        <div className="mt-6 text-center text-xs text-slate-400">
          Sudah memiliki akun?{' '}
          <Link
            href={`/auth/login?redirect=${encodeURIComponent(redirectUrl)}`}
            className="font-bold text-emerald-400 hover:text-emerald-300 underline"
          >
            Masuk di sini
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Suspense fallback={<div className="text-slate-400 text-sm">Memuat form pendaftaran...</div>}>
        <RegisterContent />
      </Suspense>
    </div>
  );
}
