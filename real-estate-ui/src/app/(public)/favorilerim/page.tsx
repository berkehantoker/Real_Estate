"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getMyFavoritesAPI, toggleFavoriteAPI } from '../../../services/favoriteService';
import { FiHeart, FiMapPin, FiHome, FiMaximize } from 'react-icons/fi';
import { useAuthStore } from '../../../store/useAuthStore';
import toast from 'react-hot-toast';

interface FavoriteItem {
  favoriteProductId: number;
  productId: number;
  productTitle: string;
  productPrice: number;
  productCoverImage: string;
  productCity?: string;
  productDistrict?: string;
  productRoomCount?: number;
  productSize?: number;
  productType?: string;
}

export default function MyFavoritesPage() {
  const { user } = useAuthStore();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [removingIds, setRemovingIds] = useState<number[]>([]);

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
    setRemovingIds(prev => [...prev, productId]);

    setTimeout(async () => {
      try {
        await toggleFavoriteAPI(productId);
        setFavorites(prev => prev.filter(f => f.productId !== productId));
        toast.success("İlan favorilerinizden kaldırıldı.");
      } catch (error) {
        setRemovingIds(prev => prev.filter(id => id !== productId));
        toast.error("Favori kaldırılamadı.");
      }
    }, 300);
  };

  if (isLoading) return <div className="text-center py-20 text-gray-500 animate-pulse font-medium">Favorileriniz yükleniyor...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
      <div className="flex items-center gap-3 mb-10">
        <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-red-200 rounded-2xl flex items-center justify-center shadow-sm">
          <FiHeart className="text-2xl text-red-500 fill-red-500" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Favori İlanlarım</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {favorites.length > 0 ? `${favorites.length} ilan beğendiniz` : 'Henüz favori ilanınız yok'}
          </p>
        </div>
      </div>

      {!user ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-gray-200 shadow-sm">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
             <FiHeart className="text-4xl text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Favorilerinizi görüntülemek için giriş yapın</h3>
          <Link href="/login" className="inline-block bg-blue-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-blue-700 transition mt-4">
            Giriş Yap
          </Link>
        </div>
      ) : favorites.length === 0 ? (
        <div className="bg-white p-16 text-center rounded-2xl border border-gray-200 shadow-sm">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-5">
             <FiHeart className="text-5xl text-gray-300" />
          </div>
          <h3 className="text-2xl font-extrabold text-gray-800 mb-3">Henüz favori ilanınız yok</h3>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">İlginizi çeken ilanları favorilerinize ekleyerek daha sonra kolayca bulabilirsiniz.</p>
          <Link href="/ilanlar" className="inline-flex items-center gap-2 bg-blue-600 text-white font-bold px-8 py-3.5 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95">
            İlanları İncelemeye Başla &rarr;
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {favorites.map((fav) => (
            <div
              key={fav.favoriteProductId}
              className={`relative bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 group ${
                removingIds.includes(fav.productId) ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
              }`}
            >
              <button
                onClick={(e) => {
                  e.preventDefault();
                  handleRemove(fav.productId);
                }}
                className="absolute top-4 right-4 z-10 p-2.5 bg-white/80 backdrop-blur-sm text-red-500 rounded-full shadow-md hover:bg-red-500 hover:text-white transition-all duration-300 group/heart"
                title="Favorilerden Çıkar"
              >
                <FiHeart className="text-lg fill-current group-hover/heart:fill-white transition-all" />
              </button>

              {fav.productType && (
                <div className={`absolute top-4 left-4 z-10 text-white font-bold px-3 py-1 rounded-full text-xs shadow-lg backdrop-blur-sm ${
                  fav.productType === 'Kiralık' ? 'bg-orange-500/90' : 'bg-blue-600/90'
                }`}>
                  {fav.productType}
                </div>
              )}

              <Link href={`/ilan/${fav.productId}`} className="block relative aspect-[4/3] overflow-hidden bg-gray-100">
                <img 
                  src={fav.productCoverImage || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80'} 
                  alt={fav.productTitle} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </Link>

              <div className="p-5">
                <Link href={`/ilan/${fav.productId}`}>
                  <h3 className="text-base font-extrabold text-gray-800 mb-2 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                    {fav.productTitle}
                  </h3>
                </Link>

                {(fav.productCity || fav.productDistrict) && (
                  <p className="text-gray-500 text-xs flex items-center gap-1 mb-3">
                    <FiMapPin className="text-blue-500 flex-shrink-0" /> 
                    <span className="truncate">{[fav.productCity, fav.productDistrict].filter(Boolean).join(', ')}</span>
                  </p>
                )}

                <div className="flex items-center gap-3 mb-4">
                  {fav.productRoomCount && (
                    <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-lg">
                      <FiHome className="w-3 h-3" /> {fav.productRoomCount} Oda
                    </div>
                  )}
                  {fav.productSize && (
                    <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-lg">
                      <FiMaximize className="w-3 h-3" /> {fav.productSize} m²
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-100 pt-4 flex justify-between items-end">
                  <span className="text-lg font-extrabold text-blue-600">
                    {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(fav.productPrice)}
                  </span>
                  <Link href={`/ilan/${fav.productId}`} className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors">
                    İncele &rarr;
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}