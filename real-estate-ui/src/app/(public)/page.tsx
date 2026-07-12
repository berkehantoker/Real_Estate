"use client";

import { useEffect, useState } from 'react';
import Hero from '@/components/Hero';
import FeaturedProducts from '@/components/FeaturedProducts';
import { getAllServicesAPI } from '@/services/serviceService';
import { getAllTestimonialsAPI } from '@/services/testimonialService';
import { getAllBottomGridsAPI } from '@/services/bottomGridService';
import { FiHome, FiShield, FiTrendingUp, FiUsers, FiStar, FiChevronLeft, FiChevronRight, FiArrowRight } from 'react-icons/fi';
import Link from 'next/link';

export default function HomePage() {
  const [services, setServices] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [bottomGrids, setBottomGrids] = useState<any[]>([]);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesData, testimonialsData, bottomGridsData] = await Promise.all([
          getAllServicesAPI(),
          getAllTestimonialsAPI(),
          getAllBottomGridsAPI(),
        ]);
        setServices(servicesData);
        setTestimonials(testimonialsData.filter((t: any) => t.status === true));
        setBottomGrids(bottomGridsData);
      } catch (error) {
        console.error('Veri yükleme hatası:', error);
      }
    };
    fetchData();
  }, []);

  const iconMap: Record<string, React.ReactNode> = {
    FiHome: <FiHome className="text-3xl text-white" />,
    FiShield: <FiShield className="text-3xl text-white" />,
    FiTrendingUp: <FiTrendingUp className="text-3xl text-white" />,
    FiUsers: <FiUsers className="text-3xl text-white" />,
    FiStar: <FiStar className="text-3xl text-white" />,
  };

  return (
    <div>
      {/* 1. HERO */}
      <Hero />

      {/* 2. İSTATİSTİK KARTLARI - Güven veren sayılar */}
      {bottomGrids.length > 0 && (
        <section className="relative -mt-10 z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {bottomGrids.map((grid: any, index: number) => (
                <div
                  key={grid.bottomGridId}
                  className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center mb-4 shadow-md shadow-blue-200 group-hover:scale-110 transition-transform duration-300">
                    {iconMap[grid.icon] || <FiStar className="text-3xl text-white" />}
                  </div>
                  <h3 className="font-extrabold text-xl text-gray-900 mb-1">{grid.title}</h3>
                  <p className="text-gray-500 text-sm">{grid.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 3. ÖNE ÇIKAN İLANLAR */}
      <section className={`${bottomGrids.length > 0 ? 'pt-20 pb-16' : 'pt-20 pb-16'} bg-white`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-blue-600 font-extrabold text-sm uppercase tracking-widest bg-blue-50 px-4 py-1.5 rounded-full inline-block mb-4">
              Yeni Fırsatlar
            </span>
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Öne Çıkan İlanlar</h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg">
              En çok incelenen, fırsat niteliğindeki satılık ve kiralık ilanlarımızı keşfedin.
            </p>
          </div>

          <FeaturedProducts />

          <div className="text-center mt-12">
            <Link
              href="/ilanlar"
              className="inline-flex items-center gap-2 bg-gray-900 text-white font-bold px-8 py-4 rounded-2xl hover:bg-gray-800 shadow-lg shadow-gray-200 transition-all hover:shadow-xl active:scale-95"
            >
              Tüm İlanları İncele <FiArrowRight className="text-lg" />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. HİZMETLER */}
      {services.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <span className="text-blue-600 font-extrabold text-sm uppercase tracking-widest bg-blue-50 px-4 py-1.5 rounded-full inline-block mb-4">
                Neler Sunuyoruz
              </span>
              <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Hizmetlerimiz</h2>
              <p className="text-gray-500 max-w-2xl mx-auto text-lg">
                Gayrimenkul ihtiyaçlarınız için kapsamlı ve profesyonel çözümler.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.filter((s: any) => s.serviceStatus !== false).map((service: any, index: number) => (
                <div
                  key={service.serviceId}
                  className="bg-white rounded-2xl p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group border border-gray-100"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center mb-5 group-hover:from-blue-200 group-hover:to-blue-300 transition-all duration-300 shadow-sm">
                    {iconMap[service.icon] ? (
                      <span className="text-blue-600 text-2xl">{iconMap[service.icon]}</span>
                    ) : (
                      <FiStar className="text-2xl text-blue-600" />
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{service.serviceName}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    {service.description || 'Profesyonel danışmanlık hizmeti'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 5. REFERANSLAR */}
      {testimonials.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <span className="text-blue-600 font-extrabold text-sm uppercase tracking-widest bg-blue-50 px-4 py-1.5 rounded-full inline-block mb-4">
                Gerçek Deneyimler
              </span>
              <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Mutlu Müşterilerimiz</h2>
              <p className="text-gray-500 max-w-2xl mx-auto text-lg">
                Müşterilerimizin deneyimleri en büyük referansımızdır.
              </p>
            </div>

            <div className="relative max-w-4xl mx-auto">
              <div className="relative bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-3xl p-10 md:p-12 border border-gray-100 shadow-lg">
                {/* Tırnak işareti */}
                <div className="absolute -top-4 -left-4 text-7xl text-blue-200 select-none">&ldquo;</div>
                
                <div className="flex justify-center mb-6">
                  {[...Array(5)].map((_, i) => (
                    <FiStar key={i} className="text-2xl text-yellow-400 fill-yellow-400 mx-0.5" />
                  ))}
                </div>

                <blockquote className="text-gray-700 text-lg md:text-xl leading-relaxed italic mb-8 text-center relative z-10">
                  {testimonials[activeTestimonial]?.comment}
                </blockquote>

                <div className="flex items-center justify-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md">
                    {testimonials[activeTestimonial]?.nameSurname?.charAt(0)?.toUpperCase() || 'M'}
                  </div>
                  <div>
                    <p className="font-extrabold text-gray-900 text-lg">{testimonials[activeTestimonial]?.nameSurname}</p>
                    <p className="text-blue-600 font-semibold text-sm">{testimonials[activeTestimonial]?.title}</p>
                  </div>
                </div>
              </div>

              {testimonials.length > 1 && (
                <div className="flex justify-center items-center gap-6 mt-8">
                  <button
                    onClick={() => setActiveTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
                    className="p-3 bg-white rounded-full shadow-md border border-gray-200 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-all"
                  >
                    <FiChevronLeft className="text-xl" />
                  </button>

                  <div className="flex items-center gap-3">
                    {testimonials.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveTestimonial(idx)}
                        className={`transition-all rounded-full ${
                          activeTestimonial === idx
                            ? 'w-4 h-4 bg-blue-600 shadow-md shadow-blue-200'
                            : 'w-2.5 h-2.5 bg-gray-300 hover:bg-gray-400'
                        }`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={() => setActiveTestimonial((prev) => (prev + 1) % testimonials.length)}
                    className="p-3 bg-white rounded-full shadow-md border border-gray-200 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-all"
                  >
                    <FiChevronRight className="text-xl" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* 6. CTA - Harekete Geçirici */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
            Hayalinizdeki Eve Bir Adım Daha Yaklaşın
          </h2>
          <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto">
            Hemen ücretsiz danışmanlık alın, size en uygun mülkleri birlikte bulalım.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/ilanlar"
              className="bg-white text-blue-600 font-extrabold px-8 py-4 rounded-2xl hover:bg-gray-50 shadow-xl hover:shadow-2xl transition-all active:scale-95 text-lg"
            >
              İlanları Keşfet
            </Link>
            <Link
              href="/iletisim"
              className="bg-transparent text-white font-extrabold px-8 py-4 rounded-2xl border-2 border-white/30 hover:bg-white/10 transition-all active:scale-95 text-lg"
            >
              Bize Ulaşın
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}