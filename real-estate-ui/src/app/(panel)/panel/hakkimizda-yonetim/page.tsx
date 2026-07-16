"use client";

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getAllWhoWeAreDetailsAPI, createWhoWeAreDetailAPI, updateWhoWeAreDetailAPI, deleteWhoWeAreDetailAPI } from '../../../../services/whoWeAreService';
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';

interface WhoWeAre {
  whoWeAreDetailId: number;
  title: string;
  subtitle: string;
  description1: string;
  description2: string;
}

export default function WhoWeArePage() {
  const [whoWeAre, setWhoWeAre] = useState<WhoWeAre[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    whoWeAreDetailId: 0,
    title: '',
    subtitle: '',
    description1: '',
    description2: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchWhoWeAre = async () => {
    setIsLoading(true);
    try {
      const data = await getAllWhoWeAreDetailsAPI();
      setWhoWeAre(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchWhoWeAre(); }, []);

  const openModal = (detail?: WhoWeAre) => {
    if (detail) {
      setEditMode(true);
      setFormData({
        whoWeAreDetailId: detail.whoWeAreDetailId,
        title: detail.title,
        subtitle: detail.subtitle,
        description1: detail.description1,
        description2: detail.description2
      });
    } else {
      setEditMode(false);
      setFormData({ whoWeAreDetailId: 0, title: '', subtitle: '', description1: '', description2: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editMode) {
        await updateWhoWeAreDetailAPI(formData);
      } else {
        await createWhoWeAreDetailAPI({
          title: formData.title,
          subtitle: formData.subtitle,
          description1: formData.description1,
          description2: formData.description2
        });
      }
      await fetchWhoWeAre();
      closeModal();
    } catch (error: any) {
      toast.error("İşlem başarısız: " + (error.response?.data || error.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number, title: string) => {
    if (window.confirm(`'${title}' hakkımızda bilgisini silmek istediğinize emin misiniz?`)) {
      try {
        await deleteWhoWeAreDetailAPI(id);
        setWhoWeAre(prev => prev.filter(w => w.whoWeAreDetailId !== id));
      } catch (error) {
        toast.error("Silme işlemi başarısız oldu.");
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900">Hakkımızda Yönetimi</h2>
          <p className="text-gray-500 mt-1">Hakkımızda sayfasında gösterilecek içeriği düzenleyin.</p>
        </div>
        <button onClick={() => openModal()} className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition shadow-md">
          <FiPlus className="text-xl" /> Yeni İçerik Ekle
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-gray-500 font-medium animate-pulse">Hakkımızda bilgileri yükleniyor...</div>
        ) : whoWeAre.length === 0 ? (
          <div className="p-12 text-center text-gray-500 font-medium">Henüz hiç hakkımızda içeriği eklenmemiş.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="p-5 font-bold text-gray-700">ID</th>
                  <th className="p-5 font-bold text-gray-700">Başlık</th>
                  <th className="p-5 font-bold text-gray-700">Alt Başlık</th>
                  <th className="p-5 font-bold text-gray-700 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {whoWeAre.map((w) => (
                  <tr key={w.whoWeAreDetailId} className="hover:bg-gray-50 transition-colors">
                    <td className="p-5 text-gray-500 font-medium">#{w.whoWeAreDetailId}</td>
                    <td className="p-5 font-bold text-gray-900">{w.title}</td>
                    <td className="p-5 text-gray-600 max-w-[300px] truncate">{w.subtitle}</td>
                    <td className="p-5 flex items-center justify-end gap-3">
                      <button onClick={() => openModal(w)} className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-600 hover:text-white transition-colors" title="Düzenle"><FiEdit2 /></button>
                      <button onClick={() => handleDelete(w.whoWeAreDetailId, w.title)} className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-600 hover:text-white transition-colors" title="Sil"><FiTrash2 /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl animate-fadeIn">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-extrabold text-gray-900">{editMode ? 'İçeriği Düzenle' : 'Yeni İçerik Ekle'}</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-red-500 transition-colors text-2xl"><FiX /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Başlık *</label>
                <input type="text" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-colors" placeholder="Örn: Biz Kimiz?" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Alt Başlık</label>
                <input type="text" value={formData.subtitle} onChange={(e) => setFormData({...formData, subtitle: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-colors" placeholder="Örn: Güvenilir emlak danışmanınız" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Açıklama 1 *</label>
                <textarea required value={formData.description1} onChange={(e) => setFormData({...formData, description1: e.target.value})} rows={3} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-colors resize-none" placeholder="İlk paragraf..." />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Açıklama 2</label>
                <textarea value={formData.description2} onChange={(e) => setFormData({...formData, description2: e.target.value})} rows={3} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-colors resize-none" placeholder="İkinci paragraf..." />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={closeModal} className="px-5 py-2.5 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-colors">İptal</button>
                <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-md transition-colors disabled:opacity-50">{isSubmitting ? 'Kaydediliyor...' : 'Kaydet'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `@keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } } .animate-fadeIn { animation: fadeIn 0.2s ease-out; }` }} />
    </div>
  );
}