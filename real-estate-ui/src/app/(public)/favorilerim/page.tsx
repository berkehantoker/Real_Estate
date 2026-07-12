"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getMyFavoritesAPI, toggleFavoriteAPI } from '../../../services/favoriteService';
import { FiHeart, FiTrash2, FiMapPin } from 'react-icons/fi';

export default function MyFavoritesPage() {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFavorites = async () => {
    try {
      const data = await getMyFavoritesAPI();
      setFavorites(data);
    } catch (error) {
      console.error("Favoriler yüklenemedi", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleRemove = async (productId: number) => {
    try {
      // Toggle backend'de varsa siliyordu, bu yüzden aynı servisi kullanıyoruz.
      await toggleFavoriteAPI(productId);
      // Başarılı olursa listeyi ekrandan da filtreleyerek çıkartıyoruz
      setFavorites(favorites.filter(f => f.productId !== productId));
    } catch (error) {
      alert("Favori silinemedi.");
    }
  };

  if (isLoading) return <div className="text-center py-20 text-gray-500 animate-pulse">Favorileriniz yükleniyor...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-screen">
      <div className="flex items-center gap-3 mb-8 border-b pb-4">
        <FiHeart className="text-3xl text-red-500 fill-red-500" />
        <h1 className="text-3xl font-extrabold text-gray-900">Favori İlanlarım</h1>
      </div>

      {favorites.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-gray-200 shadow-sm">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
             <FiHeart className="text-4xl text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Henüz favori ilanınız yok</h3>
          <p className="text-gray-500 mb-6">İlginizi çeken ilanları favorilerinize ekleyerek daha sonra kolayca bulabilirsiniz.</p>
          <Link href="/ilanlar" className="bg-blue-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-blue-700 transition">
            İlanları İncele
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favorites.map((fav) => (
            <div key={fav.favoriteProductId} className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow group">
              <Link href={`/ilan/${fav.productId}`} className="block relative aspect-[4/3] overflow-hidden bg-gray-100">
                <img 
                  src={fav.productCoverImage || 'https://via.placeholder.com/400x300?text=Resim+Yok'} 
                  alt={fav.productTitle} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </Link>
              <div className="p-5">
                <Link href={`/ilan/${fav.productId}`}>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">{fav.productTitle}</h3>
                </Link>
                <div className="text-xl font-extrabold text-blue-600 mb-4">
                  {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(fav.productPrice)}
                </div>
                
                <button 
                  onClick={() => handleRemove(fav.productId)}
                  className="w-full flex items-center justify-center gap-2 text-red-500 bg-red-50 hover:bg-red-500 hover:text-white py-2.5 rounded-xl font-semibold transition-colors"
                >
                  <FiTrash2 /> Favorilerden Çıkar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}