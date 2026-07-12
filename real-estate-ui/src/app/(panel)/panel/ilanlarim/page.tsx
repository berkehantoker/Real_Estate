"use client";

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { getMyProductsAPI, deleteProductAPI } from '@/services/productService';
import { FiEdit, FiTrash2, FiEye, FiPlus } from 'react-icons/fi';
import Link from 'next/link';

export default function MyProductsPage() {
  const { user } = useAuthStore();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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
        alert('İlan silinirken bir hata oluştu.');
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Üst Başlık ve Buton Alanı */}
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">İlanlarım</h2>
          <p className="text-gray-500 text-sm mt-1">Sisteme yüklediğiniz tüm ilanları buradan yönetebilirsiniz.</p>
        </div>
        <Link href="/panel/ilan-ekle" className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-sm">
          <FiPlus /> Yeni İlan
        </Link>
      </div>

      {/* Veri Tablosu (Data Table) */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-10 text-center text-gray-500 animate-pulse font-medium">İlanlarınız yükleniyor...</div>
        ) : products.length === 0 ? (
          <div className="p-16 text-center">
            <div className="text-gray-400 mb-4 text-6xl flex justify-center"><FiEye /></div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">Henüz Hiç İlanınız Yok</h3>
            <p className="text-gray-500 mb-6">Müşterilere sunmak için hemen yeni bir ilan oluşturun.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider border-b border-gray-100">
                  <th className="p-4 font-semibold">Görsel</th>
                  <th className="p-4 font-semibold">İlan Başlığı</th>
                  <th className="p-4 font-semibold">Konum</th>
                  <th className="p-4 font-semibold">Fiyat</th>
                  <th className="p-4 font-semibold text-center">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((product: any) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="p-4">
                      <div className="w-16 h-16 rounded-lg bg-gray-200 overflow-hidden">
                        <img src={product.coverImage || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=200&q=80'} alt="Kapak" className="w-full h-full object-cover" />
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-gray-800 line-clamp-1" title={product.title}>{product.title}</div>
                      <div className="text-xs text-blue-600 font-semibold mt-1 px-2 py-0.5 bg-blue-50 w-max rounded-md">{product.type}</div>
                    </td>
                    <td className="p-4 text-gray-600 text-sm">
                      {product.city}, {product.district}
                    </td>
                    <td className="p-4 font-extrabold text-gray-900">
                      {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(product.price)}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`/panel/ilan-duzenle/${product.id}`} className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg transition-colors" title="Düzenle">
                          <FiEdit />
                        </Link>
                        <button onClick={() => handleDelete(product.id)} className="p-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition-colors" title="Sil">
                          <FiTrash2 />
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

    </div>
  );
}