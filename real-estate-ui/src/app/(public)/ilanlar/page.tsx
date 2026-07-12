"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getProductsAPI } from '../../../services/productService';
import { getAllCategoriesAPI } from '../../../services/categoryService';
import ProductCard from '../../../components/ProductCard';
import { FiSearch, FiFilter, FiChevronLeft, FiChevronRight, FiMapPin, FiHome, FiDollarSign } from 'react-icons/fi';
import SearchableDropdown from '../../../components/SearchableDropdown';
import { getCities, getDistrictsByCity, getNeighborhoodsByDistrict } from '../../../constants/locations';

// Veritabanındaki Amenity tablonuzla eşleşecek örnek özellikler
const AMENITIES_LIST = [
  { id: 1, name: "Havuz" },
  { id: 2, name: "Otopark" },
  { id: 3, name: "Asansör" },
  { id: 4, name: "7/24 Güvenlik" },
  { id: 5, name: "Balkon" },
  { id: 6, name: "Klima" },
  { id: 7, name: "Yerden Isıtma" },
  { id: 8, name: "Spor Salonu" }
];

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState([]);
  const [metaData, setMetaData] = useState<any>(null);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // GÜNCELLENMİŞ VE GENİŞLETİLMİŞ FİLTRE STATE'İ
  const [filters, setFilters] = useState({
    searchKeyword: searchParams.get('searchKeyword') || '',
    type: searchParams.get('type') || '',
    categoryId: '',
    city: searchParams.get('city') || '',
    district: searchParams.get('district') || '',
    neighborhood: searchParams.get('neighborhood') || '',
    minPrice: '',
    maxPrice: '',
    roomCount: '',
    bathCount: '',
    amenities: [] as number[],
    sortBy: 'DateDesc',
    pageNumber: 1,
    pageSize: 9
  });

  // Cascading dropdown state'leri (filtreleme için)
  const [cities, setCities] = useState<string[]>([]);
  const [filterDistricts, setFilterDistricts] = useState<string[]>([]);
  const [filterNeighborhoods, setFilterNeighborhoods] = useState<string[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(true);

  useEffect(() => {
    getCities().then(setCities).finally(() => setIsLoadingLocations(false));
  }, []);

  const handleCityChange = async (city: string) => {
    setFilters({ ...filters, city, district: '', neighborhood: '', pageNumber: 1 });
    setFilterDistricts([]);
    setFilterNeighborhoods([]);
    if (city) {
      const d = await getDistrictsByCity(city);
      setFilterDistricts(d);
    }
  };

  const handleDistrictChange = async (district: string) => {
    setFilters({ ...filters, district, neighborhood: '', pageNumber: 1 });
    setFilterNeighborhoods([]);
    if (filters.city && district) {
      const n = await getNeighborhoodsByDistrict(filters.city, district);
      setFilterNeighborhoods(n);
    }
  };

  const handleNeighborhoodChange = (neighborhood: string) => {
    setFilters({ ...filters, neighborhood, pageNumber: 1 });
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const cats = await getAllCategoriesAPI();
        setCategories(cats);
        await fetchProducts(filters);
      } catch (error) {
        console.error("Veri yükleme hatası", error);
      }
    };
    fetchInitialData();
  }, []);

  const fetchProducts = async (currentFilters: any) => {
    setIsLoading(true);
    try {
      // Sadece içi dolu olan filtreleri backend'e gönderiyoruz
      const cleanFilters: any = {};
      Object.keys(currentFilters).forEach(key => {
        if (currentFilters[key] !== '' && currentFilters[key] !== null) {
          // Diziler boşsa gönderme, doluysa gönder
          if (Array.isArray(currentFilters[key])) {
             if (currentFilters[key].length > 0) cleanFilters[key] = currentFilters[key];
          } else {
             cleanFilters[key] = currentFilters[key];
          }
        }
      });
      
      const response = await getProductsAPI(cleanFilters);
      setProducts(response.items);
      setMetaData(response.metaData);
    } catch (error) {
      console.error("İlanlar getirilemedi:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const newFilters = { ...filters, pageNumber: 1 };
    setFilters(newFilters);
    fetchProducts(newFilters);
  };

  const handlePageChange = (newPage: number) => {
    const newFilters = { ...filters, pageNumber: newPage };
    setFilters(newFilters);
    fetchProducts(newFilters);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Checkbox'a tıklandığında özellikleri ekle/çıkar
  const handleAmenityToggle = (amenityId: number) => {
    setFilters(prev => {
      const hasAmenity = prev.amenities.includes(amenityId);
      return {
        ...prev,
        amenities: hasAmenity 
          ? prev.amenities.filter(id => id !== amenityId) 
          : [...prev.amenities, amenityId]
      };
    });
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* SOL BÖLÜM: DETAYLI FİLTRELEME SİDEBAR'I */}
          <div className="w-full lg:w-1/3 xl:w-1/4">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24 max-h-[85vh] overflow-y-auto custom-scrollbar">
              <h3 className="text-xl font-extrabold text-gray-900 mb-6 flex items-center gap-2 border-b pb-4">
                <FiFilter className="text-blue-600" /> Detaylı Arama
              </h3>

              <form onSubmit={handleFilterSubmit} className="space-y-6">
                
                {/* İlan Tipi (Radio Buttons) */}
                <div className="flex bg-gray-100 p-1 rounded-xl">
                  {['', 'Satılık', 'Kiralık'].map((typeOption) => (
                    <button
                      key={typeOption}
                      type="button"
                      onClick={() => setFilters({ ...filters, type: typeOption })}
                      className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                        filters.type === typeOption 
                        ? 'bg-white text-blue-600 shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {typeOption === '' ? 'Tümü' : typeOption}
                    </button>
                  ))}
                </div>

                {/* Anahtar Kelime */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Kelime ile Ara</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="Örn: Deniz manzaralı..." 
                      value={filters.searchKeyword}
                      onChange={(e) => setFilters({...filters, searchKeyword: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-400 focus:bg-white transition-colors" 
                    />
                    <FiSearch className="absolute left-3 top-3.5 text-gray-400 text-lg" />
                  </div>
                </div>

                {/* Kategori */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Emlak Tipi</label>
                  <select 
                    value={filters.categoryId}
                    onChange={(e) => setFilters({...filters, categoryId: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-400 focus:bg-white transition-colors"
                  >
                    <option value="">Tüm Kategoriler</option>
                    {categories.map((cat: any) => (
                      <option key={cat.categoryId || cat.id} value={cat.categoryId || cat.id}>
                        {cat.name || cat.categoryName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 🌟 CASCADING KONUM SEÇİMİ (İl → İlçe → Mahalle) */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">İl</label>
                    <SearchableDropdown
                      options={cities}
                      value={filters.city}
                      onChange={handleCityChange}
                      placeholder="İl ara..."
                      disabled={isLoadingLocations}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">İlçe</label>
                    <SearchableDropdown
                      options={filterDistricts}
                      value={filters.district}
                      onChange={handleDistrictChange}
                      placeholder="İlçe ara..."
                      disabled={!filters.city}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Mahalle</label>
                    <SearchableDropdown
                      options={filterNeighborhoods}
                      value={filters.neighborhood}
                      onChange={handleNeighborhoodChange}
                      placeholder="Mahalle ara..."
                      disabled={!filters.district}
                    />
                  </div>
                </div>

                {/* Fiyat */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Fiyat Aralığı (₺)</label>
                  <div className="flex items-center gap-2">
                    <input type="number" placeholder="Min" value={filters.minPrice} onChange={(e) => setFilters({...filters, minPrice: e.target.value})} className="w-1/2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-blue-400" />
                    <span className="text-gray-400">-</span>
                    <input type="number" placeholder="Max" value={filters.maxPrice} onChange={(e) => setFilters({...filters, maxPrice: e.target.value})} className="w-1/2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-blue-400" />
                  </div>
                </div>

                {/* Oda ve Banyo */}
                <div className="flex gap-4">
                  <div className="w-1/2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Oda Sayısı</label>
                    <select value={filters.roomCount} onChange={(e) => setFilters({...filters, roomCount: e.target.value})} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-blue-400">
                      <option value="">Farketmez</option>
                      <option value="1">1+ Odalı</option>
                      <option value="2">2+ Odalı</option>
                      <option value="3">3+ Odalı</option>
                      <option value="4">4+ Odalı</option>
                    </select>
                  </div>
                  <div className="w-1/2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Banyo</label>
                    <select value={filters.bathCount} onChange={(e) => setFilters({...filters, bathCount: e.target.value})} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-blue-400">
                      <option value="">Farketmez</option>
                      <option value="1">1+ Banyo</option>
                      <option value="2">2+ Banyo</option>
                      <option value="3">3+ Banyo</option>
                    </select>
                  </div>
                </div>

                {/* Özellikler (Amenities - Checkbox Grid) */}
                <div className="pt-2">
                  <label className="block text-sm font-bold text-gray-700 mb-3">Ev Özellikleri</label>
                  <div className="grid grid-cols-2 gap-3">
                    {AMENITIES_LIST.map((amenity) => (
                      <label key={amenity.id} className="flex items-center gap-2 cursor-pointer group">
                        <div className="relative flex items-center justify-center">
                          <input 
                            type="checkbox" 
                            checked={filters.amenities.includes(amenity.id)}
                            onChange={() => handleAmenityToggle(amenity.id)}
                            className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded-md checked:bg-blue-600 checked:border-blue-600 cursor-pointer transition-all"
                          />
                          <FiHome className="absolute text-white opacity-0 peer-checked:opacity-100 w-3 h-3 pointer-events-none" />
                        </div>
                        <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">{amenity.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Sıralama */}
                <div className="pt-4 border-t border-gray-100">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Sıralama</label>
                  <select 
                    value={filters.sortBy}
                    onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-400"
                  >
                    <option value="DateDesc">Tarihe Göre: En Yeniler</option>
                    <option value="DateAsc">Tarihe Göre: En Eskiler</option>
                    <option value="PriceAsc">Fiyat: Düşükten Yükseğe</option>
                    <option value="PriceDesc">Fiyat: Yüksekten Düşüğe</option>
                  </select>
                </div>

                <button type="submit" className="w-full bg-blue-600 text-white font-extrabold py-4 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 active:scale-95">
                  {isLoading ? 'Aranıyor...' : 'Sonuçları Getir'}
                </button>
              </form>
            </div>
          </div>

          {/* SAĞ BÖLÜM: İLAN LİSTESİ VE SAYFALAMA */}
          <div className="w-full lg:w-2/3 xl:w-3/4">
            
            {/* Üst Bilgi */}
            <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
              <h1 className="text-2xl font-extrabold text-gray-900">
                {filters.type === 'Satılık' ? 'Satılık İlanlar' : filters.type === 'Kiralık' ? 'Kiralık İlanlar' : 'Tüm İlanlar'}
              </h1>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 font-medium">Toplam</span>
                <span className="bg-blue-50 text-blue-700 font-bold px-3 py-1 rounded-lg">
                  {metaData?.totalCount || 0} Sonuç
                </span>
              </div>
            </div>

            {/* İlan Grid'i */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="h-[400px] bg-gray-200 animate-pulse rounded-2xl"></div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 bg-white rounded-3xl border border-gray-100 shadow-sm">
                <FiSearch className="text-6xl text-gray-300 mb-4" />
                <p className="text-2xl font-extrabold text-gray-800 mb-2">Sonuç Bulunamadı</p>
                <p className="text-gray-500 text-center max-w-md">Kriterlerinize uygun ilan şu an için mevcut değil. Lütfen filtrelerinizi esneterek tekrar deneyin.</p>
                <button onClick={() => window.location.reload()} className="mt-6 text-blue-600 font-bold hover:underline">Filtreleri Temizle</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product: any) => (
                  <ProductCard key={product.productId} product={product} />
                ))}
              </div>
            )}

            {/* SAYFALAMA (PAGINATION) BÖLÜMÜ */}
            {metaData && metaData.totalPages > 1 && (
              <div className="mt-12 flex justify-center items-center gap-2">
                <button onClick={() => handlePageChange(metaData.currentPage - 1)} disabled={!metaData.hasPrevious} className="p-3 bg-white rounded-xl shadow-sm border border-gray-200 disabled:opacity-50 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                  <FiChevronLeft className="text-xl" />
                </button>
                {[...Array(metaData.totalPages)].map((_, i) => {
                  const page = i + 1;
                  return (
                    <button key={page} onClick={() => handlePageChange(page)} className={`w-12 h-12 rounded-xl font-extrabold shadow-sm border transition-all ${metaData.currentPage === page ? 'bg-blue-600 text-white border-blue-600 scale-110' : 'bg-white text-gray-600 border-gray-200 hover:bg-blue-50 hover:text-blue-600'}`}>
                      {page}
                    </button>
                  );
                })}
                <button onClick={() => handlePageChange(metaData.currentPage + 1)} disabled={!metaData.hasNext} className="p-3 bg-white rounded-xl shadow-sm border border-gray-200 disabled:opacity-50 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                  <FiChevronRight className="text-xl" />
                </button>
              </div>
            )}

          </div>

        </div>
      </div>
      
      {/* Özel Scrollbar CSS'i (Sadece bu sayfaya etki etsin diye buraya yazıyoruz) */}
      <style dangerouslySetInnerHTML={{ __html: `
  .custom-scrollbar::-webkit-scrollbar { width: 6px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 10px; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
`}} />
    </div>
  );
}