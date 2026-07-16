"use client";

import { useEffect, useState } from 'react';
import { getAllProductsAPI } from '@/services/productService';
import { getMyFavoriteIdsAPI } from '@/services/favoriteService';
import ProductCard from './ProductCard';

export default function FeaturedProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [data, ids] = await Promise.all([
          getAllProductsAPI(4),
          getMyFavoriteIdsAPI()
        ]);
        setFavoriteIds(ids);
        
        if (Array.isArray(data)) {
          setProducts(data);
        } else if (data && Array.isArray(data.$values)) {
          setProducts(data.$values);
        } else if (data && Array.isArray(data.data)) {
          setProducts(data.data);
        } else if (data && Array.isArray(data.items)) {
          const formattedProducts = data.items.map((p: any) => ({
            ...p,
            id: p.productId || p.id 
          }));
          setProducts(formattedProducts);
        } else {
          console.error("Beklenmeyen API formatı geldi:", data);
          setProducts([]); 
        }
        
      } catch (err) {
        setError('İlanlar yüklenirken bir sorun oluştu.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleFavoriteToggle = (productId: number) => {
    setFavoriteIds(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId) 
        : [...prev, productId]
    );
  };

  if (isLoading) {
    return <div className="text-center py-20 text-gray-500 font-medium animate-pulse">İlanlar yükleniyor...</div>;
  }

  if (error) {
    return <div className="text-center py-20 text-red-500">{error}</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
      {products.map((product: any, index: number) => (
        <ProductCard
          key={product.productId || product.id || index}
          product={product}
          isFavorite={favoriteIds.includes(product.productId || product.id)}
          onFavoriteToggle={handleFavoriteToggle}
        />
      ))}
      
      {products.length === 0 && (
        <div className="col-span-full text-center text-gray-500 py-10">
          Şu an sistemde aktif bir ilan bulunmamaktadır.
        </div>
      )}
    </div>
  );
}