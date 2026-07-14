"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { registerUserAPI, registerAgentAPI } from '@/services/authService';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

export default function RegisterPage() {
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<'user' | 'agent'>('user');

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
  const [showPassword, setShowPassword] = useState(false);

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
        await registerUserAPI(formData);
      } else {
        await registerAgentAPI(formData);
      }

      setSuccessMsg('Kayıt başarıyla oluşturuldu! Giriş sayfasına yönlendiriliyorsunuz...');
      
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
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12">
      
      {/* ═══════════ SOL BÖLÜM - GÖRSEL PANEL (lg:col-span-5) ═══════════ */}
      <div className="hidden lg:flex lg:col-span-5 relative bg-slate-900 text-white flex-col justify-between p-12 overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
          alt="Modern Residence"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/90 via-slate-900/60 to-transparent mix-blend-multiply"></div>
        
        {/* Logo */}
        <div className="relative z-10">
          <Link href="/" className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
            <span className="text-3xl">🏡</span> RealEstate Portal
          </Link>
        </div>

        {/* Motto */}
        <div className="relative z-10 space-y-4 max-w-md">
          <h2 className="text-3xl lg:text-4xl font-extrabold leading-tight text-white drop-shadow-lg">
            Hayalinizdeki<br />Eve Bir Adım Daha.
          </h2>
          <p className="text-lg text-indigo-100/80 leading-relaxed">
            Kendi ilanlarınızı yayınlayın. Lisanslı bir emlak danışmanı veya bireysel kullanıcı olarak aramıza katılın.
          </p>
          <p className="text-sm text-slate-300/60 leading-relaxed">
            Saniyeler içinde ücretsiz hesap oluşturun, emlak dünyasına adım atın.
          </p>
        </div>

        <p className="relative z-10 text-xs text-slate-400/50">
          © 2024 RealEstate Portal. Tüm hakları saklıdır.
        </p>
      </div>

      {/* ═══════════ SAĞ BÖLÜM - KAYIT FORMU (lg:col-span-7) ═══════════ */}
      <div className="lg:col-span-7 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          
          {/* Mobil logo */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="text-3xl font-extrabold text-gray-900 flex items-center justify-center gap-2">
              <span>🏡</span> RealEstate Portal
            </Link>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
            {/* Başlık */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-extrabold text-gray-900">Aramıza Katılın</h1>
              <p className="text-sm text-gray-500 mt-2">Sisteme kayıt olmak için hesap türünüzü seçin.</p>
            </div>

            {/* Müşteri / Emlakçı Sekmeleri */}
            <div className="flex rounded-xl bg-gray-100 p-1.5 mb-6">
              <button
                onClick={() => setActiveTab('user')}
                className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-300 ${
                  activeTab === 'user' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                🏠 Bireysel
              </button>
              <button
                onClick={() => setActiveTab('agent')}
                className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-300 ${
                  activeTab === 'agent' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                🏢 Kurumsal
              </button>
            </div>

            {/* Uyarı Mesajları */}
            {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm text-center border border-red-200 mb-6 font-medium">{error}</div>}
            {successMsg && <div className="bg-green-50 text-green-700 p-3 rounded-xl text-sm text-center border border-green-200 mb-6 font-medium">{successMsg}</div>}

            {/* Form */}
            <form onSubmit={handleRegister} className="space-y-4">
              {/* Ad / Soyad */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Ad</label>
                  <div className="relative">
                    <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="text" name="name" required value={formData.name} onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all" 
                      placeholder="Adınız"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Soyad</label>
                  <div className="relative">
                    <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="text" name="surname" required value={formData.surname} onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all" 
                      placeholder="Soyadınız"
                    />
                  </div>
                </div>
              </div>

              {/* Kullanıcı Adı */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Kullanıcı Adı</label>
                <div className="relative">
                  <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" name="username" required value={formData.username} onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all" 
                    placeholder="Kullanıcı adınız"
                  />
                </div>
              </div>

              {/* E-Posta */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">E-Posta</label>
                <div className="relative">
                  <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="email" name="email" required value={formData.email} onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all" 
                    placeholder="ornek@email.com"
                  />
                </div>
              </div>

              {/* Şifre */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Şifre</label>
                <div className="relative">
                  <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type={showPassword ? "text" : "password"}
                    name="password" required value={formData.password} onChange={handleChange}
                    className="w-full pl-10 pr-12 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all" 
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <FiEyeOff className="text-lg" /> : <FiEye className="text-lg" />}
                  </button>
                </div>
              </div>

              {/* Kayıt Butonu */}
              <button
                type="submit"
                disabled={isLoading || !!successMsg}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-3.5 rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-md shadow-blue-200 transition-all active:scale-95 duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm mt-6"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Kayıt Yapılıyor...
                  </span>
                ) : `${activeTab === 'user' ? '🏠 Bireysel' : '🏢 Kurumsal'} Kayıt Ol`}
              </button>
            </form>

            {/* Alt Link */}
            <div className="text-center text-sm text-gray-600 mt-8 pt-6 border-t border-gray-100">
              Zaten hesabınız var mı?{' '}
              <Link href="/login" className="font-bold text-blue-600 hover:text-blue-500 transition-colors">
                Giriş Yapın
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}