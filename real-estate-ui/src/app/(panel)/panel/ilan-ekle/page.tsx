"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { getAllCategoriesAPI } from '@/services/categoryService';
import {
  createProductDraftAPI, addProductDetailAPI, uploadImageAPI,
  updateProductAPI, addProductImagesAPI, publishProductAPI,
  getProductAmenitiesAPI, updateProductAmenityAPI
} from '@/services/productService';
import { FiCheckCircle, FiChevronRight, FiChevronLeft, FiUploadCloud, FiImage, FiMapPin, FiNavigation } from 'react-icons/fi';
import { geocodeAddress } from '@/utils/geocode';
import { getCities, getDistrictsByCity, getNeighborhoodsByDistrict } from '@/constants/locations';
import SearchableDropdown from '@/components/SearchableDropdown';

// SSR hatasını önlemek için dynamic import ve yüklenme animasyonu eklendi
const MapSelector = dynamic(() => import('@/components/MapSelector'), { 
  ssr: false,
  loading: () => (
    <div className="h-[350px] w-full bg-gray-100 animate-pulse rounded-xl flex items-center justify-center text-gray-400 font-medium border border-gray-200">
      Harita yükleniyor...
    </div>
  ),
});

export default function AddProductWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingText, setLoadingText] = useState('');

  // Cascading dropdown state'leri
  const [cities, setCities] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<string[]>([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState('');
  const [isLoadingLocations, setIsLoadingLocations] = useState(true);

  // 81 ili yükle
  useEffect(() => {
    getCities().then(setCities).finally(() => setIsLoadingLocations(false));
  }, []);

  // 1. ADIM: TEMEL BİLGİLER
  const [basicInfo, setBasicInfo] = useState({
    title: '', price: '', description: '', type: 'Satılık', categoryId: '',
    city: '', district: '', neighborhood: '', address: '',
    latitude: 39.92077, longitude: 32.85411 // Varsayılan: Ankara
  });

  // 2. ADIM: DETAYLAR
  const [details, setDetails] = useState({
    size: '', roomCount: '', bedroomCount: '', bathCount: '', videoUrl: ''
  });

  // 3. ADIM: GELİŞMİŞ DOSYA YÜKLEME
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [galleryImages, setGalleryImages] = useState<File[]>([]);

  const coverInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // 4. ADIM: AMENITIES
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const amenityList = ["Otopark", "Havuz", "Güvenlik", "Asansör", "Balkon", "Wifi", "Klima", "Spor Salonu"];

  useEffect(() => {
    getAllCategoriesAPI().then(data => setCategories(data)).catch(() => {});
  }, []);

  // Şehir değişince ilçeleri async yükle, ilçe ve mahalleyi sıfırla
  const handleCityChange = async (city: string) => {
    setSelectedCity(city);
    setSelectedDistrict('');
    setSelectedNeighborhood('');
    setDistricts([]);
    setNeighborhoods([]);
    setBasicInfo({ ...basicInfo, city, district: '', neighborhood: '' });
    if (city) {
      const d = await getDistrictsByCity(city);
      setDistricts(d);
    }
  };

  // İlçe değişince mahalleleri async yükle, mahalleyi sıfırla
  const handleDistrictChange = async (district: string) => {
    setSelectedDistrict(district);
    setSelectedNeighborhood('');
    setNeighborhoods([]);
    setBasicInfo({ ...basicInfo, district, neighborhood: '' });
    if (selectedCity && district) {
      const n = await getNeighborhoodsByDistrict(selectedCity, district);
      setNeighborhoods(n);
    }
  };

  // Mahalle değişince basicInfo'yu güncelle
  const handleNeighborhoodChange = async (neighborhood: string) => {
    setSelectedNeighborhood(neighborhood);
    setBasicInfo({ ...basicInfo, neighborhood });

    // Otomatik geocode - adresi koordinata çevir
    if (selectedCity && selectedDistrict && neighborhood) {
      const coords = await geocodeAddress(selectedCity, selectedDistrict, neighborhood);
      if (coords) {
        setBasicInfo(prev => ({ ...prev, neighborhood, latitude: coords.lat, longitude: coords.lng }));
      }
    }
  };

  const handleLocationChange = (lat: number, lng: number) => {
    setBasicInfo({ ...basicInfo, latitude: lat, longitude: lng });
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      setLoadingText('İlan taslağı oluşturuluyor...');
      const draftRes = await createProductDraftAPI({
        ...basicInfo,
        price: Number(basicInfo.price),
        categoryId: Number(basicInfo.categoryId),
        latitude: basicInfo.latitude,
        longitude: basicInfo.longitude,
      });
      const pId = draftRes.productId || draftRes.ProductId;

      setLoadingText('İlan detayları ekleniyor...');
      await addProductDetailAPI({
        productId: pId,
        size: Number(details.size), roomCount: Number(details.roomCount),
        bedroomCount: Number(details.bedroomCount), bathCount: Number(details.bathCount),
        videoUrl: details.videoUrl
      });

      let uploadedCoverUrl = "default-draft.png";
      if (coverImage) {
        setLoadingText('Kapak resmi sunucuya yükleniyor...');
        const coverRes = await uploadImageAPI(coverImage);
        uploadedCoverUrl = `https://localhost:7252${coverRes.url || coverRes.Url}`;
        await updateProductAPI({
          productId: pId, ...basicInfo,
          price: Number(basicInfo.price), categoryId: Number(basicInfo.categoryId),
          coverImage: uploadedCoverUrl,
          latitude: basicInfo.latitude, longitude: basicInfo.longitude,
        });
      }

      if (galleryImages.length > 0) {
        const uploadedGalleryUrls = [];
        for (let i = 0; i < galleryImages.length; i++) {
          setLoadingText(`Galeri resimleri yükleniyor (${i + 1}/${galleryImages.length})...`);
          const galRes = await uploadImageAPI(galleryImages[i]);
          uploadedGalleryUrls.push(`https://localhost:7252${galRes.url || galRes.Url}`);
        }
        await addProductImagesAPI({ productId: pId, imageUrls: uploadedGalleryUrls });
      }

      setLoadingText('Özellikler ayarlanıyor...');
      const productAmenities = await getProductAmenitiesAPI(pId);
      for (const pa of productAmenities) {
        const title = pa.amenityTitle || pa.AmenityTitle;
        if (selectedAmenities.includes(title)) {
          await updateProductAmenityAPI({ productAmenityId: pa.productAmenityId || pa.ProductAmenityId, status: true });
        }
      }

      setLoadingText('İlanınız yayına alınıyor!');
      await publishProductAPI(pId);

      router.push('/panel/ilanlarim');

    } catch (error) {
      console.error(error);
      alert('İlan kaydedilirken bir hata oluştu.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-gray-800">İlan Ekleme Sihirbazı</h2>
        <p className="text-gray-500 mt-1">İlanınızı, resimlerinizi ve ev özelliklerinizi adım adım sisteme yükleyin.</p>
      </div>

      <div className="flex items-center justify-between mb-8 relative">
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 z-0"></div>
        <div className={`absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-blue-600 z-0 transition-all duration-500`} style={{ width: `${((step - 1) / 3) * 100}%` }}></div>
        {[1, 2, 3, 4].map((num) => (
          <div key={num} className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full font-bold transition-colors duration-500 ${step >= num ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>{num}</div>
        ))}
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 min-h-[400px]">

        {step === 1 && (
          <div className="space-y-6 animate-fadeIn">
            <h3 className="text-xl font-bold text-gray-800 border-b pb-2">1. Temel Bilgiler</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2"><label className="block text-sm font-medium text-gray-700 mb-2">İlan Başlığı</label><input type="text" value={basicInfo.title} onChange={e => setBasicInfo({...basicInfo, title: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border rounded-xl outline-none" /></div>
              <div className="col-span-2"><label className="block text-sm font-medium text-gray-700 mb-2">Açıklama</label><textarea rows={3} value={basicInfo.description} onChange={e => setBasicInfo({...basicInfo, description: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border rounded-xl outline-none" /></div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">İlan Tipi</label>
                <select value={basicInfo.type} onChange={e => setBasicInfo({...basicInfo, type: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border rounded-xl outline-none">
                  <option value="Satılık">Satılık</option>
                  <option value="Kiralık">Kiralık</option>
                  <option value="Günlük Kiralık">Günlük Kiralık</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kategori (Mülk Tipi)</label>
                <select value={basicInfo.categoryId} onChange={e => setBasicInfo({...basicInfo, categoryId: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border rounded-xl outline-none">
                  <option value="">Seçiniz</option>
                  {categories.map((cat: any) => (<option key={cat.categoryId || cat.id} value={cat.categoryId || cat.id}>{cat.name || cat.categoryName}</option>))}
                </select>
              </div>

              <div className="col-span-2"><label className="block text-sm font-medium text-gray-700 mb-2">Fiyat (₺)</label><input type="number" value={basicInfo.price} onChange={e => setBasicInfo({...basicInfo, price: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border rounded-xl outline-none" /></div>

              {/* 🌟 ARANABİLİR CASCADING DROPDOWN: İL */}
              <div className="col-span-2 md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2"><FiMapPin className="text-blue-500" /> İl</label>
                <SearchableDropdown
                  options={cities}
                  value={selectedCity}
                  onChange={handleCityChange}
                  placeholder="İl ara..."
                  disabled={isLoadingLocations}
                />
              </div>

              {/* 🌟 ARANABİLİR CASCADING DROPDOWN: İLÇE */}
              <div className="col-span-2 md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">İlçe</label>
                <SearchableDropdown
                  options={districts}
                  value={selectedDistrict}
                  onChange={handleDistrictChange}
                  placeholder="İlçe ara..."
                  disabled={!selectedCity}
                />
              </div>

              {/* 🌟 ARANABİLİR CASCADING DROPDOWN: MAHALLE */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Mahalle</label>
                <SearchableDropdown
                  options={neighborhoods}
                  value={selectedNeighborhood}
                  onChange={handleNeighborhoodChange}
                  placeholder="Mahalle ara..."
                  disabled={!selectedDistrict}
                />
              </div>

              {/* 🌟 AÇIK ADRES */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Açık Adres</label>
                <input
                  type="text"
                  value={basicInfo.address}
                  onChange={(e) => setBasicInfo({ ...basicInfo, address: e.target.value })}
                  placeholder="Cadde, Sokak, Bina No, Daire No..."
                  className="w-full px-4 py-3 bg-gray-50 border rounded-xl outline-none"
                />
              </div>

              {/* 🌟 ETKİLEŞİMLİ HARİTA */}
              <div className="col-span-2 mt-4">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <FiNavigation className="text-blue-600" /> Konum Seçimi (Haritaya tıklayın veya pini sürükleyin)
                  </label>
                  <div className="text-xs font-semibold bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                    Lat: {basicInfo.latitude.toFixed(5)}, Lng: {basicInfo.longitude.toFixed(5)}
                  </div>
                </div>
                <div className="rounded-xl overflow-hidden border border-gray-200">
                  <MapSelector
                    latitude={basicInfo.latitude}
                    longitude={basicInfo.longitude}
                    onLocationChange={handleLocationChange}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-fadeIn">
            <h3 className="text-xl font-bold text-gray-800 border-b pb-2">2. Detaylı Ev Bilgileri</h3>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Büyüklük (m²)</label><input type="number" value={details.size} onChange={e => setDetails({...details, size: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border rounded-xl outline-none" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Oda Sayısı</label><input type="number" value={details.roomCount} onChange={e => setDetails({...details, roomCount: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border rounded-xl outline-none" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Yatak Odası</label><input type="number" value={details.bedroomCount} onChange={e => setDetails({...details, bedroomCount: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border rounded-xl outline-none" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Banyo Sayısı</label><input type="number" value={details.bathCount} onChange={e => setDetails({...details, bathCount: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border rounded-xl outline-none" /></div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-fadeIn">
            <h3 className="text-xl font-bold text-gray-800 border-b pb-2">3. Görseller</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Kapak Resmi</label>
              <div
                onClick={() => coverInputRef.current?.click()}
                className="w-full h-48 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-blue-400 transition-all overflow-hidden relative"
              >
                <input type="file" ref={coverInputRef} accept="image/*" onChange={handleCoverChange} className="hidden" />
                {coverPreview ? (
                  <>
                    <img src={coverPreview} alt="Kapak Önizleme" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <p className="text-white font-bold flex items-center gap-2"><FiImage /> Resmi Değiştir</p>
                    </div>
                  </>
                ) : (
                  <>
                    <FiUploadCloud className="text-4xl text-blue-500 mb-2" />
                    <p className="font-bold text-gray-700">Kapak Resmi Seçmek İçin Tıklayın</p>
                    <p className="text-xs text-gray-400 mt-1">PNG, JPG veya WEBP (Max. 5MB)</p>
                  </>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 mt-4">Galeri Resimleri (Çoklu Seçim)</label>
              <div
                onClick={() => galleryInputRef.current?.click()}
                className="w-full p-6 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-blue-400 transition-all"
              >
                <input type="file" ref={galleryInputRef} multiple accept="image/*" onChange={(e) => setGalleryImages(Array.from(e.target.files || []))} className="hidden" />
                <FiImage className="text-3xl text-gray-400 mb-2" />
                {galleryImages.length > 0 ? (
                  <p className="font-bold text-blue-600">{galleryImages.length} adet resim seçildi. Değiştirmek için tıklayın.</p>
                ) : (
                  <p className="font-bold text-gray-700">Çoklu resim seçmek için tıklayın</p>
                )}
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6 animate-fadeIn">
            <h3 className="text-xl font-bold text-gray-800 border-b pb-2">4. Mülk Özellikleri (Amenities)</h3>
            <p className="text-sm text-gray-500 mb-4">Bu evde hangi özellikler bulunuyor? Seçtiğiniz özellikler ilan filtrelemesinde kullanılacaktır.</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {amenityList.map(amenity => (
                <label key={amenity} className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:bg-blue-50 transition-colors">
                  <input type="checkbox" className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    onChange={(e) => {
                      if (e.target.checked) setSelectedAmenities([...selectedAmenities, amenity]);
                      else setSelectedAmenities(selectedAmenities.filter(a => a !== amenity));
                    }}
                  />
                  <span className="font-medium text-gray-700">{amenity}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {isSubmitting && (
          <div className="absolute inset-0 bg-white/90 z-50 flex flex-col items-center justify-center rounded-2xl">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-xl font-bold text-gray-800">{loadingText}</p>
          </div>
        )}

        <div className="flex justify-between mt-10 pt-6 border-t border-gray-100">
          <button onClick={() => setStep(step - 1)} disabled={step === 1 || isSubmitting} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${step === 1 ? 'opacity-0 cursor-default' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
            <FiChevronLeft /> Geri
          </button>
          {step < 4 ? (
            <button onClick={() => setStep(step + 1)} className="flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 shadow-md">
              İleri <FiChevronRight />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={isSubmitting} className="flex items-center gap-2 bg-green-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-green-700 shadow-md">
              <FiCheckCircle /> Kaydet ve Yayınla
            </button>
          )}
        </div>

      </div>
    </div>
  );
}