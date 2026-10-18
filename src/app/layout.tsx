import type { Metadata } from 'next';
import './globals.css';
import { Suspense } from 'react';
import { AuthProvider } from '../lib/context/AuthContext';
import { CartProvider } from '../lib/context/CartContext';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { ToastNotification } from '../components/Toast';

export const metadata: Metadata = {
  title: 'NEXUSTORE - Katalog & E-Commerce Produk Digital & Fisik',
  description: 'Platform katalog belanja modern untuk produk digital (source code, e-book, preset) dan produk fisik premium terintegrasi Supabase Auth & Database.',
  keywords: 'ecommerce, produk digital, produk fisik, source code, ebook, preset, keychron, supabase, nextjs',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-emerald-500 selection:text-slate-950">
        <AuthProvider>
          <CartProvider>
            <Suspense fallback={<div className="h-20 bg-slate-950 border-b border-slate-800" />}>
              <Navbar />
            </Suspense>
            <main className="flex-1">
              {children}
            </main>
            <Footer />
            <ToastNotification />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
