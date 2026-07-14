"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { loginAPI } from '@/services/authService';
import { useAuthStore } from '@/store/useAuthStore';
import { jwtDecode } from 'jwt-decode';
import { FiUser, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

export default function LoginPage() {
  const router = useRouter();
  const { login: setZustandLogin } = useAuthStore();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const token = await loginAPI({ username, password });
      setZustandLogin(token); 
      
      const decoded: any = jwtDecode(token);
      const role = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

      if (role === 'User') {
        router.push('/');
      } else {
        router.push('/panel');
      }
      
      router.refresh(); 
      
    } catch (err: any) {
      setError('Kullanıcı adı veya şifre hatalı!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12">
      
      {/* ═══════════ SOL BÖLÜM - GÖRSEL PANEL (lg:col-span-5) ═══════════ */}
      <div className="hidden lg:flex lg:col-span-5 relative bg-slate-900 text-white flex-col justify-between p-12 overflow-hidden">
        {/* Arka plan resmi */}
        <img 
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
          alt="Luxury Home"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 via-slate-900/60 to-transparent mix-blend-multiply"></div>
        
        {/* Logo */}
        <div className="relative z-10">
          <Link href="/" className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
            <span className="text-3xl">🏡</span> RealEstate Portal
          </Link>
        </div>

        {/* Motto */}
        <div className="relative z-10 space-y-4 max-w-md">
          <h2 className="text-3xl lg:text-4xl font-extrabold leading-tight text-white drop-shadow-lg">
            Geleceğe Güvenle<br />Adım Atın.
          </h2>
          <p className="text-lg text-blue-100/80 leading-relaxed">
            Sektörün en seçkin portföyü ve lisanslı danışmanları burada.
          </p>
          <p className="text-sm text-slate-300/60 leading-relaxed">
            Yüzlerce satılık ve kiralık lüks ilan arasında kaybolun.
          </p>
        </div>

        {/* Alt bilgi */}
        <p className="relative z-10 text-xs text-slate-400/50">
          © 2024 RealEstate Portal. Tüm hakları saklıdır.
        </p>
      </div>

      {/* ═══════════ SAĞ BÖLÜM - GİRİŞ FORMU (lg:col-span-7) ═══════════ */}
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
              <h1 className="text-3xl font-extrabold text-gray-900">Tekrar Hoş Geldiniz</h1>
              <p className="text-sm text-gray-500 mt-2">Hesabınıza giriş yaparak devam edin.</p>
            </div>

            {/* Hata Mesajı */}
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm text-center border border-red-200 mb-6 font-medium">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-5">
              {/* Kullanıcı Adı */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Kullanıcı Adı</label>
                <div className="relative">
                  <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all"
                    placeholder="Kullanıcı adınızı girin"
                  />
                </div>
              </div>

              {/* Şifre */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Şifre</label>
                <div className="relative">
                  <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all"
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

              {/* Giriş Butonu */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-3.5 rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-md shadow-blue-200 transition-all active:scale-95 duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Giriş Yapılıyor...
                  </span>
                ) : 'Giriş Yap'}
              </button>
            </form>

            {/* Alt Link */}
            <div className="text-center text-sm text-gray-600 mt-8 pt-6 border-t border-gray-100">
              Henüz hesabınız yok mu?{' '}
              <Link href="/register" className="font-bold text-blue-600 hover:text-blue-500 transition-colors">
                Hemen Kayıt Olun
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}