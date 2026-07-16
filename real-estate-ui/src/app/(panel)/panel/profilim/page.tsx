"use client";

import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../../../../store/useAuthStore';
import { getAgentDetailAPI, createAgentDetailAPI, updateAgentDetailAPI } from '../../../../services/agentDetailService';
import toast from 'react-hot-toast';
import { uploadImageAPI } from '../../../../services/productService'; // Resim yüklemek için mevcut servisimizi kullanıyoruz
import { FiSave, FiImage, FiFacebook, FiTwitter, FiInstagram, FiPhone } from 'react-icons/fi';

export default function ProfileSettingsPage() {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdateMode, setIsUpdateMode] = useState(false); // Güncelleme mi yoksa yeni kayıt mı?

  const [formData, setFormData] = useState({
    agentDetailId: 0,
    title: '',
    description: '',
    imageUrl: '',
    phoneNumber: '',
    facebookUrl: '',
    twitterUrl: '',
    instagramUrl: ''
  });

  const [newImage, setNewImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return;
      
      setIsLoading(true);
      try {
        const profile = await getAgentDetailAPI(Number(user.id));
        if (profile) {
          // Profil varsa formu doldur ve güncelleme moduna geç
          setFormData({
            agentDetailId: profile.agentDetailId,
            title: profile.title || '',
            description: profile.description || '',
            imageUrl: profile.imageUrl || '',
            phoneNumber: profile.phoneNumber || '',
            facebookUrl: profile.facebookUrl || '',
            twitterUrl: profile.twitterUrl || '',
            instagramUrl: profile.instagramUrl || ''
          });
          setImagePreview(profile.imageUrl);
          setIsUpdateMode(true);
        }
      } catch (error) {
        console.error("Profil bilgileri çekilemedi", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      let finalImageUrl = formData.imageUrl;

      // Yeni resim seçildiyse önce onu sunucuya yükle
      if (newImage) {
        const uploadRes = await uploadImageAPI(newImage);
        finalImageUrl = `https://localhost:7252${uploadRes.url || uploadRes.Url}`;
      }

      const payload = { ...formData, imageUrl: finalImageUrl };

      if (isUpdateMode) {
        await updateAgentDetailAPI(payload);
        toast.success("Profiliniz başarıyla güncellendi!");
      } else {
        await createAgentDetailAPI(payload);
        setIsUpdateMode(true); // Artık güncelleme moduna geç
        toast.success("Profiliniz başarıyla oluşturuldu!");
      }
    } catch (error) {
      toast.error("Profil kaydedilirken bir hata oluştu.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="p-8 text-gray-500 animate-pulse">Profil bilgileriniz yükleniyor...</div>;

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-gray-800">Profil Ayarları</h2>
        <p className="text-gray-500 mt-1">Müşterilerinize görünecek iletişim ve biyografi bilgilerinizi buradan düzenleyin.</p>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-8">
        
        {/* Profil Resmi */}
        <div className="flex flex-col items-center sm:flex-row gap-8 border-b pb-8 border-gray-100">
          <div 
            onClick={() => imageInputRef.current?.click()}
            className="w-40 h-40 rounded-full border-4 border-dashed border-gray-200 flex items-center justify-center cursor-pointer hover:border-blue-400 transition-colors overflow-hidden relative group bg-gray-50"
          >
            <input type="file" ref={imageInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
            {imagePreview ? (
              <img src={imagePreview} alt="Profil" className="w-full h-full object-cover" />
            ) : (
              <FiImage className="text-4xl text-gray-300" />
            )}
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-white text-sm font-bold">Resmi Değiştir</span>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-800">{user?.name}</h3>
            <p className="text-gray-500 text-sm mb-4">Müşterilerinize güven vermek için net ve profesyonel bir fotoğraf yükleyin.</p>
            <label className="block text-sm font-medium text-gray-700 mb-2">Unvanınız (Örn: Lüks Konut Uzmanı)</label>
            <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border rounded-xl outline-none" placeholder="Uzmanlık alanınızı yazın..." />
          </div>
        </div>

        {/* Hakkımda / Biyografi */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Hakkımda (Biyografi)</label>
          <textarea rows={4} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border rounded-xl outline-none" placeholder="Kendinizden, tecrübelerinizden ve çalışma tarzınızdan bahsedin..." />
        </div>

        {/* İletişim ve Sosyal Medya */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2"><FiPhone className="text-blue-600"/> Telefon Numarası</label>
            <input type="text" value={formData.phoneNumber} onChange={e => setFormData({...formData, phoneNumber: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border rounded-xl outline-none" placeholder="0555 555 55 55" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2"><FiInstagram className="text-pink-600"/> Instagram URL</label>
            <input type="text" value={formData.instagramUrl} onChange={e => setFormData({...formData, instagramUrl: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border rounded-xl outline-none" placeholder="https://instagram.com/kullaniciadi" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2"><FiFacebook className="text-blue-700"/> Facebook URL</label>
            <input type="text" value={formData.facebookUrl} onChange={e => setFormData({...formData, facebookUrl: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border rounded-xl outline-none" placeholder="https://facebook.com/kullaniciadi" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2"><FiTwitter className="text-blue-400"/> Twitter (X) URL</label>
            <input type="text" value={formData.twitterUrl} onChange={e => setFormData({...formData, twitterUrl: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border rounded-xl outline-none" placeholder="https://twitter.com/kullaniciadi" />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button 
            onClick={handleSave} 
            disabled={isSaving} 
            className="flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 shadow-md transition-all disabled:opacity-50"
          >
            {isSaving ? 'Kaydediliyor...' : <><FiSave /> {isUpdateMode ? 'Değişiklikleri Kaydet' : 'Profili Oluştur'}</>}
          </button>
        </div>

      </div>
    </div>
  );
}