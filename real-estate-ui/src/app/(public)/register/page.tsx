"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { registerUserAPI, registerAgentAPI } from '@/services/authService';

export default function RegisterPage() {
  const router = useRouter();
  
  // Hangi sekmedeyiz? 'user' (Müşteri) veya 'agent' (Emlakçı)
  const [activeTab, setActiveTab] = useState<'user' | 'agent'>('user');

  // Form verileri (Backend'deki RegisterDto ile birebir aynı)
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    username: '',
    email: '',
    password: ''
  });

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Input değişikliklerini yakala
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      if (activeTab === 'user') {
        // Müşteri kaydı
        await registerUserAPI(formData);
      } else {
        // Emlakçı kaydı
        await registerAgentAPI(formData);
      }

      setSuccessMsg('Kayıt başarıyla oluşturuldu! Giriş sayfasına yönlendiriliyorsunuz...');
      
      // 2 saniye bekleyip login sayfasına at
      setTimeout(() => {
        router.push('/login');
      }, 2000);

    } catch (err: any) {
      setError(err.response?.data?.message || 'Kayıt olurken bir hata oluştu. Lütfen bilgileri kontrol edin.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-gray-50 py-10 px-4">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-8 space-y-6">
        
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">Aramıza Katılın</h2>
          <p className="text-sm text-gray-500 mt-2">Sisteme kayıt olmak için hesap türünüzü seçin.</p>
        </div>

        {/* Müşteri / Emlakçı Sekmeleri (Tabs) */}
        <div className="flex rounded-lg bg-gray-100 p-1">
          <button
            onClick={() => setActiveTab('user')}
            className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${
              activeTab === 'user' ? 'bg-white text-blue-600 shadow' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Bireysel (Müşteri)
          </button>
          <button
            onClick={() => setActiveTab('agent')}
            className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${
              activeTab === 'agent' ? 'bg-white text-blue-600 shadow' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Kurumsal (Emlakçı)
          </button>
        </div>

        {/* Uyarı Mesajları */}
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center border border-red-200">{error}</div>}
        {successMsg && <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm text-center border border-green-200">{successMsg}</div>}

        {/* Kayıt Formu */}
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Ad</label>
              <input type="text" name="name" required value={formData.name} onChange={handleChange}
                className="mt-1 block w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Soyad</label>
              <input type="text" name="surname" required value={formData.surname} onChange={handleChange}
                className="mt-1 block w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Kullanıcı Adı</label>
            <input type="text" name="username" required value={formData.username} onChange={handleChange}
              className="mt-1 block w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">E-Posta</label>
            <input type="email" name="email" required value={formData.email} onChange={handleChange}
              className="mt-1 block w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Şifre</label>
            <input type="password" name="password" required value={formData.password} onChange={handleChange}
              className="mt-1 block w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
          </div>

          <button
            type="submit"
            disabled={isLoading || !!successMsg}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all mt-6"
          >
            {isLoading ? 'Kayıt Yapılıyor...' : `${activeTab === 'user' ? 'Bireysel' : 'Kurumsal'} Kayıt Ol`}
          </button>
        </form>

        <div className="text-center text-sm text-gray-600">
          Zaten hesabınız var mı?{' '}
          <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
            Giriş Yapın
          </Link>
        </div>

      </div>
    </div>
  );
}