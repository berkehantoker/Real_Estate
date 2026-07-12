"use client";

import { useEffect, useState } from 'react';
import { getAllContactsAPI, deleteContactAPI } from '../../../../services/contactService';
import { FiMail, FiTrash2, FiEye, FiX, FiCalendar, FiCheck, FiSend } from 'react-icons/fi';

// Senin ResultContactDto sınıfınla birebir aynı TypeScript arayüzü
interface Contact {
  contactId: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  sendDate: string;
  isRead: boolean; // Backend'deki o güzel alanı ekledik
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Mesaj Okuma Modalı State'i
  const [selectedMessage, setSelectedMessage] = useState<Contact | null>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const data = await getAllContactsAPI();
        // Yeni mesajlar hep en üstte görünsün diye listeyi tersine çeviriyoruz
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
        // Silme başarılıysa listeyi State üzerinden anında güncelle (Sayfa yenilemeden)
        setMessages(prev => prev.filter(m => m.contactId !== id));
        // Eğer açık olan mesajı sildiyse, modalı kapat
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

  return (
    <div className="max-w-7xl mx-auto pb-20">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
          <FiMail className="text-blue-600" /> Gelen Mesajlar
        </h2>
        <p className="text-gray-500 mt-1">Ziyaretçilerinizden gelen iletişim formlarını okuyun ve yönetin.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-gray-500 font-medium animate-pulse">Mesajlar yükleniyor...</div>
        ) : messages.length === 0 ? (
          <div className="p-12 text-center text-gray-500 font-medium">Gelen kutunuz boş.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="p-5 font-bold text-gray-700">Durum</th>
                  <th className="p-5 font-bold text-gray-700">Gönderen</th>
                  <th className="p-5 font-bold text-gray-700">E-Posta</th>
                  <th className="p-5 font-bold text-gray-700">Konu</th>
                  <th className="p-5 font-bold text-gray-700">Tarih</th>
                  <th className="p-5 font-bold text-gray-700 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {messages.map((msg) => (
                  <tr key={msg.contactId} className={`transition-colors ${msg.isRead ? 'bg-white hover:bg-gray-50' : 'bg-blue-50/30 hover:bg-blue-50'}`}>
                    <td className="p-5">
                      {msg.isRead ? (
                        <span className="flex items-center gap-1 text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-full w-max"><FiCheck /> Okundu</span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs font-bold text-blue-700 bg-blue-100 px-2 py-1 rounded-full w-max animate-pulse">Yeni</span>
                      )}
                    </td>
                    <td className={`p-5 text-gray-900 ${msg.isRead ? 'font-medium' : 'font-extrabold'}`}>{msg.name}</td>
                    <td className="p-5 text-gray-600">{msg.email}</td>
                    <td className={`p-5 max-w-[200px] truncate ${msg.isRead ? 'text-gray-800 font-medium' : 'text-gray-900 font-extrabold'}`}>{msg.subject}</td>
                    <td className="p-5 text-gray-500 text-sm">
                      {new Date(msg.sendDate || new Date()).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="p-5 flex items-center justify-end gap-3">
                      <button 
                        onClick={() => handleOpenMessage(msg)}
                        className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
                        title="Mesajı Oku"
                      >
                        <FiEye />
                      </button>
                      <button 
                        onClick={() => handleDelete(msg.contactId)}
                        className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-600 hover:text-white transition-colors"
                        title="Sil"
                      >
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* --- MESAJ OKUMA MODALI (GÖZ SİMGESİNE TIKLANINCA AÇILIR) --- */}
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