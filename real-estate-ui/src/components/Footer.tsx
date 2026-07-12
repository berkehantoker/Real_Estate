"use client";

import { useState } from 'react';
import Link from 'next/link';
import { subscribeAPI } from '@/services/subscriberService';
import { FiHome, FiPhone, FiMail, FiMapPin, FiSend, FiCheckCircle, FiChevronRight } from 'react-icons/fi';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscribeSuccess, setSubscribeSuccess] = useState(false);
  const [subscribeError, setSubscribeError] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setSubscribeError('Lütfen e-posta adresinizi girin.');
      return;
    }

    setIsSubscribing(true);
    setSubscribeError('');
    try {
      await subscribeAPI(email);
      setSubscribeSuccess(true);
      setEmail('');
    } catch (error) {
      setSubscribeError('Kayıt sırasında bir hata oluştu.');
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <footer className="bg-gray-900 text-white">
      {/* Üst Bölüm */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Logo & Hakkımızda */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <FiHome className="text-3xl text-blue-400" />
              <span className="text-2xl font-extrabold text-white">RealEstate</span>
            </div>
            <p className="text-gray-400 leading-relaxed text-sm">
              Güvenilir emlak danışmanlığı ile hayalinizdeki eve kavuşmanız için yanınızdayız. 
              Satılık, kiralık ve yatırımlık mülklerde profesyonel çözümler sunuyoruz.
            </p>
          </div>

          {/* Hızlı Linkler */}
          <div>
            <h4 className="font-extrabold text-lg mb-5">Hızlı Erişim</h4>
            <ul className="space-y-3">
              <li><Link href="/" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 text-sm"><FiChevronRight className="text-blue-400" /> Ana Sayfa</Link></li>
              <li><Link href="/ilanlar" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 text-sm"><FiChevronRight className="text-blue-400" /> İlanlar</Link></li>
              <li><Link href="/hakkimizda" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 text-sm"><FiChevronRight className="text-blue-400" /> Hakkımızda</Link></li>
              <li><Link href="/iletisim" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 text-sm"><FiChevronRight className="text-blue-400" /> İletişim</Link></li>
            </ul>
          </div>

          {/* İletişim Bilgileri */}
          <div>
            <h4 className="font-extrabold text-lg mb-5">İletişim</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-center gap-3 text-gray-400">
                <FiMapPin className="text-blue-400 text-lg flex-shrink-0" />
                <span>Bağdat Caddesi No: 123/5, Kadıköy, İstanbul</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400">
                <FiPhone className="text-blue-400 text-lg flex-shrink-0" />
                <span>+90 555 123 45 67</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400">
                <FiMail className="text-blue-400 text-lg flex-shrink-0" />
                <span>info@realestate.com</span>
              </li>
            </ul>
          </div>

          {/* Bültene Abone Ol */}
          <div>
            <h4 className="font-extrabold text-lg mb-5">Bültene Katılın</h4>
            <p className="text-gray-400 text-sm mb-4">
              En yeni ilanlardan ve fırsatlardan haberdar olmak için e-posta bültenimize kaydolun.
            </p>

            {subscribeSuccess ? (
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-center">
                <FiCheckCircle className="text-3xl text-green-400 mx-auto mb-2" />
                <p className="text-green-400 font-bold text-sm">Başarıyla kaydoldunuz!</p>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="E-posta adresiniz"
                    className="flex-1 px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl outline-none text-white placeholder-gray-500 focus:border-blue-500 focus:bg-gray-700 transition-colors text-sm"
                  />
                  <button
                    type="submit"
                    disabled={isSubscribing}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors disabled:opacity-50"
                    title="Abone Ol"
                  >
                    <FiSend className="text-lg" />
                  </button>
                </div>
                {subscribeError && (
                  <p className="text-red-400 text-xs">{subscribeError}</p>
                )}
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Alt Çizgi */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-gray-500 text-sm">© 2026 RealEstate. Tüm hakları saklıdır.</p>
         
        </div>
      </div>
    </footer>
  );
}