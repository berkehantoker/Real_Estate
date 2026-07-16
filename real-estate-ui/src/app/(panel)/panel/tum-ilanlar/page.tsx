"use client";

import { useEffect, useState } from 'react';
import { getAllProductsWithDetailsAPI, deleteProductAPI } from '../../../../services/productService';
import { FiTrash2, FiExternalLink, FiBox, FiSearch, FiMapPin, FiChevronLeft, FiChevronRight, FiCheckCircle, FiClock, FiUser } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface Product {
  productId: number;
  title: string;
  price: number;
  city: string;
  district: string;
  categoryName: string;
  type: string;
  coverImage?: string;
  isActive?: boolean;
  appUserName?: string;
  appUserSurname?: string;
  AppUserName?: string;
  AppUserSurname?: string;
  agentName?: string;
  appUser?: { name?: string; surname?: string };
}

export default function AllProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ============================================================================
  // YENİ STATE'LER: Arama ve Sayfalama
  // ============================================================================
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getAllProductsWithDetailsAPI();
        setProducts(data);
      } catch (error) {
        console.error("İlanlar yüklenemedi", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleDelete = async (id: number, title: string) => {
    if (window.confirm(`'${title}' başlıklı ilanı sistemden TAMAMEN silmek istediğinize emin misiniz?`)) {
      try {
        await deleteProductAPI(id);
        setProducts(prev => prev.filter(p => p.productId !== id));
      } catch (error) {
        toast.error("Silme işlemi başarısız oldu.");
      }
    }
  };

  // ============================================================================
  // ARAMA VE SAYFALAMA LOGIC'I
  // ============================================================================
  const filteredProducts = products.filter((item) => {
    const searchLower = searchTerm.toLowerCase();
    if (!searchLower) return true;
    const ownerName = `${item.appUserName || ''} ${item.appUserSurname || ''}`.toLowerCase();
    const statusText = item.isActive ? 'yayında aktif' : 'pasif beklemede';
    return (
      item.title?.toLowerCase().includes(searchLower) ||
      item.city?.toLowerCase().includes(searchLower) ||
      item.district?.toLowerCase().includes(searchLower) ||
      item.categoryName?.toLowerCase().includes(searchLower) ||
      item.type?.toLowerCase().includes(searchLower) ||
      ownerName.includes(searchLower) ||
      statusText.includes(searchLower)
    );
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const currentProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto pb-20">
      
      {/* ═══════════ ÜST BAR ═══════════ */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-amber-50 rounded-xl flex items-center justify-center text-xl">
            📦
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              Tüm İlanlar <span className="text-xs font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">Admin</span>
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="bg-amber-50 text-amber-700 font-bold text-sm px-3 py-1 rounded-full">
                {filteredProducts.length} İlan
              </span>
              {searchTerm && (
                <span className="text-xs text-gray-400">
                  "{searchTerm}" için filtrelendi
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════ ARAMA KUTUSU ═══════════ */}
      <div className="relative w-full max-w-md mb-6">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <FiSearch className="text-gray-400 text-lg" />
        </div>
        <input
          type="text"
          placeholder="İlan başlığı, şehir, ilçe, emlakçı veya durum ara..."
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all placeholder:text-gray-400"
        />
        {searchTerm && (
          <button
            onClick={() => { setSearchTerm(''); setCurrentPage(1); }}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-red-500 transition-colors text-sm font-medium"
          >
            Temizle
          </button>
        )}
      </div>

      {/* ═══════════ İLAN TABLOSU ═══════════ */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-gray-500 font-medium">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin"></div>
              <span>İlanlar yükleniyor...</span>
            </div>
          </div>
        ) : currentProducts.length === 0 ? (
          <div className="p-16 text-center">
            <div className="text-gray-300 mb-4 text-6xl flex justify-center">
              {searchTerm ? <FiSearch /> : <FiBox />}
            </div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">
              {searchTerm ? 'Sonuç Bulunamadı' : 'Henüz Hiç İlan Yok'}
            </h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              {searchTerm
                ? `"${searchTerm}" kriterine uygun ilan bulunamadı. Farklı bir arama deneyin.`
                : 'Sistemde henüz hiç ilan bulunmuyor.'}
            </p>
            {searchTerm && (
              <button
                onClick={() => { setSearchTerm(''); setCurrentPage(1); }}
                className="text-amber-600 font-bold hover:underline"
              >
                Aramayı Temizle
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="p-5 font-bold text-gray-600 text-sm uppercase tracking-wider">İlan</th>
                  <th className="p-5 font-bold text-gray-600 text-sm uppercase tracking-wider">Kategori / Tip</th>
                  <th className="p-5 font-bold text-gray-600 text-sm uppercase tracking-wider">Emlakçı</th>
                  <th className="p-5 font-bold text-gray-600 text-sm uppercase tracking-wider">Fiyat</th>
                  <th className="p-5 font-bold text-gray-600 text-sm uppercase tracking-wider">Durum</th>
                  <th className="p-5 font-bold text-gray-600 text-sm uppercase tracking-wider text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentProducts.map((product, idx) => (
                  <tr key={product.productId} className={`transition-colors hover:bg-gray-50/80 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 shadow-sm">
                          <img
                            src={product.coverImage || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=200&q=80'}
                            alt="Kapak"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-gray-900 line-clamp-1 text-sm" title={product.title}>
                            {product.title}
                          </div>
                          <p className="text-gray-400 text-xs flex items-center gap-1 mt-0.5">
                            <FiMapPin className="text-gray-400 flex-shrink-0" /> 
                            <span className="truncate">{product.city}, {product.district}</span>
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-semibold bg-gray-100 px-2 py-0.5 rounded-md text-gray-600 w-max">{product.categoryName || '—'}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full w-max ${
                          product.type === 'Kiralık' 
                            ? 'bg-orange-50 text-orange-600' 
                            : 'bg-blue-50 text-blue-600'
                        }`}>
                          {product.type}
                        </span>
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="flex items-center gap-1.5 text-sm text-gray-500">
                        <FiUser className="text-gray-400 text-xs" />
                        <span>
                          {(() => {
                            const name = product.appUserName || product.AppUserName || product.agentName || product?.appUser?.name || '';
                            const surname = product.appUserSurname || product.AppUserSurname || product?.appUser?.surname || '';
                            const fullName = `${name} ${surname}`.trim();
                            return fullName || 'Sistem / Admin';
                          })()}
                        </span>
                      </div>
                    </td>
                    <td className="p-5 font-extrabold text-gray-900 text-sm">
                      {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(product.price)}
                    </td>
                    <td className="p-5">
                      {product.isActive ? (
                        <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 w-max">
                          <FiCheckCircle className="w-3 h-3" /> Yayında
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 w-max">
                          <FiClock className="w-3 h-3" /> Pasif
                        </span>
                      )}
                    </td>
                    <td className="p-5">
                      <div className="flex items-center justify-end gap-2">
                        <a 
                          href={`/ilan/${product.productId}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="p-2 text-blue-500 bg-blue-50 rounded-lg hover:bg-blue-600 hover:text-white transition-all border border-blue-100"
                          title="İlanı Görüntüle"
                        >
                          <FiExternalLink className="text-sm" />
                        </a>
                        <button 
                          onClick={() => handleDelete(product.productId, product.title)}
                          className="p-2 text-red-500 bg-red-50 rounded-lg hover:bg-red-600 hover:text-white transition-all border border-red-100"
                          title="İlanı Sil"
                        >
                          <FiTrash2 className="text-sm" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ═══════════ SAYFALAMA ═══════════ */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6 pb-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2.5 bg-white rounded-xl shadow-sm border border-gray-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200 transition-all"
          >
            <FiChevronLeft className="text-lg" />
          </button>
          {[...Array(totalPages)].map((_, i) => {
            const page = i + 1;
            return (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`w-10 h-10 rounded-xl font-extrabold text-sm shadow-sm border transition-all ${
                  currentPage === page
                    ? 'bg-amber-600 text-white border-amber-600 scale-110 shadow-amber-200'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200'
                }`}
              >
                {page}
              </button>
            );
          })}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2.5 bg-white rounded-xl shadow-sm border border-gray-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200 transition-all"
          >
            <FiChevronRight className="text-lg" />
          </button>
        </div>
      )}

    </div>
  );
}