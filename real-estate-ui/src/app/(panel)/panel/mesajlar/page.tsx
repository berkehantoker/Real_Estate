"use client";

import { useEffect, useState } from 'react';
import { getAllContactsAPI, deleteContactAPI } from '../../../../services/contactService';
import { FiMail, FiTrash2, FiEye, FiX, FiCalendar, FiCheck, FiSend, FiSearch, FiChevronLeft, FiChevronRight, FiClock, FiUser } from 'react-icons/fi';

// Senin ResultContactDto sınıfınla birebir aynı TypeScript arayüzü
interface Contact {
  contactId: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  sendDate: string;
  isRead: boolean;
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Mesaj Okuma Modalı State'i
  const [selectedMessage, setSelectedMessage] = useState<Contact | null>(null);

  // ============================================================================
  // YENİ STATE'LER: Arama ve Sayfalama
  // ============================================================================
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Genişletilmiş kart state'i (hangi kartın genişletildiğini tutar)
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const data = await getAllContactsAPI();
        setMessages(data.reverse()); 
      } catch (error) {
        console.error("Mesajlar yüklenemedi", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMessages();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm('Bu mesajı silmek istediğinize emin misiniz?')) {
      try {
        await deleteContactAPI(id);
        setMessages(prev => prev.filter(m => m.contactId !== id));
        if (selectedMessage?.contactId === id) setSelectedMessage(null); 
      } catch (error) {
        alert("Silme işlemi başarısız oldu.");
      }
    }
  };

  const handleOpenMessage = (msg: Contact) => {
    setSelectedMessage(msg);
  };

  const handleReplyByEmail = (email: string, subject: string) => {
    const link = document.createElement('a');
    link.href = `mailto:${email}?subject=${encodeURIComponent('Re: ' + subject)}`;
    link.target = '_blank';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ============================================================================
  // ARAMA VE SAYFALAMA LOGIC'I
  // ============================================================================
  const filteredMessages = messages.filter((msg) => {
    const searchLower = searchTerm.toLowerCase();
    if (!searchLower) return true;
    return (
      msg.name?.toLowerCase().includes(searchLower) ||
      msg.email?.toLowerCase().includes(searchLower) ||
      msg.subject?.toLowerCase().includes(searchLower) ||
      msg.message?.toLowerCase().includes(searchLower)
    );
  });

  const totalPages = Math.ceil(filteredMessages.length / itemsPerPage);
  const currentMessages = filteredMessages.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="max-w-7xl mx-auto pb-20">
      
      {/* ═══════════ ÜST BAR ═══════════ */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-emerald-50 rounded-xl flex items-center justify-center text-xl">
            📬
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Gelen Mesajlar</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="bg-emerald-50 text-emerald-700 font-bold text-sm px-3 py-1 rounded-full">
                {filteredMessages.length} Mesaj
              </span>
              {messages.filter(m => !m.isRead).length > 0 && (
                <span className="bg-blue-100 text-blue-700 font-bold text-xs px-2 py-0.5 rounded-full">
                  {messages.filter(m => !m.isRead).length} Okunmamış
                </span>
              )}
              {searchTerm && (
                <span className="text-xs text-gray-400">
                  "{searchTerm}" için filtrelendi
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════ ARAMA KUTUSU ═══════════ */}
      <div className="relative w-full max-w-md mb-6">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <FiSearch className="text-gray-400 text-lg" />
        </div>
        <input
          type="text"
          placeholder="Gönderen adı, e-posta, konu veya mesaj içeriği ara..."
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all placeholder:text-gray-400"
        />
        {searchTerm && (
          <button
            onClick={() => { setSearchTerm(''); setCurrentPage(1); }}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-red-500 transition-colors text-sm font-medium"
          >
            Temizle
          </button>
        )}
      </div>

      {/* ═══════════ MESAJ KART LİSTESİ ═══════════ */}
      {isLoading ? (
        <div className="flex flex-col items-center gap-4 py-20">
          <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
          <span className="text-gray-500 font-medium">Mesajlar yükleniyor...</span>
        </div>
      ) : currentMessages.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-2xl border border-gray-200 shadow-sm">
          <div className="text-gray-300 mb-4 text-6xl flex justify-center">
            {searchTerm ? <FiSearch /> : <FiMail />}
          </div>
          <h3 className="text-xl font-bold text-gray-700 mb-2">
            {searchTerm ? 'Sonuç Bulunamadı' : 'Gelen Kutunuz Boş'}
          </h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            {searchTerm
              ? `"${searchTerm}" kriterine uygun mesaj bulunamadı.`
              : 'Henüz hiç mesaj almadınız.'}
          </p>
          {searchTerm && (
            <button
              onClick={() => { setSearchTerm(''); setCurrentPage(1); }}
              className="text-emerald-600 font-bold hover:underline"
            >
              Aramayı Temizle
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {currentMessages.map((msg) => {
            const isExpanded = expandedId === msg.contactId;
            return (
              <div 
                key={msg.contactId} 
                className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all ${
                  msg.isRead ? 'border-gray-200' : 'border-blue-200 bg-blue-50/30'
                }`}
              >
                {/* Kart Üstü: Gönderen + Konu + Tarih + Aksiyonlar */}
                <div className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    
                    {/* Sol: Gönderen ve Durum */}
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      {/* Avatar */}
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm ${
                        msg.isRead ? 'bg-gray-400' : 'bg-blue-500'
                      }`}>
                        {msg.name?.charAt(0).toUpperCase() || '?'}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className={`text-base truncate ${msg.isRead ? 'font-semibold text-gray-800' : 'font-extrabold text-gray-900'}`}>
                            {msg.name}
                          </h3>
                          {!msg.isRead && (
                            <span className="flex-shrink-0 flex items-center gap-1 text-xs font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full animate-pulse">
                              Yeni
                            </span>
                          )}
                          {msg.isRead && (
                            <span className="flex-shrink-0 flex items-center gap-1 text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                              <FiCheck className="w-3 h-3" /> Okundu
                            </span>
                          )}
                        </div>
                        
                        <a 
                          href={`mailto:${msg.email}`}
                          className="text-sm text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1 mt-0.5"
                        >
                          {msg.email} <FiSend className="w-3 h-3" />
                        </a>

                        <p className="text-sm font-bold text-gray-700 mt-1 line-clamp-1">
                          {msg.subject}
                        </p>

                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                          <FiClock className="w-3 h-3" /> 
                          {new Date(msg.sendDate || new Date()).toLocaleDateString('tr-TR')} - {new Date(msg.sendDate || new Date()).toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})}
                        </p>
                      </div>
                    </div>

                    {/* Sağ: Aksiyon Butonları */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => toggleExpand(msg.contactId)}
                        className={`p-2 rounded-lg transition-all border text-sm font-bold ${
                          isExpanded 
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                            : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                        }`}
                        title={isExpanded ? 'Küçült' : 'Mesajı Oku'}
                      >
                        <FiEye className="text-sm" />
                      </button>
                      <button 
                        onClick={() => handleOpenMessage(msg)}
                        className="p-2 text-blue-500 bg-blue-50 rounded-lg hover:bg-blue-600 hover:text-white transition-all border border-blue-100"
                        title="Detaylı Görünüm"
                      >
                        <FiMail className="text-sm" />
                      </button>
                      <button 
                        onClick={() => handleDelete(msg.contactId)}
                        className="p-2 text-red-500 bg-red-50 rounded-lg hover:bg-red-600 hover:text-white transition-all border border-red-100"
                        title="Sil"
                      >
                        <FiTrash2 className="text-sm" />
                      </button>
                    </div>
                  </div>

                  {/* Kart Gövdesi: Mesaj İçeriği (Expand edilince görünür) */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm">
                          {msg.message}
                        </p>
                      </div>
                      <div className="flex justify-end mt-3">
                        <button
                          onClick={() => handleReplyByEmail(msg.email, msg.subject)}
                          className="text-xs font-bold text-emerald-600 hover:text-emerald-800 flex items-center gap-1 transition-colors"
                        >
                          <FiSend className="w-3 h-3" /> Cevapla
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ═══════════ SAYFALAMA ═══════════ */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8 pb-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2.5 bg-white rounded-xl shadow-sm border border-gray-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-all"
          >
            <FiChevronLeft className="text-lg" />
          </button>
          {[...Array(totalPages)].map((_, i) => {
            const page = i + 1;
            return (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`w-10 h-10 rounded-xl font-extrabold text-sm shadow-sm border transition-all ${
                  currentPage === page
                    ? 'bg-emerald-600 text-white border-emerald-600 scale-110 shadow-emerald-200'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200'
                }`}
              >
                {page}
              </button>
            );
          })}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2.5 bg-white rounded-xl shadow-sm border border-gray-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-all"
          >
            <FiChevronRight className="text-lg" />
          </button>
        </div>
      )}

      {/* --- MESAJ OKUMA MODALI (KORUNDU) --- */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-fadeIn">
            
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50">
              <h3 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
                <FiMail className="text-blue-600" /> Mesaj Detayı
              </h3>
              <button onClick={() => setSelectedMessage(null)} className="text-gray-400 hover:text-red-500 transition-colors text-2xl">
                <FiX />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex justify-between items-start border-b pb-4">
                <div>
                  <p className="text-sm text-gray-500">Gönderen</p>
                  <p className="font-bold text-lg text-gray-900">{selectedMessage.name}</p>
                  <a href={`mailto:${selectedMessage.email}`} className="text-blue-600 font-medium hover:underline">{selectedMessage.email}</a>
                </div>
                <div className="text-right">
                   <p className="text-sm text-gray-500 flex items-center gap-1 justify-end"><FiCalendar/> Tarih</p>
                   <p className="font-semibold text-gray-800">{new Date(selectedMessage.sendDate || new Date()).toLocaleDateString('tr-TR')} - {new Date(selectedMessage.sendDate || new Date()).toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Konu</p>
                <p className="font-bold text-gray-900">{selectedMessage.subject}</p>
              </div>

              <div className="bg-blue-50/50 p-5 rounded-xl border border-blue-100">
                <p className="text-sm text-gray-500 mb-2">Mesaj İçeriği</p>
                <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{selectedMessage.message}</p>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 flex justify-between gap-3 bg-gray-50">
               <a 
                  href={`mailto:${selectedMessage.email}?subject=${encodeURIComponent('Re: ' + selectedMessage.subject)}`}
                  className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 cursor-pointer no-underline"
                >
                  <FiSend /> E-Posta ile Cevapla
                </a>
               <div className="flex gap-3">
                 <button 
                    onClick={() => handleDelete(selectedMessage.contactId)}
                    className="px-4 py-2 bg-red-50 text-red-600 font-bold rounded-lg hover:bg-red-100 transition-colors"
                  >
                    Sil
                  </button>
                 <button 
                    onClick={() => setSelectedMessage(null)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 font-bold rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Kapat
                  </button>
               </div>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
      `}} />
    </div>
  );
}