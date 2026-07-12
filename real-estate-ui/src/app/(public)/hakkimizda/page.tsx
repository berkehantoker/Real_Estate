"use client";

import { useEffect, useState } from 'react';
import { getAllWhoWeAreDetailsAPI } from '../../../services/whoWeAreService';
import { getAllServicesAPI } from '../../../services/serviceService';
import { getAllBottomGridsAPI } from '../../../services/bottomGridService';
import { FiHome, FiShield, FiTrendingUp, FiUsers, FiStar, FiTarget, FiEye, FiHeart } from 'react-icons/fi';

export default function AboutPage() {
  const [whoWeAre, setWhoWeAre] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [bottomGrids, setBottomGrids] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [whoWeAreData, servicesData, bottomGridsData] = await Promise.all([
          getAllWhoWeAreDetailsAPI(),
          getAllServicesAPI(),
          getAllBottomGridsAPI(),
        ]);
        setWhoWeAre(whoWeAreData);
        setServices(servicesData);
        setBottomGrids(bottomGridsData);
      } catch (error) {
        console.error('Veri yükleme hatası:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const iconMap: Record<string, React.ReactNode> = {
    FiHome: <FiHome className="text-4xl text-blue-600" />,
    FiShield: <FiShield className="text-4xl text-blue-600" />,
    FiTrendingUp: <FiTrendingUp className="text-4xl text-blue-600" />,
    FiUsers: <FiUsers className="text-4xl text-blue-600" />,
    FiTarget: <FiTarget className="text-4xl text-blue-600" />,
    FiEye: <FiEye className="text-4xl text-blue-600" />,
    FiHeart: <FiHeart className="text-4xl text-blue-600" />,
    FiStar: <FiStar className="text-4xl text-blue-600" />,
  };

  const mainDetail = whoWeAre.length > 0 ? whoWeAre[0] : null;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 font-medium animate-pulse text-lg">Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      
      {/* HAKKIMIZDA ÜST BÖLÜM */}
      {mainDetail && (
        <section className="bg-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              
              {/* Sol: Metin */}
              <div>
                <span className="text-blue-600 font-extrabold text-sm uppercase tracking-wider">Hakkımızda</span>
                <h1 className="text-4xl font-extrabold text-gray-900 mt-3 mb-6">{mainDetail.title}</h1>
                {mainDetail.subtitle && (
                  <p className="text-xl text-gray-500 font-medium mb-6">{mainDetail.subtitle}</p>
                )}
                {mainDetail.description1 && (
                  <p className="text-gray-600 leading-relaxed mb-4 text-lg">{mainDetail.description1}</p>
                )}
                {mainDetail.description2 && (
                  <p className="text-gray-600 leading-relaxed text-lg">{mainDetail.description2}</p>
                )}
              </div>

              {/* Sağ: Görsel */}
              <div className="relative">
                <div className="w-full aspect-[4/3] bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl overflow-hidden shadow-lg">
                  <img 
                    src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                    alt="Hakkımızda"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-6 -left-6 bg-blue-600 text-white p-6 rounded-2xl shadow-xl hidden lg:block">
                  <p className="text-3xl font-extrabold">15+</p>
                  <p className="text-blue-100 text-sm mt-1">Yıllık Deneyim</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* HİZMETLERİMİZ */}
      {services.length > 0 && (
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <span className="text-blue-600 font-extrabold text-sm uppercase tracking-wider">Neler Yapıyoruz</span>
              <h2 className="text-3xl font-extrabold text-gray-900 mt-2 mb-4">Hizmetlerimiz</h2>
              <p className="text-gray-500 max-w-2xl mx-auto text-lg">
                Müşterilerimize sunduğumuz profesyonel gayrimenkul hizmetleri.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.filter((s: any) => s.serviceStatus !== false).map((service: any) => (
                <div
                  key={service.serviceId}
                  className="bg-white rounded-2xl p-8 hover:shadow-lg transition-all group border border-gray-100"
                >
                  <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-5 group-hover:bg-blue-200 transition-colors">
                    {iconMap[service.icon] || <FiStar className="text-3xl text-blue-600" />}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{service.serviceName}</h3>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ALT BİLGİ KARTLARI */}
      {bottomGrids.length > 0 && (
        <section className="py-16 bg-blue-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {bottomGrids.map((grid: any) => (
                <div key={grid.bottomGridId} className="text-center text-white p-6">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    {iconMap[grid.icon] || <FiStar className="text-3xl text-white" />}
                  </div>
                  <h3 className="font-extrabold text-xl mb-2">{grid.title}</h3>
                  <p className="text-blue-100 text-sm">{grid.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Boş durum */}
      {!mainDetail && services.length === 0 && bottomGrids.length === 0 && (
        <div className="text-center py-32">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Henüz içerik eklenmemiş</h2>
          <p className="text-gray-500">Yönetici paneli üzerinden hakkımızda bilgilerini ekleyebilirsiniz.</p>
        </div>
      )}
    </div>
  );
}