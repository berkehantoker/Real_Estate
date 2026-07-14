"use client";

import { useEffect, useState, use } from 'react';
import { getProductWithDetailsAPI } from '../../../../services/productService';
import { getAgentDetailAPI } from '../../../../services/agentDetailService';
import { 
  FiMapPin, FiCheck, FiChevronLeft, FiChevronRight, 
  FiX, FiShare2, FiHeart, FiPhone, FiInstagram, FiFacebook, FiTwitter,
  FiHome, FiDollarSign, FiLayers, FiMaximize
} from 'react-icons/fi';
import { useAuthStore } from '../../../../store/useAuthStore';
import { toggleFavoriteAPI, getMyFavoritesAPI } from '../../../../services/favoriteService';
import dynamic from 'next/dynamic';
import ChatWidget from '../../../../components/ChatWidget';
import toast from 'react-hot-toast';

const MapView = dynamic(() => import('../../../../components/MapView'), { ssr: false });

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [product, setProduct] = useState<any>(null);
  const [agentDetail, setAgentDetail] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [activeImageIndex, setActiveImageIndex] = useState(0); 
  const [lightboxOpen, setLightboxOpen] = useState(false);     

  const [activeTab, setActiveTab] = useState<'details' | 'location'>('details');

  const { user } = useAuthStore();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);

  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!id) return;
      try {
        const data = await getProductWithDetailsAPI(Number(id));
        setProduct(data);
        
        if (data.appUserId) {
           const agentData = await getAgentDetailAPI(data.appUserId);
           setAgentDetail(agentData);
        }

        if (user) {
           const myFavorites = await getMyFavoritesAPI();
           const isFav = myFavorites.some((fav: any) => fav.productId === Number(id));
           setIsFavorite(isFav);
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchProductDetails();
  }, [id]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxOpen) return;
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'Escape') setLightboxOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, activeImageIndex, product]);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-xl text-gray-500 font-medium">İlan detayları yükleniyor...</div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center text-xl text-red-500 font-bold">İlan bulunamadı!</div>;

  const allImages = [product.coverImage, ...(product.imageUrls || [])].filter(Boolean);
  const handleNext = () => setActiveImageIndex((prev) => (prev + 1) % allImages.length);
  const handlePrev = () => setActiveImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);

 

  const handleFavoriteClick = async () => {
    if (!user) {
      toast.error("Favorilere eklemek için lütfen önce giriş yapın.");
      return;
    }
    
    setIsFavoriteLoading(true);
    try {
      await toggleFavoriteAPI(Number(id));
      const newFavState = !isFavorite;
      setIsFavorite(newFavState);
      toast.success(newFavState ? "İlan favorilere eklendi!" : "İlan favorilerden çıkarıldı.");
    } catch (error) {
      toast.error("Favori işlemi sırasında bir hata oluştu.");
    } finally {
      setIsFavoriteLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen pb-20 pt-8">
      
      {/* --- TAM EKRAN LIGHTBOX (MODAL) --- */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-[999] bg-black/95 flex items-center justify-center select-none">
          <button onClick={() => setLightboxOpen(false)} className="absolute top-6 right-6 text-white/70 hover:text-white text-4xl z-50"><FiX /></button>
          {allImages.length > 1 && (
            <button onClick={(e) => { e.stopPropagation(); handlePrev(); }} className="absolute left-4 text-white hover:text-gray-300 text-5xl bg-black/50 rounded-full p-2 z-50"><FiChevronLeft /></button>
          )}
          <img src={allImages[activeImageIndex]} alt="Büyük Galeri" className="max-w-full max-h-[90vh] object-contain" />
          {allImages.length > 1 && (
            <button onClick={(e) => { e.stopPropagation(); handleNext(); }} className="absolute right-4 text-white hover:text-gray-300 text-5xl bg-black/50 rounded-full p-2 z-50"><FiChevronRight /></button>
          )}
          <div className="absolute bottom-6 text-white font-medium bg-black/60 px-6 py-2 rounded-full">
            {activeImageIndex + 1} / {allImages.length}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ═══════════ ÜST BİLGİ BARI (HEADER) ═══════════ */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5 mb-10 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">{product.title}</h1>
            <div className="flex items-center gap-3 flex-wrap">
              <p className="text-gray-500 font-medium flex items-center gap-1.5 text-sm">
                <FiMapPin className="text-blue-600" /> 
                {product.city} / {product.district}{product.neighborhood ? ` / ${product.neighborhood}` : ''}
              </p>
              {product.categoryName && (
                <span className="bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full border border-blue-200">
                  {product.categoryName}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                toast.success("İlan linki panoya kopyalandı!");
              }}
              className="flex items-center gap-2 text-gray-600 bg-white border border-gray-200 px-5 py-2.5 rounded-xl hover:bg-gray-50 hover:border-gray-300 font-semibold transition-all shadow-sm"
            >
              <FiShare2 /> Paylaş
            </button>
            <button 
              onClick={handleFavoriteClick}
              disabled={isFavoriteLoading}
              className={`flex items-center gap-2 border px-5 py-2.5 rounded-xl font-semibold transition-all shadow-sm ${
                isFavorite 
                  ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100' 
                  : 'bg-white text-gray-600 border-gray-200 hover:text-red-500 hover:bg-red-50'
              }`}
            >
              <FiHeart className={isFavorite ? "fill-current" : ""} /> 
              {isFavorite ? 'Favorilerden Çıkar' : 'Favoriye Al'}
            </button>
          </div>
        </div>

        {/* ═══════════ ANA GÖVDE (GRID) ═══════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* ═══════════ SOL KOLON (7/12) - RESİMLER VE SEKMELER ═══════════ */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* --- Resim Galerisi --- */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
              <div 
                className="w-full aspect-[16/10] bg-gray-100 overflow-hidden cursor-pointer relative group"
                onClick={() => setLightboxOpen(true)}
              >
                <img 
                  src={allImages[activeImageIndex] || 'https://via.placeholder.com/800x500?text=Resim+Yok'} 
                  alt="Ana Resim" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent group-hover:from-black/10 transition-colors"></div>
                {allImages.length > 1 && (
                  <div className="absolute bottom-4 right-4 bg-black/60 text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                    <FiMaximize className="w-3 h-3" /> {activeImageIndex + 1} / {allImages.length}
                  </div>
                )}
              </div>

              {allImages.length > 1 && (
                <div className="flex gap-2.5 p-4 overflow-x-auto custom-scrollbar border-t border-gray-100">
                  {allImages.map((img, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => setActiveImageIndex(idx)}
                      className={`flex-shrink-0 w-20 h-16 md:w-28 md:h-20 rounded-xl overflow-hidden cursor-pointer border-2 transition-all duration-300 ${
                        activeImageIndex === idx 
                          ? 'border-blue-600 opacity-100 scale-95 shadow-lg ring-2 ring-blue-200' 
                          : 'border-gray-200 opacity-70 hover:opacity-100 hover:border-gray-400'
                      }`}
                    >
                      <img src={img} className="w-full h-full object-cover" alt={`Thumb ${idx}`} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* --- Sekme Butonları --- */}
            <div className="flex border-b border-gray-200 bg-white rounded-t-2xl">
              <button
                onClick={() => setActiveTab('details')}
                className={`flex-1 py-4 text-sm font-bold transition-all duration-300 relative ${
                  activeTab === 'details' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  <FiHome className="w-4 h-4" /> İlan Ayrıntıları
                </span>
                {activeTab === 'details' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full mx-8"></div>
                )}
              </button>
              <button
                onClick={() => setActiveTab('location')}
                className={`flex-1 py-4 text-sm font-bold transition-all duration-300 relative ${
                  activeTab === 'location' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  <FiMapPin className="w-4 h-4" /> Harita ve Konum
                </span>
                {activeTab === 'location' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full mx-8"></div>
                )}
              </button>
            </div>

            {activeTab === 'details' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                  <h3 className="text-lg font-extrabold text-gray-900 mb-5 flex items-center gap-2">
                    <FiLayers className="text-blue-600" /> İlan Açıklaması
                  </h3>
                  <p className="text-gray-600 whitespace-pre-line text-base leading-relaxed">{product.description}</p>
                </div>

                {product.amenities && product.amenities.length > 0 && (
                  <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-extrabold text-gray-900 mb-6 flex items-center gap-2">
                      <FiCheck className="text-emerald-600" /> İç ve Dış Özellikler
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {product.amenities.map((amenity: string, idx: number) => (
                        <div key={idx} className="flex items-center gap-3 bg-emerald-50/50 border border-emerald-100 rounded-xl px-4 py-2.5">
                          <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <FiCheck className="text-white w-3 h-3" />
                          </div>
                          <span className="text-gray-700 font-semibold text-sm">{amenity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'location' && (
              <div className="space-y-6 animate-fadeIn">
                {product.address && (
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FiMapPin className="text-blue-600 text-lg" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm mb-1">Açık Adres</h4>
                      <p className="text-gray-600 text-sm">{product.address}</p>
                    </div>
                  </div>
                )}

                {product.latitude && product.longitude ? (
                  <div className="bg-white p-4 rounded-2xl shadow-md border border-gray-100 overflow-hidden">
                    <MapView latitude={product.latitude} longitude={product.longitude} />
                    <p className="text-xs text-gray-400 mt-3 text-center">
                      {[product.neighborhood, product.district, product.city].filter(Boolean).join(', ')}
                    </p>
                  </div>
                ) : (
                  <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 text-center text-gray-400">
                    <FiMapPin className="text-4xl mx-auto mb-3 text-gray-300" />
                    <p className="font-medium">Bu ilan için konum bilgisi girilmemiş.</p>
                  </div>
                )}
              </div>
            )}

          </div>

          {/* ═══════════ SAĞ KOLON (5/12) - STICKY KARTLAR ═══════════ */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24 self-start">
            
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center">
              <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-bold px-3.5 py-1.5 rounded-full mb-4">
                {product.type}
              </div>
              <p className="text-4xl font-extrabold text-gray-900 tracking-tight">
                {new Intl.NumberFormat('tr-TR').format(product.price)} <span className="text-xl font-bold text-gray-400">₺</span>
              </p>
              <p className="text-sm text-gray-400 mt-2 font-medium">Toplam Fiyat</p>
            </div>

            <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
              <h3 className="text-sm font-extrabold text-gray-700 bg-gray-50 px-6 py-4 border-b border-gray-100 uppercase tracking-wider flex items-center gap-2">
                <FiDollarSign className="text-blue-600" /> İlan Özellikleri
              </h3>
              <div className="divide-y divide-gray-50">
                {[
                  { label: 'Kategori', value: product.categoryName || product.CategoryName || 'Belirtilmemiş' },
                  { label: 'İlan Tipi', value: product.type || '-' },
                  { label: 'Metrekare', value: product.size ? `${product.size} m²` : '-' },
                  { label: 'Oda Sayısı', value: product.roomCount || '-' },
                  { label: 'Yatak Odası', value: product.bedroomCount || '-' },
                  { label: 'Banyo Sayısı', value: product.bathCount || '-' },
                  { label: 'İl / İlçe', value: `${product.city || '-'} / ${product.district || '-'}` },
                  { label: 'Mahalle', value: product.neighborhood || '-' },
                ].map((item, idx) => (
                  <div key={idx} className={`flex justify-between items-center px-6 py-3.5 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                    <span className="text-sm text-gray-500 font-medium">{item.label}</span>
                    <span className="text-sm font-bold text-gray-800 text-right max-w-[55%]">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-2xl p-6 shadow-xl">
              <h3 className="text-sm font-extrabold text-white/80 mb-6 uppercase tracking-wider border-b border-white/10 pb-3">
                İlan Danışmanı
              </h3>
              
              {agentDetail ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center flex-shrink-0 ring-2 ring-white/20 overflow-hidden">
                      {agentDetail.imageUrl ? (
                        <img src={agentDetail.imageUrl} alt={agentDetail.agentName} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xl font-bold text-white/60">
                          {(agentDetail.agentName || 'D').charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-white text-base">{agentDetail.agentName || 'Danışman'}</h4>
                      <p className="text-blue-300 text-xs font-semibold">{agentDetail.title || 'Gayrimenkul Uzmanı'}</p>
                    </div>
                  </div>

                  {agentDetail.description && (
                    <p className="text-sm text-gray-400 line-clamp-3 italic leading-relaxed border-l-2 border-white/20 pl-3">
                      "{agentDetail.description}"
                    </p>
                  )}

                  <div className="flex items-center gap-2.5 pt-2">
                    {agentDetail.instagramUrl && <a href={agentDetail.instagramUrl} target="_blank" rel="noreferrer" className="p-2.5 bg-white/10 text-white/70 rounded-xl hover:bg-pink-500 hover:text-white transition-all"><FiInstagram className="w-4 h-4" /></a>}
                    {agentDetail.facebookUrl && <a href={agentDetail.facebookUrl} target="_blank" rel="noreferrer" className="p-2.5 bg-white/10 text-white/70 rounded-xl hover:bg-blue-500 hover:text-white transition-all"><FiFacebook className="w-4 h-4" /></a>}
                    {agentDetail.twitterUrl && <a href={agentDetail.twitterUrl} target="_blank" rel="noreferrer" className="p-2.5 bg-white/10 text-white/70 rounded-xl hover:bg-sky-500 hover:text-white transition-all"><FiTwitter className="w-4 h-4" /></a>}
                  </div>

                  <div className="space-y-2.5 pt-2">
                    <a href={`tel:${agentDetail.phoneNumber}`} className="w-full flex items-center justify-center gap-2 bg-white/15 text-white font-bold py-3 rounded-xl hover:bg-white/25 shadow-md transition-all backdrop-blur-sm">
                      <FiPhone className="w-4 h-4" /> {agentDetail.phoneNumber || 'Hemen Ara'}
                    </a>
                    
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-gray-400 text-sm mb-4">Bu ilanın danışmanı henüz detaylı profilini oluşturmamış.</p>
                  <button className="w-full bg-white/15 text-white font-bold py-3.5 rounded-xl hover:bg-white/25 shadow-md transition-all mb-3">
                    Hemen Ara
                  </button>
                </div>
              )}

              {product.appUserId && (
                <div className="mt-5 pt-4 border-t border-white/10">
                  <ChatWidget 
                    productId={Number(id)} 
                    receiverId={product.appUserId} 
                    receiverName={agentDetail?.agentName || product.appUserName || 'Emlak Danışmanı'} 
                  />
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out; }
      `}} />
    </div>
  );
}