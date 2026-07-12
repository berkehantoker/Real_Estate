"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '../store/useAuthStore'; 
import { 
  FiGrid, FiList, FiPlusSquare, FiSettings, 
  FiUsers, FiLogOut, FiMonitor, FiArrowLeft, FiUser, FiMail,
  FiBriefcase, FiMessageSquare, FiLayers, FiInfo, FiSend
} from 'react-icons/fi';
import React from 'react';

export default function Sidebar() {
  const { user, logout, unreadMessageCount } = useAuthStore();
  const pathname = usePathname();

  const NavItem = ({ href, icon: Icon, text }: { href: string, icon: any, text: React.ReactNode }) => {
    const isActive = pathname === href;
    return (
      <Link 
        href={href} 
        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
          isActive 
            ? 'bg-blue-600 text-white shadow-md' 
            : 'text-gray-400 hover:bg-gray-800 hover:text-white'
        }`}
      >
        <Icon className="text-xl" />
        <span>{text}</span>
      </Link>
    );
  };

  const getRoleText = (role?: string) => {
    if (role === 'Admin') return 'Sistem Yöneticisi';
    if (role === 'EstateAgent') return 'Emlak Danışmanı';
    return '';
  };

  return (
    <aside className="w-72 bg-gray-900 text-white flex flex-col min-h-screen sticky top-0 shadow-2xl">
      
      <div className="p-6 border-b border-gray-800">
        <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <FiMonitor className="text-blue-500" /> 
          <span>Yönetim Paneli</span>
        </h2>
        <div className="mt-4 bg-gray-800 p-3 rounded-xl flex flex-col">
          <span className="text-sm text-gray-400">Hoş geldin,</span>
          <span className="font-bold text-blue-400 truncate" title={user?.name}>{user?.name}</span>
          <span className="text-xs bg-gray-700 text-gray-300 w-max px-2 py-1 rounded-md mt-2">
            {getRoleText(user?.role)}
          </span>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        <NavItem href="/panel" icon={FiGrid} text="Dashboard" />

        {/* 🌟 SADECE EMLAKÇININ GÖRECEĞİ MENÜLER */}
        {user?.role === 'EstateAgent' && (
          <>
            <NavItem href="/panel/ilanlarim" icon={FiList} text="İlanlarım" />
            <NavItem href="/panel/ilan-ekle" icon={FiPlusSquare} text="Yeni İlan Ekle" />
            <NavItem href="/panel/mesajlasmalarim" icon={FiMessageSquare} text={
              <span className="inline-flex items-center gap-1">
                Mesajlaşmalarım
                {unreadMessageCount > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-[16px] flex items-center justify-center px-1">
                    {unreadMessageCount > 9 ? '9+' : unreadMessageCount}
                  </span>
                )}
              </span>
            } />
            <NavItem href="/panel/profilim" icon={FiUser} text="Vitrin Biyografim" />
          </>
        )}

        {/* 🌟 SADECE ADMİNİN GÖRECEĞİ MENÜLER */}
        {user?.role === 'Admin' && (
          <>
            <NavItem href="/panel/tum-ilanlar" icon={FiList} text="Tüm İlanlar" />
            <NavItem href="/panel/kategoriler" icon={FiList} text="Kategori Yönetimi" />
            <NavItem href="/panel/kullanicilar" icon={FiUsers} text="Kullanıcı Yönetimi" />
            <NavItem href="/panel/mesajlar" icon={FiMail} text="Gelen Mesajlar" />
            <NavItem href="/panel/hizmetler" icon={FiBriefcase} text="Hizmet Yönetimi" />
            <NavItem href="/panel/referanslar" icon={FiMessageSquare} text="Referans Yönetimi" />
            <NavItem href="/panel/alt-bilgiler" icon={FiLayers} text="Alt Bilgi Yönetimi" />
            <NavItem href="/panel/hakkimizda-yonetim" icon={FiInfo} text="Hakkımızda Yönetimi" />
            <NavItem href="/panel/aboneler" icon={FiSend} text="Bülten Aboneleri" />
          </>
        )}

        {/* 🌟 ADMİN VE EMLAKÇI İÇİN ORTAK AYARLAR */}
        <div className="pt-4 mt-4 border-t border-gray-800 space-y-2">
          <NavItem href="/panel/hesap-ayarlari" icon={FiSettings} text="Hesap Ayarları" />
        </div>
      </nav>

      <div className="p-4 border-t border-gray-800 space-y-2">
        <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-gray-800 hover:text-white transition-all font-medium">
          <FiArrowLeft className="text-xl" />
          <span>Vitrine Dön</span>
        </Link>
        <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500 hover:text-white transition-all font-medium">
          <FiLogOut className="text-xl" />
          <span>Çıkış Yap</span>
        </button>
      </div>

    </aside>
  );
}