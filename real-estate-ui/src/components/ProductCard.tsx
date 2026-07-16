import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { toggleFavoriteAPI } from '@/services/favoriteService';
import { FiMapPin, FiHome, FiMaximize, FiHeart } from 'react-icons/fi';
import { useState } from 'react';
import toast from 'react-hot-toast';

interface ProductProps {
  productId: number;
  title: string;
  price: number;
  city: string;
  district: string;
  type: string;
  coverImage: string;
  roomCount?: number;
  size?: number;
  categoryName?: string;
  isFavorite?: boolean;
  onFavoriteToggle?: (productId: number) => void;
}

export default function ProductCard({ product, isFavorite = false, onFavoriteToggle }: { product: ProductProps; isFavorite?: boolean; onFavoriteToggle?: (productId: number) => void }) {
  const { user } = useAuthStore();
  const [fav, setFav] = useState(isFavorite);
  const router = useRouter();

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      router.push('/login');
      return;
    }

    // Optimistic UI update
    setFav(!fav);

    try {
      await toggleFavoriteAPI(product.productId);
      onFavoriteToggle?.(product.productId);
    } catch {
      // Revert on error
      setFav(fav);
      toast.error('Favori işlemi başarısız oldu.');
    }
  };

  return (
    <Link href={`/ilan/${product.productId}`} className="block h-full">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group flex flex-col h-full">
        
        {/* Resim Alanı */}
        <div className="relative h-52 overflow-hidden bg-gray-100">
          <img
            src={product.coverImage || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80'}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
          
          {/* Tip Rozeti */}
          <div className={`absolute top-3 left-3 text-white font-bold px-3 py-1 rounded-full text-xs shadow-lg backdrop-blur-sm ${
            product.type === 'Kiralık' 
              ? 'bg-orange-500/90' 
              : product.type === 'Günlük Kiralık' 
                ? 'bg-purple-500/90' 
                : 'bg-blue-600/90'
          }`}>
            {product.type}
          </div>

          {/* Kategori Rozeti */}
          {product.categoryName && (
            <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full">
              {product.categoryName}
            </div>
          )}

          {/* Favori Kalp Butonu */}
          <button
            onClick={handleFavoriteClick}
            className="absolute bottom-3 right-3 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-all active:scale-90"
            title={fav ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
          >
            <FiHeart 
              className={`text-lg transition-colors ${fav ? 'text-red-500 fill-red-500' : 'text-gray-400 hover:text-red-400'}`} 
            />
          </button>
        </div>

        {/* İçerik Alanı */}
        <div className="p-5 flex flex-col flex-1">
          <h3 className="text-base font-extrabold text-gray-800 mb-2 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors" title={product.title}>
            {product.title}
          </h3>
          
          <p className="text-gray-500 text-xs flex items-center gap-1 mb-3">
            <FiMapPin className="text-blue-500 flex-shrink-0" /> 
            <span className="truncate">{product.city}, {product.district}</span>
          </p>

          {/* Oda / m² Bilgileri */}
          <div className="flex items-center gap-3 mb-4">
            {product.roomCount && (
              <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-lg">
                <FiHome className="w-3 h-3" /> {product.roomCount} Oda
              </div>
            )}
            {product.size && (
              <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-lg">
                <FiMaximize className="w-3 h-3" /> {product.size} m²
              </div>
            )}
          </div>
          
          {/* Fiyat */}
          <div className="mt-auto border-t border-gray-100 pt-4 flex justify-between items-end">
            <span className="text-lg font-extrabold text-blue-600">
              {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(product.price)}
            </span>
            <span className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors">
              İncele &rarr;
            </span>
          </div>
        </div>

      </div>
    </Link>
  );
}