"use client";

import { useEffect, useState, use } from 'react';
// HATA ÇÖZÜMÜ İÇİN GÖRECELİ YOL (Relative Path) KULLANILDI
import { getProductWithDetailsAPI } from '../../../../services/productService';
import { getAgentDetailAPI } from '../../../../services/agentDetailService';
import { 
  FiMapPin, FiCheck, FiChevronLeft, FiChevronRight, 
  FiX, FiShare2, FiHeart, FiPhone, FiInstagram, FiFacebook, FiTwitter 
} from 'react-icons/fi';
import { useAuthStore } from '../../../../store/useAuthStore';
import { toggleFavoriteAPI, getMyFavoritesAPI } from '../../../../services/favoriteService';
import dynamic from 'next/dynamic';
import ChatWidget from '../../../../components/ChatWidget';

const MapView = dynamic(() => import('../../../../components/MapView'), { ssr: false });

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [product, setProduct] = useState<any>(null);
  const [agentDetail, setAgentDetail] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Galeri Yönetimi
  const [activeImageIndex, setActiveImageIndex] = useState(0); 
  const [lightboxOpen, setLightboxOpen] = useState(false);     

  const { user } = useAuthStore();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);

  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!id) return;
      try {
        const data = await getProductWithDetailsAPI(Number(id));
        setProduct(data);
        
        // İlanı çektikten sonra, o ilanı ekleyen Emlakçının (AppUserId) profilini de çekiyoruz!
        if (data.appUserId) {
           const agentData = await getAgentDetailAPI(data.appUserId);
           setAgentDetail(agentData);
        }

        // 🌟 FAVORİ KONTROLÜ (Kullanıcı giriş yapmışsa çalışır)
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

  // Klavye Desteği
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
      alert("Favorilere eklemek için lütfen önce giriş yapın.");
      return;
    }
    
    setIsFavoriteLoading(true);
    try {
      await toggleFavoriteAPI(Number(id));
      setIsFavorite(!isFavorite); // Durumu tersine çevir (Toggle)
    } catch (error) {
      alert("Favori işlemi sırasında bir hata oluştu.");
    } finally {
      setIsFavoriteLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-20 pt-8">
      
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
        
        {/* Üst Kısım: Başlık ve Butonlar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">{product.title}</h1>
            <p className="text-gray-500 mt-2 flex items-center gap-2 font-medium">
              <FiMapPin className="text-blue-600" /> {product.city}, {product.district}
            </p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 text-gray-600 bg-white border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 font-medium transition-colors">
              <FiShare2 /> Paylaş
            </button>
            <button 
     onClick={handleFavoriteClick}
     disabled={isFavoriteLoading}
     className={`flex items-center gap-2 border px-4 py-2 rounded-lg font-medium transition-colors ${
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

        {/* Ana İçerik Grid'i */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* SOL TARAF: GALERİ VE AÇIKLAMALAR */}
          <div className="lg:col-span-2">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
              
              {/* Ana Büyük Resim */}
              <div 
                className="w-full aspect-[4/3] bg-gray-100 rounded-xl overflow-hidden cursor-pointer relative group"
                onClick={() => setLightboxOpen(true)}
              >
                <img 
                  src={allImages[activeImageIndex]} 
                  alt="Ana Resim" 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
              </div>

              {/* Küçük Resimler (Thumbnails) */}
              <div className="flex gap-2 mt-4 overflow-x-auto pb-2 custom-scrollbar">
                {allImages.map((img, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => setActiveImageIndex(idx)}
                    className={`flex-shrink-0 w-24 h-16 md:w-32 md:h-24 rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${activeImageIndex === idx ? 'border-blue-600 opacity-100 scale-95' : 'border-transparent opacity-70 hover:opacity-100'}`}
                  >
                    <img src={img} className="w-full h-full object-cover" alt={`Thumb ${idx}`} />
                  </div>
                ))}
              </div>
            </div>

            {/* İlan Açıklaması */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 mt-8">
              <h3 className="text-xl font-bold text-gray-900 border-b pb-4 mb-6">İlan Açıklaması</h3>
              <p className="text-gray-700 whitespace-pre-line text-lg leading-relaxed">{product.description}</p>
            </div>

            {/* Ev Özellikleri (Amenities) */}
            {product.amenities && product.amenities.length > 0 && (
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 mt-8">
                <h3 className="text-xl font-bold text-gray-900 border-b pb-4 mb-6">İç ve Dış Özellikler</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {product.amenities.map((amenity: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-3 text-gray-800 font-medium">
                      <FiCheck className="text-green-500 text-xl" /> {amenity}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 🌟 HARİTA - KONUM */}
            {product.latitude && product.longitude ? (
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 mt-8">
                <h3 className="text-xl font-bold text-gray-900 border-b pb-4 mb-6 flex items-center gap-2">
                  <FiMapPin className="text-blue-600" /> Konum
                </h3>
                <MapView latitude={product.latitude} longitude={product.longitude} />
                <p className="text-sm text-gray-500 mt-3">
                  {product.address || [product.neighborhood, product.district, product.city].filter(Boolean).join(', ')}
                </p>
              </div>
            ) : null}
          </div>

          {/* SAĞ TARAF: FİYAT VE PROFESYONEL DETAY TABLOSU */}
          <div className="space-y-6">
            
            {/* Fiyat Kutusu */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 text-center">
              <p className="text-gray-500 font-medium mb-1">Satış Fiyatı</p>
              <p className="text-4xl font-extrabold text-blue-600">
                {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(product.price)}
              </p>
            </div>

            {/* Detay Tablosu */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <h3 className="text-lg font-bold text-gray-900 bg-gray-50 p-5 border-b border-gray-200">İlan Detayları</h3>
              <div className="divide-y divide-gray-100">
                <div className="flex justify-between p-4 hover:bg-gray-50 transition-colors"><span className="text-gray-500 font-medium">Emlak Tipi</span><span className="font-bold text-gray-900">{product.categoryName || '-'}</span></div>
                <div className="flex justify-between p-4 hover:bg-gray-50 transition-colors"><span className="text-gray-500 font-medium">İlan Durumu</span><span className="font-bold text-blue-600">{product.type || '-'}</span></div>
                <div className="flex justify-between p-4 hover:bg-gray-50 transition-colors"><span className="text-gray-500 font-medium">Brüt M²</span><span className="font-bold text-gray-900">{product.size} m²</span></div>
                <div className="flex justify-between p-4 hover:bg-gray-50 transition-colors"><span className="text-gray-500 font-medium">Oda Sayısı</span><span className="font-bold text-gray-900">{product.roomCount}</span></div>
                <div className="flex justify-between p-4 hover:bg-gray-50 transition-colors"><span className="text-gray-500 font-medium">Yatak Odası</span><span className="font-bold text-gray-900">{product.bedroomCount}</span></div>
                <div className="flex justify-between p-4 hover:bg-gray-50 transition-colors"><span className="text-gray-500 font-medium">Banyo Sayısı</span><span className="font-bold text-gray-900">{product.bathCount}</span></div>
              </div>
            </div>

            {/* İletişim & Emlakçı Kutusu */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
               <h3 className="text-lg font-bold text-gray-900 mb-6 border-b pb-3">İlan Danışmanı</h3>
               
               {agentDetail ? (
                 <div className="space-y-4">
                    {/* Fotoğraf ve İsim */}
                    <div className="flex items-center gap-4">
                       <img 
                         src={agentDetail.imageUrl || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80'} 
                         alt={agentDetail.agentName} 
                         className="w-16 h-16 rounded-full object-cover border-2 border-blue-100" 
                       />
                       <div>
                         <h4 className="font-extrabold text-gray-900">{agentDetail.agentName || 'Danışman'}</h4>
                         <p className="text-blue-600 text-sm font-semibold">{agentDetail.title || 'Gayrimenkul Uzmanı'}</p>
                       </div>
                    </div>

                    {/* Biyografi (Varsa) */}
                    {agentDetail.description && (
                      <p className="text-sm text-gray-600 line-clamp-3 italic">"{agentDetail.description}"</p>
                    )}

                    {/* Sosyal Medya İkonları */}
                    <div className="flex items-center gap-3 pt-2">
                       {agentDetail.instagramUrl && <a href={agentDetail.instagramUrl} target="_blank" rel="noreferrer" className="p-2 bg-pink-50 text-pink-600 rounded-lg hover:bg-pink-100 transition"><FiInstagram /></a>}
                       {agentDetail.facebookUrl && <a href={agentDetail.facebookUrl} target="_blank" rel="noreferrer" className="p-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition"><FiFacebook /></a>}
                       {agentDetail.twitterUrl && <a href={agentDetail.twitterUrl} target="_blank" rel="noreferrer" className="p-2 bg-gray-50 text-blue-400 rounded-lg hover:bg-gray-100 transition"><FiTwitter /></a>}
                    </div>

                    {/* İletişim Butonları */}
                    <div className="pt-4 space-y-3">
                      <a href={`tel:${agentDetail.phoneNumber}`} className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 shadow-md transition-colors">
                        <FiPhone /> {agentDetail.phoneNumber || 'Hemen Ara'}
                      </a>
                      <button className="w-full bg-green-50 text-green-700 font-bold py-3.5 rounded-xl hover:bg-green-100 transition-colors">
                        WhatsApp'tan Yaz
                      </button>
                    </div>
                 </div>
               ) : (
                 <div>
                   <p className="text-gray-500 text-sm mb-4">Bu ilanın danışmanı henüz detaylı profilini oluşturmamış.</p>
                   <button className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 shadow-md transition-colors mb-3">Hemen Ara</button>
                 </div>
               )}

               {/* 🌟 CANLI MESAJLAŞMA */}
               {product.appUserId && (
                 <div className="pt-4 border-t border-gray-200">
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
      `}} />
    </div>
  );
}