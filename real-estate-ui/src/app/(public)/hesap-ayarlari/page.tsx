"use client";

import { useState, useEffect } from 'react';
import { getMyProfileAPI, updateMyProfileAPI } from '../../../services/userProfileService';
import { FiSave, FiUser, FiMail, FiPhone, FiLock } from 'react-icons/fi';

export default function PublicAccountSettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    userName: '',
    email: '',
    phoneNumber: '',
    currentPassword: '',
    newPassword: ''
  });

  // Giriş yapmış kullanıcının mevcut Identity profilini çekiyoruz
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getMyProfileAPI();
        setFormData(prev => ({
          ...prev,
          userName: data.userName || '',
          email: data.email || '',
          phoneNumber: data.phoneNumber || ''
        }));
      } catch (err) {
        setError('Kullanıcı bilgileri yüklenemedi. Lütfen giriş yaptığınızdan emin olun.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      const payload: any = {
        userName: formData.userName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
      };

      // Şifre alanlarının kontrolü
      if (formData.currentPassword && formData.newPassword) {
        payload.currentPassword = formData.currentPassword;
        payload.newPassword = formData.newPassword;
      } else if ((formData.currentPassword && !formData.newPassword) || (!formData.currentPassword && formData.newPassword)) {
         setError("Şifrenizi değiştirmek için hem mevcut şifrenizi hem de yeni şifrenizi girmelisiniz.");
         setIsSaving(false);
         return;
      }

      await updateMyProfileAPI(payload);
      setSuccess("Profil bilgileriniz başarıyla güncellendi!");
      setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '' }));
      
    } catch (err: any) {
      setError(err.response?.data || "Profil güncellenirken bir hata oluştu.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center text-gray-500 animate-pulse font-medium">
        Profil bilgileriniz yükleniyor...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-8 text-center md:text-left">
        <h1 className="text-3xl font-extrabold text-gray-900">Hesap Ayarlarım</h1>
        <p className="text-gray-500 mt-2">İletişim bilgilerinizi ve giriş şifrenizi güvenli bir şekilde buradan güncelleyebilirsiniz.</p>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200">
        {error && <div className="mb-6 p-4 bg-red-50 text-red-600 border border-red-200 rounded-xl font-medium">{error}</div>}
        {success && <div className="mb-6 p-4 bg-green-50 text-green-700 border border-green-200 rounded-xl font-medium">{success}</div>}

        <form onSubmit={handleSave} className="space-y-6">
          <h3 className="text-lg font-bold text-gray-900 border-b pb-2 mb-4">Kişisel Bilgiler</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <FiUser className="text-blue-600"/> Kullanıcı Adı
              </label>
              <input type="text" name="userName" required value={formData.userName} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-colors" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <FiMail className="text-blue-600"/> E-Posta Adresi
              </label>
              <input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-colors" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <FiPhone className="text-blue-600"/> Telefon Numarası
              </label>
              <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-colors" placeholder="05xx xxx xx xx" />
            </div>
          </div>

          <h3 className="text-lg font-bold text-gray-900 border-b pb-2 mt-10 mb-4 flex items-center gap-2">
            <FiLock className="text-gray-500"/> Güvenlik & Şifre Değiştirme
          </h3>
          <p className="text-sm text-gray-400 mb-4">Şifrenizi değiştirmek istemiyorsanız aşağıdaki alanları boş bırakabilirsiniz.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mevcut Şifreniz</label>
              <input type="password" name="currentPassword" value={formData.currentPassword} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-blue-500" placeholder="••••••••" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Yeni Şifreniz</label>
              <input type="password" name="newPassword" value={formData.newPassword} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-blue-500" placeholder="••••••••" />
            </div>
          </div>

          <div className="flex justify-end pt-6 border-t border-gray-100">
            <button type="submit" disabled={isSaving} className="flex items-center gap-2 bg-blue-600 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-blue-700 shadow-md transition-all disabled:opacity-50">
              {isSaving ? 'Güncelleniyor...' : <><FiSave /> Değişiklikleri Kaydet</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}