"use client";

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getAllServicesAPI, createServiceAPI, updateServiceAPI, deleteServiceAPI } from '../../../../services/serviceService';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiCheckCircle, FiXCircle } from 'react-icons/fi';

interface Service {
  serviceId: number;
  serviceName: string;
  serviceStatus: boolean;
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    serviceId: 0,
    serviceName: '',
    serviceStatus: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchServices = async () => {
    setIsLoading(true);
    try {
      const data = await getAllServicesAPI();
      setServices(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchServices(); }, []);

  const openModal = (service?: Service) => {
    if (service) {
      setEditMode(true);
      setFormData({ serviceId: service.serviceId, serviceName: service.serviceName, serviceStatus: service.serviceStatus });
    } else {
      setEditMode(false);
      setFormData({ serviceId: 0, serviceName: '', serviceStatus: true });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editMode) {
        await updateServiceAPI(formData);
      } else {
        await createServiceAPI({ serviceName: formData.serviceName, serviceStatus: formData.serviceStatus });
      }
      await fetchServices();
      closeModal();
    } catch (error: any) {
      toast.error("İşlem başarısız: " + (error.response?.data || error.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (window.confirm(`'${name}' hizmetini silmek istediğinize emin misiniz?`)) {
      try {
        await deleteServiceAPI(id);
        setServices(prev => prev.filter(s => s.serviceId !== id));
      } catch (error) {
        toast.error("Silme işlemi başarısız oldu.");
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900">Hizmet Yönetimi</h2>
          <p className="text-gray-500 mt-1">Vitrinde gösterilecek hizmetleri ekleyin veya düzenleyin.</p>
        </div>
        <button onClick={() => openModal()} className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition shadow-md">
          <FiPlus className="text-xl" /> Yeni Hizmet Ekle
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-gray-500 font-medium animate-pulse">Hizmetler yükleniyor...</div>
        ) : services.length === 0 ? (
          <div className="p-12 text-center text-gray-500 font-medium">Henüz hiç hizmet eklenmemiş.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="p-5 font-bold text-gray-700">ID</th>
                  <th className="p-5 font-bold text-gray-700">Hizmet Adı</th>
                  <th className="p-5 font-bold text-gray-700 text-center">Durum</th>
                  <th className="p-5 font-bold text-gray-700 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {services.map((s) => (
                  <tr key={s.serviceId} className="hover:bg-gray-50 transition-colors">
                    <td className="p-5 text-gray-500 font-medium">#{s.serviceId}</td>
                    <td className="p-5 font-bold text-gray-900">{s.serviceName}</td>
                    <td className="p-5 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold ${s.serviceStatus ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {s.serviceStatus ? <><FiCheckCircle /> Aktif</> : <><FiXCircle /> Pasif</>}
                      </span>
                    </td>
                    <td className="p-5 flex items-center justify-end gap-3">
                      <button onClick={() => openModal(s)} className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-600 hover:text-white transition-colors" title="Düzenle"><FiEdit2 /></button>
                      <button onClick={() => handleDelete(s.serviceId, s.serviceName)} className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-600 hover:text-white transition-colors" title="Sil"><FiTrash2 /></button>
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
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-fadeIn">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-extrabold text-gray-900">{editMode ? 'Hizmeti Düzenle' : 'Yeni Hizmet Ekle'}</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-red-500 transition-colors text-2xl"><FiX /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              <div className="mb-5">
                <label className="block text-sm font-bold text-gray-700 mb-2">Hizmet Adı</label>
                <input type="text" required value={formData.serviceName} onChange={(e) => setFormData({...formData, serviceName: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-colors" placeholder="Örn: Satılık Konut, Kiralık Daire..." />
              </div>
              <div className="mb-8">
                <label className="block text-sm font-bold text-gray-700 mb-2">Hizmet Durumu</label>
                <select value={formData.serviceStatus ? "true" : "false"} onChange={(e) => setFormData({...formData, serviceStatus: e.target.value === "true"})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-colors appearance-none">
                  <option value="true">Aktif (Vitrinde Görünür)</option>
                  <option value="false">Pasif (Gizli)</option>
                </select>
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