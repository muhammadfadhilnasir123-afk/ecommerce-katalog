'use client';

import React, { useEffect, useState } from 'react';
import { StoreService } from '../../../lib/data/storeService';
import { Product, ProductType } from '../../../lib/supabase/types';
import { CATEGORIES } from '../../../lib/data/mockProducts';
import { formatRupiah } from '../../../lib/utils';
import {
  Plus,
  Edit2,
  Trash2,
  Sparkles,
  Package,
  Search,
  X,
  CheckCircle2,
  UploadCloud,
  Loader2,
} from 'lucide-react';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<ProductType | 'all'>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [formData, setFormData] = useState({
    title: '',
    price: 0,
    type: 'digital' as ProductType,
    category: 'Source Code & Template',
    image_url: '',
    file_url: '',
    stock: 9999,
    description: '',
    is_featured: false,
  });

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await StoreService.getProducts();
      setProducts(data);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      title: '',
      price: 150000,
      type: 'digital',
      category: 'Source Code & Template',
      image_url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1000&auto=format&fit=crop',
      file_url: 'https://example.com/asset-download.zip',
      stock: 9999,
      description: '',
      is_featured: false,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      title: product.title,
      price: product.price,
      type: product.type,
      category: product.category,
      image_url: product.image_url,
      file_url: product.file_url || '',
      stock: product.stock,
      description: product.description,
      is_featured: product.is_featured,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (productId: string, title: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus produk "${title}"?`)) {
      try {
        await StoreService.deleteProduct(productId);
        await loadProducts();
      } catch (err) {
        console.error('Failed to delete product:', err);
      }
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await StoreService.saveProduct({
        id: editingProduct?.id,
        title: formData.title,
        price: Number(formData.price),
        type: formData.type,
        category: formData.category,
        image_url: formData.image_url,
        file_url: formData.type === 'digital' ? formData.file_url : null,
        stock: formData.type === 'digital' ? 9999 : Number(formData.stock),
        description: formData.description,
        is_featured: formData.is_featured,
      });

      setIsModalOpen(false);
      await loadProducts();
    } catch (err: any) {
      alert('Gagal menyimpan produk: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || p.type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white">Kelola Katalog Produk</h2>
          <p className="text-xs text-slate-400 mt-1">
            Tambah, edit, atau hapus produk digital (source code, e-book) dan produk fisik
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah Produk Baru</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2 text-xs font-semibold">
          <button
            onClick={() => setSelectedType('all')}
            className={`rounded-xl px-3 py-1.5 transition ${
              selectedType === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            Semua ({products.length})
          </button>
          <button
            onClick={() => setSelectedType('digital')}
            className={`rounded-xl px-3 py-1.5 transition ${
              selectedType === 'digital'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            Digital ({products.filter((p) => p.type === 'digital').length})
          </button>
          <button
            onClick={() => setSelectedType('physical')}
            className={`rounded-xl px-3 py-1.5 transition ${
              selectedType === 'physical'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            Fisik ({products.filter((p) => p.type === 'physical').length})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari judul produk..."
            className="w-full rounded-xl border border-slate-800 bg-slate-900 py-1.5 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="h-64 rounded-3xl bg-slate-900/40 animate-pulse" />
      ) : (
        <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 bg-slate-950/40 text-[11px] uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="py-4 px-6 font-semibold">Produk</th>
                  <th className="py-4 px-4 font-semibold">Tipe</th>
                  <th className="py-4 px-4 font-semibold">Kategori</th>
                  <th className="py-4 px-4 font-semibold">Harga</th>
                  <th className="py-4 px-4 font-semibold">Stok / Format</th>
                  <th className="py-4 px-6 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredProducts.map((product) => {
                  const isDigital = product.type === 'digital';

                  return (
                    <tr key={product.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.image_url}
                            alt={product.title}
                            className="h-12 w-12 rounded-xl object-cover bg-slate-800 shrink-0"
                          />
                          <div>
                            <span className="font-bold text-white block hover:text-indigo-400 transition">
                              {product.title}
                            </span>
                            <span className="text-[10px] text-slate-400 line-clamp-1 max-w-xs">
                              {product.description}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
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
                      </td>

                      <td className="py-4 px-4 text-slate-300 font-medium">{product.category}</td>

                      <td className="py-4 px-4 font-black text-emerald-400">
                        {formatRupiah(product.price)}
                      </td>

                      <td className="py-4 px-4 text-slate-300">
                        {isDigital ? (
                          <span className="text-emerald-400 text-[11px] font-medium">Download URL</span>
                        ) : (
                          <span>{product.stock} unit</span>
                        )}
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditModal(product)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
                            title="Edit Produk"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id, product.title)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition"
                            title="Hapus Produk"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Product Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-2xl rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
              <h3 className="text-lg font-bold text-white">
                {editingProduct ? 'Edit Informasi Produk' : 'Tambah Produk Baru ke Katalog'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-300 mb-1">Judul Produk *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Contoh: Modern React Boilerplate / Mechanical Keyboard"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Tipe Produk *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as ProductType })}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="digital">Digital (E-Book, Template, Preset, Unduhan)</option>
                    <option value="physical">Fisik (Barang Dikirim)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">Kategori *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white focus:border-indigo-500 focus:outline-none"
                  >
                    {CATEGORIES.filter((c) => c !== 'Semua').map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Harga (Rupiah) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                {formData.type === 'physical' ? (
                  <div>
                    <label className="block font-medium text-slate-300 mb-1">Stok Fisik Tersedia *</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block font-medium text-slate-300 mb-1">
                      Tautan Unduh File Digital (URL) *
                    </label>
                    <input
                      type="url"
                      required
                      value={formData.file_url}
                      onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
                      placeholder="https://example.com/asset-download.zip"
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">URL Gambar Produk *</label>
                <input
                  type="url"
                  required
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Deskripsi Lengkap *</label>
                <textarea
                  rows={4}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Jelaskan fitur, spesifikasi, dan keunggulan produk ini..."
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="is_featured"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="is_featured" className="text-slate-300 font-medium">
                  Tampilkan sebagai Produk Unggulan di Halaman Utama
                </label>
              </div>

              <div className="border-t border-slate-800 pt-5 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Menyimpan ke Supabase...</span>
                    </>
                  ) : (
                    <span>Simpan Produk</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
