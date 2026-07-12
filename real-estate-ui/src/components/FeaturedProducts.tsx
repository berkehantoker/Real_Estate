"use client";

import { useEffect, useState } from 'react';
import { getAllProductsAPI } from '@/services/productService';
import ProductCard from './ProductCard';

export default function FeaturedProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Sayfa açıldığında API'den verileri çeken fonksiyon
   const fetchProducts = async () => {
      try {
        const data = await getAllProductsAPI();
        
       // 🌟 AKILLI KONTROL: Backend veriyi nasıl göndermiş?
        if (Array.isArray(data)) {
          setProducts(data);
        } else if (data && Array.isArray(data.$values)) {
          setProducts(data.$values);
        } else if (data && Array.isArray(data.data)) {
          setProducts(data.data);
        } else if (data && Array.isArray(data.items)) {
          // 🌟 İŞTE YAKALADIK! Senin API'nin gönderdiği Sayfalama (Pagination) yapısı
          // Gelen listedeki 'productId' alanlarını, bizim ProductCard'ın beklediği 'id' ismine çeviriyoruz
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

    fetchProducts();
  }, []);

  if (isLoading) {
    return <div className="text-center py-20 text-gray-500 font-medium animate-pulse">İlanlar yükleniyor...</div>;
  }

  if (error) {
    return <div className="text-center py-20 text-red-500">{error}</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
      {/* Gelen her bir ilan (product) için ekrana bir ProductCard basıyoruz */}
     {products.map((product: any, index: number) => (
        <ProductCard key={product.productId || product.id || index} product={product} />
      ))}
      
      {products.length === 0 && (
        <div className="col-span-full text-center text-gray-500 py-10">
          Şu an sistemde aktif bir ilan bulunmamaktadır.
        </div>
      )}
    </div>
  );
}