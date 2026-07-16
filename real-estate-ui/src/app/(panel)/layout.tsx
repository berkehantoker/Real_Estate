"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import Sidebar from '@/components/Sidebar';
import NotificationProvider from '@/components/NotificationProvider';

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  // Hydration hatasını ve yetkisiz render'ı önle
  if (!isMounted || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
          <p className="text-gray-500 font-medium">Yönlendiriliyorsunuz...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <NotificationProvider />
      
      {/* Sol Menü (Sidebar) */}
      <Sidebar />

      {/* Sağ Ana İçerik Alanı */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* Üst Bilgi Çubuğu (Top Bar) */}
        <header className="h-16 bg-white shadow-sm border-b border-gray-200 flex items-center px-8">
          <h1 className="text-xl font-semibold text-gray-800">Kontrol Paneli</h1>
        </header>

        {/* Sayfaların içeriğinin geleceği asıl yer */}
        <div className="flex-1 overflow-auto p-8">
          {children}
        </div>
      </main>

    </div>
  );
}