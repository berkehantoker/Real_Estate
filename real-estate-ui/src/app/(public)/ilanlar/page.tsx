"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getProductsAPI } from '../../../services/productService';
import { getAllCategoriesAPI } from '../../../services/categoryService';
import { getMyFavoriteIdsAPI } from '../../../services/favoriteService';
import ProductCard from '../../../components/ProductCard';
import { FiSearch, FiFilter, FiChevronLeft, FiChevronRight, FiMapPin, FiHome, FiRefreshCw, FiSliders } from 'react-icons/fi';
import SearchableDropdown from '../../../components/SearchableDropdown';
import { getCities, getDistrictsByCity, getNeighborhoodsByDistrict } from '../../../constants/locations';

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

  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
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
        const [cats, ids] = await Promise.all([
          getAllCategoriesAPI(),
          getMyFavoriteIdsAPI()
        ]);
        setCategories(cats);
        setFavoriteIds(ids);
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
      const cleanFilters: any = {};
      Object.keys(currentFilters).forEach(key => {
        if (currentFilters[key] !== '' && currentFilters[key] !== null) {
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageChange = (newPage: number) => {
    const newFilters = { ...filters, pageNumber: newPage };
    setFilters(newFilters);
    fetchProducts(newFilters);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFavoriteToggle = (productId: number) => {
    setFavoriteIds(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId) 
        : [...prev, productId]
    );
  };

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
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ═══════════ SOL KOLON - STICKY FİLTRE PANELİ (lg:col-span-3) ═══════════ */}
          <div className="lg:col-span-3">
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 lg:sticky lg:top-24 flex flex-col">
              
              {/* Başlık */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                <h3 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
                  <FiSliders className="text-blue-600" /> Filtrele
                </h3>
                <button 
                  onClick={() => window.location.reload()}
                  className="text-xs font-semibold text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors"
                >
                  <FiRefreshCw className="w-3 h-3" /> Temizle
                </button>
              </div>

              {/* Filtre alanı */}
              <div className="flex-1">
                
                <form id="filter-form" onSubmit={handleFilterSubmit} className="space-y-5 pb-4">
                  
                  {/* İlan Tipi */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2.5">İlan Tipi</label>
                    <div className="flex bg-gray-100 p-1 rounded-xl">
                      {['', 'Satılık', 'Kiralık'].map((typeOption) => (
                        <button
                          key={typeOption}
                          type="button"
                          onClick={() => setFilters({ ...filters, type: typeOption })}
                          className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${
                            filters.type === typeOption 
                            ? 'bg-white text-blue-600 shadow-sm' 
                            : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          {typeOption === '' ? 'Tümü' : typeOption}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Anahtar Kelime */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2.5">Kelime ile Ara</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        placeholder="Örn: Deniz manzaralı..." 
                        value={filters.searchKeyword}
                        onChange={(e) => setFilters({...filters, searchKeyword: e.target.value})}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all" 
                      />
                      <FiSearch className="absolute left-3 top-3 text-gray-400" />
                    </div>
                  </div>

                  {/* Kategori */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2.5">Emlak Tipi</label>
                    <select 
                      value={filters.categoryId}
                      onChange={(e) => setFilters({...filters, categoryId: e.target.value})}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                    >
                      <option value="">Tüm Kategoriler</option>
                      {categories.map((cat: any) => (
                        <option key={cat.categoryId || cat.id} value={cat.categoryId || cat.id}>
                          {cat.name || cat.categoryName}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Konum */}
                  <div className="space-y-3">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Konum</label>
                    <SearchableDropdown
                      options={cities}
                      value={filters.city}
                      onChange={handleCityChange}
                      placeholder="İl seçin..."
                      disabled={isLoadingLocations}
                    />
                    <SearchableDropdown
                      options={filterDistricts}
                      value={filters.district}
                      onChange={handleDistrictChange}
                      placeholder="İlçe seçin..."
                      disabled={!filters.city}
                    />
                    <SearchableDropdown
                      options={filterNeighborhoods}
                      value={filters.neighborhood}
                      onChange={handleNeighborhoodChange}
                      placeholder="Mahalle seçin..."
                      disabled={!filters.district}
                    />
                  </div>

                  {/* Fiyat */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2.5">Fiyat Aralığı (₺)</label>
                    <div className="flex items-center gap-2">
                      <input type="number" placeholder="Min" value={filters.minPrice} onChange={(e) => setFilters({...filters, minPrice: e.target.value})} className="w-1/2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all" />
                      <span className="text-gray-300 font-bold">—</span>
                      <input type="number" placeholder="Max" value={filters.maxPrice} onChange={(e) => setFilters({...filters, maxPrice: e.target.value})} className="w-1/2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all" />
                    </div>
                  </div>

                  {/* Oda ve Banyo */}
                  <div className="flex gap-3">
                    <div className="w-1/2">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2.5">Oda</label>
                      <select value={filters.roomCount} onChange={(e) => setFilters({...filters, roomCount: e.target.value})} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400">
                        <option value="">Farketmez</option>
                        <option value="1">1+</option>
                        <option value="2">2+</option>
                        <option value="3">3+</option>
                        <option value="4">4+</option>
                      </select>
                    </div>
                    <div className="w-1/2">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2.5">Banyo</label>
                      <select value={filters.bathCount} onChange={(e) => setFilters({...filters, bathCount: e.target.value})} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400">
                        <option value="">Farketmez</option>
                        <option value="1">1+</option>
                        <option value="2">2+</option>
                        <option value="3">3+</option>
                      </select>
                    </div>
                  </div>

                  {/* Özellikler */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2.5">Ev Özellikleri</label>
                    <div className="space-y-2">
                      {AMENITIES_LIST.map((amenity) => (
                        <label key={amenity.id} className="flex items-center gap-3 cursor-pointer group p-2.5 border border-gray-100 rounded-xl hover:bg-blue-50/50 hover:border-blue-200 transition-all">
                          <div className="relative flex items-center justify-center">
                            <input 
                              type="checkbox" 
                              checked={filters.amenities.includes(amenity.id)}
                              onChange={() => handleAmenityToggle(amenity.id)}
                              className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded-md checked:bg-blue-600 checked:border-blue-600 cursor-pointer transition-all"
                            />
                            <FiHome className="absolute text-white opacity-0 peer-checked:opacity-100 w-3 h-3 pointer-events-none" />
                          </div>
                          <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors font-medium">{amenity.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </form>
              </div>

              {/* Sabit Footer: Sonuçları Getir Butonu */}
              <div className="sticky bottom-0 bg-white pt-3 pb-1 border-t border-gray-100">
                <button type="submit" form="filter-form" className="w-full bg-blue-600 text-white font-extrabold py-3 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95 text-sm">
                  {isLoading ? 'Aranıyor...' : 'Sonuçları Getir'}
                </button>
              </div>
            </div>
          </div>

          {/* ═══════════ SAĞ KOLON - İLANLAR GRUBU (lg:col-span-9) ═══════════ */}
          <div className="lg:col-span-9">
            
            {/* Üst Bilgi ve Sıralama Barı */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6">
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-extrabold text-gray-900">
                  {filters.type === 'Satılık' ? 'Satılık İlanlar' : filters.type === 'Kiralık' ? 'Kiralık İlanlar' : 'Tüm İlanlar'}
                </h1>
                <span className="bg-blue-50 text-blue-700 font-bold text-sm px-3 py-1 rounded-full">
                  {metaData?.totalCount || 0} Sonuç
                </span>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Sırala:</label>
                <select 
                  value={filters.sortBy}
                  onChange={(e) => {
                    const newFilters = { ...filters, sortBy: e.target.value, pageNumber: 1 };
                    setFilters(newFilters);
                    fetchProducts(newFilters);
                  }}
                  className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 font-medium"
                >
                  <option value="DateDesc">En Yeniler</option>
                  <option value="DateAsc">En Eskiler</option>
                  <option value="PriceAsc">Fiyat: Düşük → Yüksek</option>
                  <option value="PriceDesc">Fiyat: Yüksek → Düşük</option>
                </select>
              </div>
            </div>

            {/* İlan Grid'i */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="h-[380px] bg-gray-200 animate-pulse rounded-2xl"></div>
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
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.map((product: any) => (
                  <ProductCard
                    key={product.productId}
                    product={product}
                    isFavorite={favoriteIds.includes(product.productId)}
                    onFavoriteToggle={handleFavoriteToggle}
                  />
                ))}
              </div>
            )}

            {/* SAYFALAMA */}
            {metaData && metaData.totalPages > 1 && (
              <div className="mt-10 flex justify-center items-center gap-2">
                <button onClick={() => handlePageChange(metaData.currentPage - 1)} disabled={!metaData.hasPrevious} className="p-3 bg-white rounded-xl shadow-sm border border-gray-200 disabled:opacity-50 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                  <FiChevronLeft className="text-lg" />
                </button>
                {[...Array(metaData.totalPages)].map((_, i) => {
                  const page = i + 1;
                  return (
                    <button key={page} onClick={() => handlePageChange(page)} className={`w-11 h-11 rounded-xl font-extrabold text-sm shadow-sm border transition-all ${metaData.currentPage === page ? 'bg-blue-600 text-white border-blue-600 scale-110' : 'bg-white text-gray-600 border-gray-200 hover:bg-blue-50 hover:text-blue-600'}`}>
                      {page}
                    </button>
                  );
                })}
                <button onClick={() => handlePageChange(metaData.currentPage + 1)} disabled={!metaData.hasNext} className="p-3 bg-white rounded-xl shadow-sm border border-gray-200 disabled:opacity-50 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                  <FiChevronRight className="text-lg" />
                </button>
              </div>
            )}

          </div>

        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
  .custom-scrollbar::-webkit-scrollbar { width: 5px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 10px; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
`}} />
    </div>
  );
}