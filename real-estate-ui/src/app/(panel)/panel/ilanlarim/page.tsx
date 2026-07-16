"use client";

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { getMyProductsAPI, deleteProductAPI } from '@/services/productService';
import { FiEdit, FiTrash2, FiEye, FiPlus, FiSearch, FiMapPin, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function MyProductsPage() {
  const { user } = useAuthStore();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // ============================================================================
  // YENİ STATE'LER: Arama ve Sayfalama
  // ============================================================================
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Sayfa açıldığında ilanları çek
  const fetchProducts = async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const data = await getMyProductsAPI(Number(user.id));
      
      // Gelen verideki ID alanını standartlaştırıyoruz (Backend productId veya id dönüyor olabilir)
      const formattedData = data.map((p: any) => ({ ...p, id: p.productId || p.id }));
      setProducts(formattedData);
    } catch (error) {
      console.error("İlanlar çekilirken hata:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [user]);

  // Silme İşlemi
  const handleDelete = async (id: number) => {
    if (window.confirm('Bu ilanı kalıcı olarak silmek istediğinize emin misiniz?')) {
      try {
        await deleteProductAPI(id);
        // Silme başarılıysa listeyi güncelle
        setProducts(products.filter((p: any) => p.id !== id));
      } catch (error) {
        toast.error('İlan silinirken bir hata oluştu.');
      }
    }
  };

  // ============================================================================
  // ARAMA VE SAYFALAMA LOGIC'I
  // ============================================================================

  // 1. Arama motoru (Başlık, Şehir, İlçe, Kategori veya Tip içinde arar)
  const filteredProducts = products.filter((item: any) => {
    const searchLower = searchTerm.toLowerCase();
    if (!searchLower) return true;
    return (
      item.title?.toLowerCase().includes(searchLower) ||
      item.city?.toLowerCase().includes(searchLower) ||
      item.district?.toLowerCase().includes(searchLower) ||
      item.categoryName?.toLowerCase().includes(searchLower) ||
      item.type?.toLowerCase().includes(searchLower)
    );
  });

  // 2. Sayfalama hesaplaması
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
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* ═══════════ ÜST BAR: Başlık + Rozet + Yeni İlan Butonu ═══════════ */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-xl">
            📦
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Portföyüm</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="bg-blue-50 text-blue-700 font-bold text-sm px-3 py-1 rounded-full">
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
        <Link href="/panel/ilan-ekle" className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200 active:scale-95">
          <FiPlus className="text-lg" /> Yeni İlan
        </Link>
      </div>

      {/* ═══════════ ARAMA ÇUBUĞU ═══════════ */}
      <div className="relative w-full max-w-md">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <FiSearch className="text-gray-400 text-lg" />
        </div>
        <input
          type="text"
          placeholder="İlan başlığı, şehir, ilçe veya kategori ara..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-gray-400"
        />
        {searchTerm && (
          <button
            onClick={() => { setSearchTerm(''); setCurrentPage(1); }}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-red-500 transition-colors"
          >
            Temizle
          </button>
        )}
      </div>

      {/* ═══════════ İLAN KART LİSTESİ ═══════════ */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-10 text-center text-gray-500 animate-pulse font-medium">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <span>İlanlarınız yükleniyor...</span>
            </div>
          </div>
        ) : currentProducts.length === 0 ? (
          <div className="p-16 text-center">
            <div className="text-gray-300 mb-4 text-6xl flex justify-center">
              {searchTerm ? <FiSearch /> : <FiEye />}
            </div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">
              {searchTerm ? 'Sonuç Bulunamadı' : 'Henüz Hiç İlanınız Yok'}
            </h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              {searchTerm
                ? `"${searchTerm}" kriterine uygun ilan bulunamadı. Farklı bir arama deneyin.`
                : 'Müşterilere sunmak için hemen yeni bir ilan oluşturun.'}
            </p>
            {searchTerm && (
              <button
                onClick={() => { setSearchTerm(''); setCurrentPage(1); }}
                className="text-blue-600 font-bold hover:underline"
              >
                Aramayı Temizle
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {currentProducts.map((product: any) => (
              <div key={product.id} className="flex flex-col sm:flex-row items-start gap-5 p-5 hover:bg-gray-50/50 transition-colors group">
                
                {/* Sol: Kapak Görseli */}
                <div className="w-full sm:w-32 h-24 sm:h-20 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0 shadow-sm">
                  <img
                    src={product.coverImage || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=200&q=80'}
                    alt="Kapak"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Orta: Bilgiler */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-start gap-2">
                    <h3 className="text-base font-extrabold text-gray-800 line-clamp-1 leading-snug" title={product.title}>
                      {product.title}
                    </h3>
                    <span className={`flex-shrink-0 text-xs font-bold px-2.5 py-0.5 rounded-full ${
                      product.type === 'Kiralık' 
                        ? 'bg-orange-50 text-orange-600 border border-orange-200' 
                        : 'bg-blue-50 text-blue-600 border border-blue-200'
                    }`}>
                      {product.type}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    <p className="text-gray-500 text-sm flex items-center gap-1">
                      <FiMapPin className="text-gray-400 text-xs flex-shrink-0" /> 
                      <span className="truncate">{product.city}, {product.district}</span>
                    </p>
                    {product.categoryName && (
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">
                        {product.categoryName}
                      </span>
                    )}
                  </div>

                  <p className="text-lg font-extrabold text-blue-600">
                    {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(product.price)}
                  </p>
                </div>

                {/* Sağ: Aksiyon Butonları */}
                <div className="flex sm:flex-col items-center justify-end gap-2 flex-shrink-0 w-full sm:w-auto sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  <Link
                    href={`/panel/ilan-duzenle/${product.id}`}
                    className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg transition-all text-xs font-bold flex-1 sm:flex-initial justify-center"
                    title="Düzenle"
                  >
                    <FiEdit className="text-sm" /> Düzenle
                  </Link>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition-all text-xs font-bold flex-1 sm:flex-initial justify-center"
                    title="Sil"
                  >
                    <FiTrash2 className="text-sm" /> Sil
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ═══════════ SAYFALAMA BAR'ı ═══════════ */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 pb-4">
          {/* Önceki Sayfa */}
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2.5 bg-white rounded-xl shadow-sm border border-gray-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all"
            title="Önceki Sayfa"
          >
            <FiChevronLeft className="text-lg" />
          </button>

          {/* Sayfa Numaraları */}
          {[...Array(totalPages)].map((_, i) => {
            const page = i + 1;
            const isActive = currentPage === page;
            return (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`w-10 h-10 rounded-xl font-extrabold text-sm shadow-sm border transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white border-blue-600 scale-110 shadow-blue-200'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200'
                }`}
              >
                {page}
              </button>
            );
          })}

          {/* Sonraki Sayfa */}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2.5 bg-white rounded-xl shadow-sm border border-gray-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all"
            title="Sonraki Sayfa"
          >
            <FiChevronRight className="text-lg" />
          </button>
        </div>
      )}

    </div>
  );
}