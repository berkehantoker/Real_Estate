"use client";

import { useEffect, useState } from 'react';
import { getAllProductsWithDetailsAPI, deleteProductAPI } from '../../../../services/productService';
import { FiTrash2, FiExternalLink, FiBox } from 'react-icons/fi';

interface Product {
  productId: number;
  title: string;
  price: number;
  city: string;
  district: string;
  categoryName: string;
  type: string;
}

export default function AllProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
        alert("Silme işlemi başarısız oldu.");
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-20">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
          <FiBox className="text-blue-600" /> Tüm İlanlar (Admin)
        </h2>
        <p className="text-gray-500 mt-1">Sistemdeki tüm ilanları denetleyin ve yönetin.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-gray-500 font-medium animate-pulse">İlanlar yükleniyor...</div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center text-gray-500 font-medium">Sistemde henüz hiç ilan yok.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="p-5 font-bold text-gray-700">İlan Başlığı</th>
                  <th className="p-5 font-bold text-gray-700">Kategori / Tip</th>
                  <th className="p-5 font-bold text-gray-700">Konum</th>
                  <th className="p-5 font-bold text-gray-700">Fiyat</th>
                  <th className="p-5 font-bold text-gray-700 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((product) => (
                  <tr key={product.productId} className="hover:bg-gray-50 transition-colors">
                    <td className="p-5 font-bold text-gray-900 max-w-xs truncate" title={product.title}>
                      {product.title}
                    </td>
                    <td className="p-5">
                      <span className="text-sm font-semibold bg-gray-100 px-2 py-1 rounded text-gray-700">{product.categoryName}</span>
                      <span className="text-sm ml-2 text-blue-600 font-medium">{product.type}</span>
                    </td>
                    <td className="p-5 text-gray-600">{product.city}, {product.district}</td>
                    <td className="p-5 font-extrabold text-gray-900">
                      {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(product.price)}
                    </td>
                    <td className="p-5 flex items-center justify-end gap-3">
                      <a 
                        href={`/ilan/${product.productId}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
                        title="İlanı Görüntüle"
                      >
                        <FiExternalLink />
                      </a>
                      <button 
                        onClick={() => handleDelete(product.productId, product.title)}
                        className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-600 hover:text-white transition-colors"
                        title="İlanı Sil"
                      >
                        <FiTrash2 />
                      </button>
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