"use client";

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getAllBottomGridsAPI, createBottomGridAPI, updateBottomGridAPI, deleteBottomGridAPI } from '../../../../services/bottomGridService';
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';

interface BottomGrid {
  bottomGridId: number;
  icon: string;
  title: string;
  description: string;
}

const ICON_OPTIONS = ['FiHome', 'FiShield', 'FiTrendingUp', 'FiUsers', 'FiTarget', 'FiEye', 'FiHeart', 'FiStar'];

export default function BottomGridsPage() {
  const [bottomGrids, setBottomGrids] = useState<BottomGrid[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    bottomGridId: 0,
    icon: 'FiStar',
    title: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchBottomGrids = async () => {
    setIsLoading(true);
    try {
      const data = await getAllBottomGridsAPI();
      setBottomGrids(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchBottomGrids(); }, []);

  const openModal = (grid?: BottomGrid) => {
    if (grid) {
      setEditMode(true);
      setFormData({
        bottomGridId: grid.bottomGridId,
        icon: grid.icon,
        title: grid.title,
        description: grid.description
      });
    } else {
      setEditMode(false);
      setFormData({ bottomGridId: 0, icon: 'FiStar', title: '', description: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editMode) {
        await updateBottomGridAPI(formData);
      } else {
        await createBottomGridAPI({ icon: formData.icon, title: formData.title, description: formData.description });
      }
      await fetchBottomGrids();
      closeModal();
    } catch (error: any) {
      toast.error("İşlem başarısız: " + (error.response?.data || error.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number, title: string) => {
    if (window.confirm(`'${title}' bilgi kartını silmek istediğinize emin misiniz?`)) {
      try {
        await deleteBottomGridAPI(id);
        setBottomGrids(prev => prev.filter(g => g.bottomGridId !== id));
      } catch (error) {
        toast.error("Silme işlemi başarısız oldu.");
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900">Alt Bilgi Yönetimi</h2>
          <p className="text-gray-500 mt-1">Vitrin alt bölümünde gösterilecek istatistik kartlarını yönetin.</p>
        </div>
        <button onClick={() => openModal()} className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition shadow-md">
          <FiPlus className="text-xl" /> Yeni Kart Ekle
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-gray-500 font-medium animate-pulse">Alt bilgiler yükleniyor...</div>
        ) : bottomGrids.length === 0 ? (
          <div className="p-12 text-center text-gray-500 font-medium">Henüz hiç bilgi kartı eklenmemiş.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="p-5 font-bold text-gray-700">ID</th>
                  <th className="p-5 font-bold text-gray-700">İkon</th>
                  <th className="p-5 font-bold text-gray-700">Başlık</th>
                  <th className="p-5 font-bold text-gray-700">Açıklama</th>
                  <th className="p-5 font-bold text-gray-700 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bottomGrids.map((g) => (
                  <tr key={g.bottomGridId} className="hover:bg-gray-50 transition-colors">
                    <td className="p-5 text-gray-500 font-medium">#{g.bottomGridId}</td>
                    <td className="p-5 text-gray-600 font-mono">{g.icon}</td>
                    <td className="p-5 font-bold text-gray-900">{g.title}</td>
                    <td className="p-5 text-gray-600 max-w-[250px] truncate">{g.description}</td>
                    <td className="p-5 flex items-center justify-end gap-3">
                      <button onClick={() => openModal(g)} className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-600 hover:text-white transition-colors" title="Düzenle"><FiEdit2 /></button>
                      <button onClick={() => handleDelete(g.bottomGridId, g.title)} className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-600 hover:text-white transition-colors" title="Sil"><FiTrash2 /></button>
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
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-fadeIn">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-extrabold text-gray-900">{editMode ? 'Bilgi Kartını Düzenle' : 'Yeni Bilgi Kartı Ekle'}</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-red-500 transition-colors text-2xl"><FiX /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">İkon</label>
                <select value={formData.icon} onChange={(e) => setFormData({...formData, icon: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-colors appearance-none">
                  {ICON_OPTIONS.map(icon => <option key={icon} value={icon}>{icon}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Başlık *</label>
                <input type="text" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-colors" placeholder="Örn: 500+ Mutlu Müşteri" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Açıklama *</label>
                <input type="text" required value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-colors" placeholder="Kısa açıklama..." />
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