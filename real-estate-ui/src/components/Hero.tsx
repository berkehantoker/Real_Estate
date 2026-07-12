"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiSearch, FiHome, FiArrowRight, FiChevronDown, FiMapPin } from 'react-icons/fi';

export default function Hero() {
  const router = useRouter();
  const [location, setLocation] = useState('');
  const [type, setType] = useState('');

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (location.trim()) params.append('searchKeyword', location.trim());
    if (type) params.append('type', type);

    const queryString = params.toString();
    router.push(queryString ? `/ilanlar?${queryString}` : '/ilanlar');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <div className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-fixed"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2075&q=80')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70"></div>
      </div>

      <div className="absolute inset-0 z-[1] opacity-[0.03]" 
           style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }}></div>

      <div className="relative z-10 text-center px-4 w-full max-w-4xl">
        
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white px-4 py-2 rounded-full text-sm font-semibold mb-8">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
          Türkiye'nin En Güvenilir Emlak Platformu
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight tracking-tight">
          Hayalinizdeki <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">Evi</span><br/>
          Bugün Bulun
        </h1>

        <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
          Binlerce satılık ve kiralık mülk arasından size en uygun olanı keşfedin. 
          Modern arama araçlarımızla aradığınız eve hızla ulaşın.
        </p>

        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-3 sm:p-4 rounded-2xl shadow-2xl max-w-3xl mx-auto">
          <div className="flex flex-col md:flex-row gap-3">
            
            <div className="flex-[3] flex items-center bg-white rounded-xl px-4 py-3.5 border border-gray-200 hover:border-blue-300 transition-colors">
              <FiMapPin className="text-blue-600 text-xl mr-3 flex-shrink-0" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Şehir, İlçe veya Mahalle..."
                className="bg-transparent border-none outline-none w-full text-gray-700 placeholder-gray-400 text-base"
              />
            </div>

            <div className="flex-1 flex items-center bg-white rounded-xl px-4 py-3 border border-gray-200 hover:border-blue-300 transition-colors">
              <FiHome className="text-blue-600 text-xl mr-3 flex-shrink-0" />
              <select 
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="bg-transparent border-none outline-none w-full text-gray-700 cursor-pointer font-medium"
              >
                <option value="">İlan Tipi</option>
                <option value="Satılık">Satılık</option>
                <option value="Kiralık">Kiralık</option>
              </select>
            </div>

            <button 
              onClick={handleSearch}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3.5 px-6 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 active:scale-95 md:flex-shrink-0"
            >
              <FiSearch className="text-xl" />
              <span className="hidden sm:inline">İlan Ara</span>
            </button>

          </div>
        </div>

        <div className="flex justify-center gap-8 md:gap-16 mt-12">
          <div className="text-center">
            <p className="text-3xl md:text-4xl font-extrabold text-white">500+</p>
            <p className="text-blue-200 text-sm font-semibold mt-1">Aktif İlan</p>
          </div>
          <div className="w-px bg-white/20"></div>
          <div className="text-center">
            <p className="text-3xl md:text-4xl font-extrabold text-white">1,200+</p>
            <p className="text-blue-200 text-sm font-semibold mt-1">Mutlu Müşteri</p>
          </div>
          <div className="w-px bg-white/20"></div>
          <div className="text-center">
            <p className="text-3xl md:text-4xl font-extrabold text-white">81</p>
            <p className="text-blue-200 text-sm font-semibold mt-1">İlde Hizmet</p>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce hidden md:block">
          <FiChevronDown className="text-white/50 text-2xl" />
        </div>
      </div>
    </div>
  );
}