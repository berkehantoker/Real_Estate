"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { loginAPI } from '@/services/authService';
import { useAuthStore } from '@/store/useAuthStore'; // 🌟 ZUSTAND IMPORTU
import { jwtDecode } from 'jwt-decode'; // 🌟 DECODE IMPORTU

export default function LoginPage() {
  const router = useRouter();
  const { login: setZustandLogin } = useAuthStore(); // 🌟 ZUSTAND FONKSİYONU
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // 1. API'den token'ı al
      const token = await loginAPI({ username, password });
      
      // 2. Token'ı Zustand hafızasına yolla (O arka planda cookie'ye kaydedecek)
      setZustandLogin(token); 
      
      // 3. Rolü çöz ve doğru yere yönlendir!
      const decoded: any = jwtDecode(token);
      const role = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

      if (role === 'User') {
        router.push('/'); // Müşteri ise Ana Sayfaya Vitrine
      } else {
        router.push('/panel'); // Admin veya Emlakçı ise Panele
      }
      
      router.refresh(); 
      
    } catch (err: any) {
      setError('Kullanıcı adı veya şifre hatalı!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4">
      {/* Kart Tasarımı */}
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-6">
        
        {/* Başlık Alanı */}
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">Tekrar Hoş Geldiniz</h2>
          <p className="text-sm text-gray-500 mt-2">Hesabınıza giriş yaparak devam edin.</p>
        </div>

        {/* Hata Mesajı Alanı */}
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center border border-red-200">
            {error}
          </div>
        )}

        {/* Form Alanı */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700">Kullanıcı Adı</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Kullanıcı adınızı girin"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Şifre</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all"
          >
            {isLoading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>

        {/* Alt Linkler */}
        <div className="text-center text-sm text-gray-600 mt-4">
          Hesabınız yok mu?{' '}
          <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
            Hemen Kayıt Olun
          </Link>
        </div>

      </div>
    </div>
  );
}