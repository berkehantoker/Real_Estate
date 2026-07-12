"use client";

import { useEffect, useState } from 'react';
import * as signalR from '@microsoft/signalr';

import { useAuthStore } from "../../../store/useAuthStore";
import { 
  FiActivity, FiBox, FiList, FiTrendingUp, 
  FiMessageSquare, FiUsers, FiServer, FiHome, FiPlusSquare, FiUser 
} from 'react-icons/fi';




export default function DashboardPage() {
  // 1. TÜM HOOK'LAR EN TEPEDE (React Kurallarına Tam Uygun)
  const { user } = useAuthStore();

  // Canlı İstatistik State'leri
  const [productCount, setProductCount] = useState<number>(0);
  const [categoryCount, setCategoryCount] = useState<number>(0);
  const [mostExpensiveProduct, setMostExpensiveProduct] = useState<string>("Yükleniyor...");
  const [activeProductCount, setActiveProductCount] = useState<number>(0);
  const [totalMessageCount, setTotalMessageCount] = useState<number>(0);
  const [totalUserCount, setTotalUserCount] = useState<number>(0);

  // SignalR Bağlantı Durumu
  const [connectionStatus, setConnectionStatus] = useState<string>('Bağlanıyor...');

  // 2. SIGNALR EFEKTİ (Sadece Kullanıcı Admin İse Çalışır)
// 2. SIGNALR EFEKTİ (Sadece Kullanıcı Admin İse Çalışır)
  useEffect(() => {
    if (user?.role !== 'Admin') return;
    // @ts-ignore
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7252'; 
    let isMounted = true; // 👈 Yarışı önleyecek bayrağımız
    
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${API_URL}/signalrHub`, {
        transport: signalR.HttpTransportType.WebSockets,
        skipNegotiation: true
      })
      .withAutomaticReconnect()
      .build();

    const startConnection = async () => {
      try {
        await connection.start();
        
        // Eğer asenkron süreç tamamlanana kadar bileşen hala ekrandaysa state güncelle
        if (isMounted) {
          setConnectionStatus('Bağlandı (Canlı)');
          await connection.invoke("SendStatistics");
        } else {
          // Eğer asenkron start bitene kadar cleanup tetiklendiyse güvenli şekilde durdur
          await connection.stop();
        }
      } catch (err) {
        console.error("SignalR Bağlantı Hatası: ", err);
        if (isMounted) setConnectionStatus('Bağlantı Koptu');
      }
    };

    startConnection();

    // Dinleyiciler
    connection.on("ReceiveProductCount", (count: number) => isMounted && setProductCount(count));
    connection.on("ReceiveCategoryCount", (count: number) => isMounted && setCategoryCount(count));
    connection.on("ReceiveMostExpensiveProduct", (title: string) => isMounted && setMostExpensiveProduct(title));
    connection.on("ReceiveActiveProductCount", (count: number) => isMounted && setActiveProductCount(count));
    connection.on("ReceiveTotalMessageCount", (count: number) => isMounted && setTotalMessageCount(count));
    connection.on("ReceiveTotalUserCount", (count: number) => isMounted && setTotalUserCount(count));

    // Cleanup
    return () => {
      isMounted = false; // Asenkron state güncellemelerini engelle
      // Sadece bağlantı kurulduysa veya kuruluyorsa durdur
      if (connection.state === signalR.HubConnectionState.Connected) {
        connection.stop();
      }
    };
  }, [user]);

  // Yardımcı Küçük Kart Komponenti
  const StatCard = ({ title, value, icon: Icon, colorClass }: { title: string, value: string | number, icon: any, colorClass: string }) => (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-5 hover:shadow-md transition-shadow relative overflow-hidden group">
      <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 group-hover:scale-150 transition-transform duration-700 ${colorClass}`}></div>
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-inner ${colorClass}`}>
        <Icon />
      </div>
      <div>
        <h3 className="text-gray-500 font-medium text-sm">{title}</h3>
        <p className="text-2xl font-extrabold text-gray-900 mt-1 truncate max-w-[180px]" title={String(value)}>{value}</p>
      </div>
    </div>
  );

  // 3. RENDER KATMANI
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* --- ORTAK HOŞ GELDİN KUTUSU --- */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-800">Hoş Geldiniz, {user?.name}</h2>
          <p className="text-gray-500 mt-2 leading-relaxed">
            Sisteme <span className="font-bold text-blue-600">{user?.role === 'Admin' ? 'Yönetici' : 'Emlak Danışmanı'}</span> yetkisiyle giriş yaptınız. Sol menüyü kullanarak işlemlerinizi gerçekleştirebilirsiniz.
          </p>
        </div>
        
        {/* Sadece Admin Girişinde Durum Canlı Olarak Gösterilir */}
        {user?.role === 'Admin' ? (
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm shadow-sm border ${
            connectionStatus === 'Bağlandı (Canlı)' 
              ? 'bg-green-50 text-green-700 border-green-200' 
              : 'bg-red-50 text-red-700 border-red-200 animate-pulse'
          }`}>
            <div className={`w-2 h-2 rounded-full ${connectionStatus === 'Bağlandı (Canlı)' ? 'bg-green-500 animate-ping' : 'bg-red-500'}`}></div>
            <FiServer /> {connectionStatus}
          </div>
        ) : (
          <div className="hidden md:block bg-blue-50 p-4 rounded-xl border border-blue-100">
             <p className="text-blue-800 font-bold text-sm">Sistem Durumu: <span className="text-green-600 font-extrabold">Aktif</span></p>
          </div>
        )}
      </div>

      {/* --- 🌟 DURUMA GÖRE ALTAKİ İÇERİK --- */}
      
      {/* SEÇENEK A: EĞER GİRİŞ YAPAN KULLANICI ADMİN İSE (Canlı İstatistikleri Göster) */}
      {user?.role === 'Admin' && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 border-b pb-2">
            <FiActivity className="text-blue-600 text-xl" />
            <h3 className="text-lg font-bold text-gray-800">Genel Sistem İstatistikleri</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard title="Toplam İlan Sayısı" value={productCount} icon={FiBox} colorClass="bg-blue-500 text-white" />
            <StatCard title="Aktif İlan Sayısı" value={activeProductCount} icon={FiTrendingUp} colorClass="bg-green-500 text-white" />
            <StatCard title="En Pahalı İlan" value={mostExpensiveProduct} icon={FiHome} colorClass="bg-yellow-500 text-white" />
            <StatCard title="Kategori Sayısı" value={categoryCount} icon={FiList} colorClass="bg-purple-500 text-white" />
            <StatCard title="Toplam Mesaj" value={totalMessageCount} icon={FiMessageSquare} colorClass="bg-pink-500 text-white" />
            <StatCard title="Kayıtlı Kullanıcı" value={totalUserCount} icon={FiUsers} colorClass="bg-indigo-500 text-white" />
          </div>
        </div>
      )}

      {/* SEÇENEK B: EĞER GİRİŞ YAPAN KULLANICI EMLAKÇI İSE (Hızlı Menü / Rehber Göster) */}
      {user?.role === 'EstateAgent' && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 border-b pb-2">
            <FiTrendingUp className="text-blue-600 text-xl" />
            <h3 className="text-lg font-bold text-gray-800">Hızlı İşlemler</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <a href="/panel/ilan-ekle" className="bg-white border p-6 rounded-2xl flex flex-col items-center text-center group hover:border-blue-500 transition-all shadow-sm">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all mb-4">
                <FiPlusSquare />
              </div>
              <h4 className="font-bold text-gray-900">Yeni İlan Ekle</h4>
              <p className="text-xs text-gray-500 mt-1">Hızlıca portföyünüze yeni bir gayrimenkul kaydedin.</p>
            </a>

            <a href="/panel/ilanlarim" className="bg-white border p-6 rounded-2xl flex flex-col items-center text-center group hover:border-blue-500 transition-all shadow-sm">
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-xl text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-all mb-4">
                <FiList />
              </div>
              <h4 className="font-bold text-gray-900">İlanlarımı Yönet</h4>
              <p className="text-xs text-gray-500 mt-1">Mevcut ilanlarınızı listeleyin, düzenleyin veya silin.</p>
            </a>

            <a href="/panel/profilim" className="bg-white border p-6 rounded-2xl flex flex-col items-center text-center group hover:border-blue-500 transition-all shadow-sm">
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-xl text-green-600 group-hover:bg-green-600 group-hover:text-white transition-all mb-4">
                <FiUser />
              </div>
              <h4 className="font-bold text-gray-900">Vitrin Profilim</h4>
              <p className="text-xs text-gray-500 mt-1">Afişlerde ve ilan detayında görünecek bilgilerinizi düzenleyin.</p>
            </a>
          </div>
        </div>
      )}

    </div>
  );
}