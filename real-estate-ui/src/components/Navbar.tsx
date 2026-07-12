"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '../store/useAuthStore';
import { useState, useEffect } from 'react';
import { FiUser, FiLogOut, FiMenu, FiX, FiHome, FiSettings, FiHeart, FiMessageSquare, FiSearch, FiChevronDown } from 'react-icons/fi';

export default function Navbar() {
  const { user, logout, unreadMessageCount } = useAuthStore();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/', label: 'Ana Sayfa' },
    { href: '/ilanlar', label: 'İlanlar' },
    { href: '/hakkimizda', label: 'Hakkımızda' },
    { href: '/iletisim', label: 'İletişim' },
  ];

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100' 
        : 'bg-white shadow-sm border-b border-gray-50'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-[72px]">
          
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center shadow-md shadow-blue-200 group-hover:shadow-lg group-hover:scale-105 transition-all duration-300">
                <FiHome className="text-xl text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-extrabold text-gray-900 tracking-tight leading-none">Real<span className="text-blue-600">Estate</span></span>
                <span className="text-[10px] text-gray-400 font-semibold tracking-widest uppercase leading-none">Gayrimenkul</span>
              </div>
            </Link>
          </div>

          {/* Orta Menü */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Sağ Kısım */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                {/* Favoriler */}
                <Link 
                  href="/favorilerim" 
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                    pathname === '/favorilerim'
                      ? 'bg-red-50 text-red-600'
                      : 'text-gray-600 hover:text-red-500 hover:bg-red-50'
                  }`}
                >
                  <FiHeart className={pathname === '/favorilerim' ? 'fill-current' : ''} />
                  <span className="hidden lg:inline">Favorilerim</span>
                </Link>

                {/* Mesajlarım */}
                <Link 
                  href="/mesajlarim" 
                  className={`relative flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                    pathname === '/mesajlarim'
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:text-blue-500 hover:bg-blue-50'
                  }`}
                >
                  <FiMessageSquare className={pathname === '/mesajlarim' ? 'fill-current' : ''} />
                  <span className="hidden lg:inline">Mesajlarım</span>
                  {unreadMessageCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                      {unreadMessageCount > 9 ? '9+' : unreadMessageCount}
                    </span>
                  )}
                </Link>

                <div className="h-6 w-px bg-gray-200"></div>

                {/* Kullanıcı bilgisi + dropdown */}
                <div className="flex items-center gap-3 bg-gray-50 hover:bg-gray-100 rounded-xl px-3 py-2 transition-colors">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm">
                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="hidden lg:flex flex-col">
                    <span className="text-sm font-bold text-gray-800 leading-tight max-w-[100px] truncate">{user.name}</span>
                    <span className="text-[10px] text-blue-600 font-semibold uppercase leading-tight">
                      {user.role === 'User' ? 'Müşteri' : user.role === 'Admin' ? 'Yönetici' : 'Danışman'}
                    </span>
                  </div>
                </div>

                {user.role === 'Admin' || user.role === 'EstateAgent' ? (
                  <Link 
                    href="/panel" 
                    className="bg-gray-900 text-white font-bold px-4 py-2 rounded-xl text-sm hover:bg-gray-800 transition shadow-sm"
                  >
                    Panel
                  </Link>
                ) : (
                  <Link 
                    href="/hesap-ayarlari" 
                    className="flex items-center gap-1.5 border border-gray-200 bg-white text-gray-700 font-semibold px-3 py-2 rounded-xl text-sm hover:bg-gray-50 transition"
                  >
                    <FiSettings className="text-gray-400" />
                    <span className="hidden lg:inline">Ayarlar</span>
                  </Link>
                )}
                
                <button 
                  onClick={logout} 
                  title="Çıkış Yap"
                  className="flex items-center justify-center bg-red-50 text-red-500 w-9 h-9 rounded-xl hover:bg-red-500 hover:text-white font-medium transition-all"
                >
                  <FiLogOut />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link 
                  href="/login" 
                  className="flex items-center gap-2 text-gray-700 font-semibold px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors text-sm"
                >
                  <FiUser className="text-gray-400" /> Giriş Yap
                </Link>
                <Link 
                  href="/register" 
                  className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:from-blue-700 hover:to-blue-800 shadow-md shadow-blue-200 transition-all hover:shadow-lg active:scale-95"
                >
                  Kayıt Ol
                </Link>
              </div>
            )}
          </div>

          {/* Mobil Hamburger */}
          <div className="flex items-center md:hidden">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
              className="text-gray-600 hover:text-blue-600 text-2xl p-2"
            >
              {isMobileMenuOpen ? <FiX /> : <FiMenu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobil Menü */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg animate-fadeIn">
          <div className="p-4 space-y-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded-xl font-semibold transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            
            <div className="border-t border-gray-100 my-2"></div>
            
            {user ? (
              <div className="space-y-2 p-2">
                <div className="flex items-center gap-3 px-2 py-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white font-bold shadow-sm">
                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-sm">{user.name}</p>
                    <p className="text-xs text-blue-600 font-semibold">
                      {user.role === 'User' ? 'Müşteri' : user.role === 'Admin' ? 'Yönetici' : 'Danışman'}
                    </p>
                  </div>
                </div>
                
                <Link href="/favorilerim" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 text-gray-700 font-semibold px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <FiHeart /> Favorilerim
                </Link>
                
                {user.role === 'Admin' || user.role === 'EstateAgent' ? (
                  <Link href="/panel" onClick={() => setIsMobileMenuOpen(false)} className="block bg-gray-900 text-white text-center font-bold py-3 rounded-xl">
                    Yönetim Paneli
                  </Link>
                ) : (
                  <Link href="/hesap-ayarlari" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 text-gray-700 font-semibold px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors">
                    <FiSettings /> Hesap Ayarlarım
                  </Link>
                )}
                
                <button onClick={logout} className="w-full flex items-center justify-center gap-2 text-red-500 font-semibold py-3 rounded-xl hover:bg-red-50 transition-colors">
                  <FiLogOut /> Çıkış Yap
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 p-2">
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-blue-600 font-semibold text-center border-2 border-blue-600 py-3 rounded-xl hover:bg-blue-50 transition-colors">
                  Giriş Yap
                </Link>
                <Link href="/register" onClick={() => setIsMobileMenuOpen(false)} className="bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold text-center py-3 rounded-xl shadow-md">
                  Kayıt Ol
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `@keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } } .animate-fadeIn { animation: fadeIn 0.2s ease-out; }` }} />
    </nav>
  );
}