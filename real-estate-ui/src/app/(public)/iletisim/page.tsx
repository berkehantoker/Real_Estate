"use client";

import { useState } from 'react';
import { createContactAPI } from '../../../services/contactService';
import { useAuthStore } from '../../../store/useAuthStore';
import { FiMail, FiPhone, FiMapPin, FiSend, FiUser, FiCheckCircle } from 'react-icons/fi';

export default function ContactPage() {
  const { user } = useAuthStore();
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    subject: '',
    message: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      setError('Lütfen tüm alanları doldurun.');
      return;
    }

    setIsLoading(true);
    try {
      await createContactAPI(formData);
      setIsSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      setError('Mesajınız gönderilirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Üst Başlık */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Bizimle İletişime Geçin</h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Hayalinizdeki mülkü bulmanıza yardımcı olalım. Sorularınızı, önerilerinizi veya taleplerinizi bize iletin, en kısa sürede dönüş yapalım.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* SOL TARAF: İLETİŞİM BİLGİLERİ KARTLARI */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4 hover:shadow-md transition-shadow">
              <div className="p-3 bg-blue-50 rounded-xl">
                <FiPhone className="text-2xl text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Telefon</h3>
                <p className="text-gray-500 mt-1">+90 555 123 45 67</p>
                <p className="text-gray-400 text-sm">Pazartesi - Cumartesi: 09:00 - 18:00</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4 hover:shadow-md transition-shadow">
              <div className="p-3 bg-blue-50 rounded-xl">
                <FiMail className="text-2xl text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">E-Posta</h3>
                <p className="text-gray-500 mt-1">info@realestate.com</p>
                <p className="text-gray-400 text-sm">7/24 e-posta desteği</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4 hover:shadow-md transition-shadow">
              <div className="p-3 bg-blue-50 rounded-xl">
                <FiMapPin className="text-2xl text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Ofis Adresi</h3>
                <p className="text-gray-500 mt-1">Bağdat Caddesi No: 123/5, Kadıköy</p>
                <p className="text-gray-400 text-sm">İstanbul, Türkiye</p>
              </div>
            </div>
          </div>

          {/* SAĞ TARAF: İLETİŞİM FORMU */}
          <div className="lg:col-span-2">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              
              {isSuccess ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
                    <FiCheckCircle className="text-5xl text-green-500" />
                  </div>
                  <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Mesajınız Alındı!</h2>
                  <p className="text-gray-500 max-w-md mb-8">
                    Mesajınız başarıyla tarafımıza iletildi. En kısa sürede size dönüş yapacağız.
                  </p>
                  <button 
                    onClick={() => setIsSuccess(false)}
                    className="bg-blue-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    Yeni Mesaj Gönder
                  </button>
                </div>
              ) : (
                <>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Mesaj Gönderin</h3>
                  <p className="text-gray-500 mb-8">Aşağıdaki formu doldurarak bize ulaşabilirsiniz.</p>

                  {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 border border-red-100 text-sm font-medium">
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Adınız Soyadınız *</label>
                        <div className="relative">
                          <FiUser className="absolute left-3 top-3.5 text-gray-400" />
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            readOnly={!!user}
                            placeholder="Adınızı ve soyadınızı girin"
                            className={`w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl outline-none transition-colors ${user ? 'bg-gray-100 text-gray-600 cursor-not-allowed' : 'bg-gray-50 focus:border-blue-400 focus:bg-white'}`}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">E-Posta Adresiniz *</label>
                        <div className="relative">
                          <FiMail className="absolute left-3 top-3.5 text-gray-400" />
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            readOnly={!!user}
                            placeholder="ornek@email.com"
                            className={`w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl outline-none transition-colors ${user ? 'bg-gray-100 text-gray-600 cursor-not-allowed' : 'bg-gray-50 focus:border-blue-400 focus:bg-white'}`}
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Konu *</label>
                      <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="Mesajınızın konusu"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-400 focus:bg-white transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Mesajınız *</label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        rows={6}
                        placeholder="Mesajınızı buraya yazın..."
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-400 focus:bg-white transition-colors resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-blue-600 text-white font-extrabold py-4 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                      {isLoading ? (
                        'Gönderiliyor...'
                      ) : (
                        <>
                          <FiSend className="text-lg" /> Mesajı Gönder
                        </>
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}