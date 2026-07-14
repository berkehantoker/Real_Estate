"use client"; // Zustand kullanacağımız için Client Component yaptık

import { useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import NotificationProvider from '@/components/NotificationProvider';
import { Toaster } from 'react-hot-toast';
import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  const { checkAuth } = useAuthStore();

  // Site ilk açıldığında veya F5 atıldığında cookie'den token'ı oku ve hafızayı doldur!
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <html lang="tr">
      <body>
        <NotificationProvider />
        {children}
        <Toaster position="top-right" reverseOrder={false} toastOptions={{ duration: 3000, style: { background: '#333', color: '#fff', borderRadius: '12px', padding: '16px' } }} />
      </body>
    </html>
  );
}
