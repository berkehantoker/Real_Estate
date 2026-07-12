"use client";

import { useState, useEffect } from 'react';
import { getMyProfileAPI, updateMyProfileAPI } from '../../../../services/userProfileService';
import { FiSave, FiUser, FiMail, FiPhone, FiLock } from 'react-icons/fi';

export default function AccountSettingsPage() {
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
        setError('Kullanıcı bilgileri yüklenemedi.');
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

      if (formData.currentPassword && formData.newPassword) {
        payload.currentPassword = formData.currentPassword;
        payload.newPassword = formData.newPassword;
      } else if ((formData.currentPassword && !formData.newPassword) || (!formData.currentPassword && formData.newPassword)) {
         setError("Şifre değiştirmek istiyorsanız hem mevcut şifrenizi hem de yeni şifrenizi girmelisiniz.");
         setIsSaving(false);
         return;
      }

      await updateMyProfileAPI(payload);
      setSuccess("Hesap bilgileriniz başarıyla güncellendi!");
      setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '' }));
      
    } catch (err: any) {
      setError(err.response?.data || "Bilgiler güncellenirken bir hata oluştu.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="p-8 text-gray-500 animate-pulse">Hesap bilgileriniz yükleniyor...</div>;

  return (
    <div className="max-w-3xl mx-auto pb-20">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-gray-800">Hesap Ayarları</h2>
        <p className="text-gray-500 mt-1">Sisteme giriş bilgilerinizi ve şifrenizi buradan değiştirebilirsiniz.</p>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        {error && <div className="mb-6 p-4 bg-red-50 text-red-600 border border-red-200 rounded-xl">{error}</div>}
        {success && <div className="mb-6 p-4 bg-green-50 text-green-700 border border-green-200 rounded-xl">{success}</div>}

        <form onSubmit={handleSave} className="space-y-6">
          <h3 className="text-lg font-bold text-gray-900 border-b pb-2 mb-4">Temel Bilgiler</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2"><FiUser className="text-blue-600"/> Kullanıcı Adı</label>
              <input type="text" name="userName" required value={formData.userName} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border rounded-xl outline-none focus:border-blue-500" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2"><FiMail className="text-blue-600"/> E-Posta Adresi</label>
              <input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border rounded-xl outline-none focus:border-blue-500" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2"><FiPhone className="text-blue-600"/> Telefon Numarası</label>
              <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border rounded-xl outline-none focus:border-blue-500" placeholder="0555 555 55 55" />
            </div>
          </div>

          <h3 className="text-lg font-bold text-gray-900 border-b pb-2 mt-10 mb-4 flex items-center gap-2">
            <FiLock className="text-gray-500"/> Şifre Değiştirme (İsteğe Bağlı)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-xl border border-gray-100">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mevcut Şifreniz</label>
              <input type="password" name="currentPassword" value={formData.currentPassword} onChange={handleChange} className="w-full px-4 py-3 bg-white border rounded-xl outline-none focus:border-blue-500" placeholder="••••••••" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Yeni Şifreniz</label>
              <input type="password" name="newPassword" value={formData.newPassword} onChange={handleChange} className="w-full px-4 py-3 bg-white border rounded-xl outline-none focus:border-blue-500" placeholder="••••••••" />
            </div>
          </div>

          <div className="flex justify-end pt-6 border-t border-gray-100">
            <button type="submit" disabled={isSaving} className="flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 shadow-md transition-all disabled:opacity-50">
              {isSaving ? 'Kaydediliyor...' : <><FiSave /> Bilgileri Güncelle</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}