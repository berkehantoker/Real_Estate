"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useAuthStore } from '../../../../../store/useAuthStore';
import { getAllCategoriesAPI } from '../../../../../services/categoryService';
import { getProductWithDetailsAPI, updateProductAPI, uploadImageAPI, updateProductAmenitiesAPI, addProductImagesAPI, deleteProductImageAPI } from '../../../../../services/productService';
import { FiSave, FiArrowLeft, FiImage, FiMapPin, FiNavigation, FiTrash2, FiPlus } from 'react-icons/fi';
import Link from 'next/link';
import { getCities, getDistrictsByCity, getNeighborhoodsByDistrict } from '../../../../../constants/locations';
import SearchableDropdown from '../../../../../components/SearchableDropdown';
import { geocodeAddress } from '../../../../../utils/geocode';

const MapSelector = dynamic(() => import('../../../../../components/MapSelector'), {
  ssr: false,
  loading: () => (
    <div className="h-[350px] w-full bg-gray-100 animate-pulse rounded-xl flex items-center justify-center text-gray-400 font-medium border border-gray-200">
      Harita yükleniyor...
    </div>
  ),
});

const AMENITIES_LIST = [
  { id: 1, name: "Havuz" }, { id: 2, name: "Otopark" }, { id: 3, name: "Asansör" },
  { id: 4, name: "7/24 Güvenlik" }, { id: 5, name: "Balkon" }, { id: 6, name: "Klima" },
  { id: 7, name: "Yerden Isıtma" }, { id: 8, name: "Spor Salonu" }
];

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuthStore();

  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const [formData, setFormData] = useState({
    productId: 0,
    title: '', price: '', description: '', type: 'Satılık', categoryId: '',
    city: '', district: '', neighborhood: '', address: '',
    latitude: 39.92077, longitude: 32.85411,
    coverImage: '', appUserId: 0,
    amenities: [] as number[]
  });

  // Kapak resmi
  const [newCoverImage, setNewCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Galeri resimleri
  const [existingImages, setExistingImages] = useState<{ url: string; id: number }[]>([]);
  const [newGalleryImages, setNewGalleryImages] = useState<File[]>([]);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Mevcut resmi sil
  const handleDeleteImage = async (imageId: number) => {
    try {
      await deleteProductImageAPI(imageId);
      setExistingImages(prev => prev.filter(img => img.id !== imageId));
    } catch (error) {
      alert("Resim silinemedi.");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const cats = await getAllCategoriesAPI();
        setCategories(cats);

        const productId = Number(params.id);
        const productData = await getProductWithDetailsAPI(productId);

        setFormData({
          productId: productId,
          title: productData.title,
          price: productData.price?.toString() || '',
          description: productData.description || '',
          type: productData.type || 'Satılık',
          categoryId: productData.categoryId || cats[0]?.categoryId || '',
          city: productData.city || '',
          district: productData.district || '',
          neighborhood: productData.neighborhood || '',
          address: productData.address || '',
          latitude: productData.latitude || 39.92077,
          longitude: productData.longitude || 32.85411,
          coverImage: productData.coverImage || '',
          appUserId: Number(user?.id),
          amenities: productData.amenityIds || []
        });

        // Cascading dropdown'ları mevcut değerlere göre doldur
        setSelectedCity(productData.city || '');
        setSelectedDistrict(productData.district || '');
        setSelectedNeighborhood(productData.neighborhood || '');

        if (productData.city) {
          const d = await getDistrictsByCity(productData.city);
          setDistricts(d);
        }
        if (productData.city && productData.district) {
          const n = await getNeighborhoodsByDistrict(productData.city, productData.district);
          setNeighborhoods(n);
        }

        setCoverPreview(productData.coverImage);
        const urls = productData.imageUrls || [];
        const ids = productData.imageIds || [];
        setExistingImages(urls.map((url: string, i: number) => ({ url, id: ids[i] || 0 })));

      } catch (error) {
        console.error("Veriler çekilirken hata:", error);
        alert("İlan bilgileri yüklenemedi!");
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) fetchData();
  }, [params.id, user]);

  // Şehir değişince ilçeleri async yükle, ilçe ve mahalleyi sıfırla
  const handleCityChange = async (city: string) => {
    setSelectedCity(city);
    setSelectedDistrict('');
    setSelectedNeighborhood('');
    setDistricts([]);
    setNeighborhoods([]);
    setFormData({ ...formData, city, district: '', neighborhood: '' });
    if (city) {
      const d = await getDistrictsByCity(city);
      setDistricts(d);
    }
  };

  const handleDistrictChange = async (district: string) => {
    setSelectedDistrict(district);
    setSelectedNeighborhood('');
    setNeighborhoods([]);
    setFormData({ ...formData, district, neighborhood: '' });
    if (formData.city && district) {
      const n = await getNeighborhoodsByDistrict(formData.city, district);
      setNeighborhoods(n);
    }
  };

  const handleNeighborhoodChange = async (neighborhood: string) => {
    setSelectedNeighborhood(neighborhood);
    setFormData({ ...formData, neighborhood });

    // Otomatik geocode
    if (formData.city && formData.district && neighborhood) {
      const coords = await geocodeAddress(formData.city, formData.district, neighborhood);
      if (coords) {
        setFormData(prev => ({ ...prev, neighborhood, latitude: coords.lat, longitude: coords.lng }));
      }
    }
  };

  const handleLocationChange = (lat: number, lng: number) => {
    setFormData({ ...formData, latitude: lat, longitude: lng });
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewCoverImage(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleUpdate = async () => {
    setIsSubmitting(true);
    try {
      let finalCoverImage = formData.coverImage;

      if (newCoverImage) {
        const coverRes = await uploadImageAPI(newCoverImage);
        finalCoverImage = `https://localhost:7252${coverRes.url || coverRes.Url}`;
      }

      const updateDto = {
        productId: formData.productId,
        title: formData.title,
        price: Number(formData.price),
        city: formData.city,
        district: formData.district,
        neighborhood: formData.neighborhood,
        address: formData.address,
        latitude: formData.latitude,
        longitude: formData.longitude,
        description: formData.description,
        type: formData.type,
        categoryId: Number(formData.categoryId),
        coverImage: finalCoverImage,
        appUserId: formData.appUserId
      };

      await updateProductAPI(updateDto);

      await updateProductAmenitiesAPI({
        productId: formData.productId,
        amenityIds: formData.amenities
      });

      // Yeni galeri resimlerini yükle
      if (newGalleryImages.length > 0) {
        const uploadedGalleryUrls = [];
        for (const file of newGalleryImages) {
          const galRes = await uploadImageAPI(file);
          uploadedGalleryUrls.push(`https://localhost:7252${galRes.url || galRes.Url}`);
        }
        await addProductImagesAPI({ productId: formData.productId, imageUrls: uploadedGalleryUrls });
      }

      alert("İlan başarıyla güncellendi!");
      router.push('/panel/ilanlarim');

    } catch (error) {
      console.error(error);
      alert("İlan güncellenirken bir hata oluştu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="p-10 text-center animate-pulse text-gray-500 font-medium">İlan bilgileri yükleniyor...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto pb-20">

      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-800">İlanı Düzenle</h2>
          <p className="text-gray-500 mt-1">İlan bilgilerini, kapak resmini, konumunu ve ev özelliklerini buradan güncelleyebilirsiniz.</p>
        </div>
        <Link href="/panel/ilanlarim" className="flex items-center gap-2 text-gray-500 hover:text-gray-700 font-medium bg-gray-100 px-4 py-2 rounded-xl transition-colors">
          <FiArrowLeft /> İlanlarıma Dön
        </Link>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">İlan Başlığı</label>
            <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border rounded-xl outline-none" />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Açıklama</label>
            <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border rounded-xl outline-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">İlan Tipi</label>
            <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border rounded-xl outline-none">
              <option value="Satılık">Satılık</option>
              <option value="Kiralık">Kiralık</option>
              <option value="Günlük Kiralık">Günlük Kiralık</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
            <select value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border rounded-xl outline-none">
              {categories.map((cat: any) => (<option key={cat.categoryId || cat.id} value={cat.categoryId || cat.id}>{cat.name || cat.categoryName}</option>))}
            </select>
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Fiyat (₺)</label>
            <input type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border rounded-xl outline-none" />
          </div>

          {/* 🌟 CASCADING DROPDOWN: İL */}
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

          {/* 🌟 CASCADING DROPDOWN: İLÇE */}
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

          {/* 🌟 CASCADING DROPDOWN: MAHALLE */}
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
            <input type="text" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="Cadde, Sokak, Bina No, Daire No..." className="w-full px-4 py-3 bg-gray-50 border rounded-xl outline-none" />
          </div>

          {/* 🌟 ETKİLEŞİMLİ HARİTA */}
          <div className="col-span-2 mt-4">
            <div className="flex justify-between items-center mb-3">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <FiNavigation className="text-blue-600" /> Konum Seçimi (Haritaya tıklayın veya pini sürükleyin)
              </label>
              <div className="text-xs font-semibold bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                Lat: {formData.latitude?.toFixed(5)}, Lng: {formData.longitude?.toFixed(5)}
              </div>
            </div>
            <div className="rounded-xl overflow-hidden border border-gray-200">
              <MapSelector latitude={formData.latitude} longitude={formData.longitude} onLocationChange={handleLocationChange} />
            </div>
          </div>
        </div>

        {/* --- ÖZELLİKLER (AMENITIES) --- */}
        <div className="pt-6 border-t border-gray-100">
          <label className="block text-sm font-bold text-gray-800 mb-4">Ev Özellikleri (Amenities)</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {AMENITIES_LIST.map((amenity) => (
              <label key={amenity.id} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={formData.amenities.includes(amenity.id)}
                  onChange={() => {
                    const hasIt = formData.amenities.includes(amenity.id);
                    setFormData({
                      ...formData,
                      amenities: hasIt
                        ? formData.amenities.filter(id => id !== amenity.id)
                        : [...formData.amenities, amenity.id]
                    });
                  }}
                  className="w-5 h-5 border-gray-300 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-gray-700 group-hover:text-blue-600 font-medium transition-colors">{amenity.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* --- GALERİ RESİMLERİ --- */}
        <div className="pt-6 border-t border-gray-100">
          <label className="block text-sm font-medium text-gray-700 mb-3">Galeri Resimleri</label>

          {/* Mevcut resimler */}
          {existingImages.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-4">
              {existingImages.map((img, idx) => (
                <div key={idx} className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 group">
                  <img src={img.url} alt={`Galeri ${idx + 1}`} className="w-full h-full object-cover" />
                  <button
                    onClick={() => handleDeleteImage(img.id)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    title="Resmi Kaldır"
                  >
                    <FiTrash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Yeni resim yükleme */}
          <div
            onClick={() => galleryInputRef.current?.click()}
            className="w-full p-6 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-blue-400 transition-all"
          >
            <input
              type="file"
              ref={galleryInputRef}
              multiple
              accept="image/*"
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                setNewGalleryImages(prev => [...prev, ...files]);
              }}
              className="hidden"
            />
            <FiPlus className="text-3xl text-gray-400 mb-2" />
            {newGalleryImages.length > 0 ? (
              <p className="font-bold text-blue-600">{newGalleryImages.length} yeni resim seçildi. Daha fazla eklemek için tıklayın.</p>
            ) : (
              <p className="font-bold text-gray-700">Yeni galeri resimleri eklemek için tıklayın</p>
            )}
          </div>
        </div>

        {/* --- KAPAK RESMİ --- */}
        <div className="pt-6 border-t border-gray-100">
          <label className="block text-sm font-medium text-gray-700 mb-2">Kapak Resmi</label>
          <div
            onClick={() => coverInputRef.current?.click()}
            className="w-full h-56 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-blue-400 transition-all overflow-hidden relative"
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
              <div className="text-center text-gray-500">Resim Yok</div>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-6">
          <button
            onClick={handleUpdate}
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 shadow-md transition-all disabled:opacity-50"
          >
            {isSubmitting ? 'Güncelleniyor...' : <><FiSave /> Değişiklikleri Kaydet</>}
          </button>
        </div>

      </div>
    </div>
  );
}