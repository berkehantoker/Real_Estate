"use client";

import { useEffect, useState } from 'react';
import { 
  getCategoriesAPI, 
  createCategoryAPI, 
  updateCategoryAPI, 
  deleteCategoryAPI 
} from '../../../../services/categoryService';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiCheckCircle, FiXCircle } from 'react-icons/fi';

// TypeScript arayüzümüz (Backend ile birebir aynı)
interface Category {
  categoryId: number;
  categoryName: string;
  categoryStatus: boolean;
}

export default function CategoriesPage() {
  // --- 1. HOOK'LAR (TÜMÜ EN TEPEDE) ---
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal (Popup) State'leri
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  
  // Form State'i
  const [formData, setFormData] = useState({
    categoryId: 0,
    categoryName: '',
    categoryStatus: true
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- 2. DATA FETCHING ---
  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const data = await getCategoriesAPI();
      setCategories(data);
    } catch (error) {
      console.error("Kategoriler yüklenemedi", error);
      alert("Kategoriler yüklenirken bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // --- 3. YARDIMCI FONKSİYONLAR ---

  // Modalı Aç (Ekleme veya Düzenleme modu için)
  const openModal = (category?: Category) => {
    if (category) {
      // Düzenleme Modu
      setEditMode(true);
      setFormData({
        categoryId: category.categoryId,
        categoryName: category.categoryName,
        categoryStatus: category.categoryStatus
      });
    } else {
      // Yeni Ekleme Modu
      setEditMode(false);
      setFormData({
        categoryId: 0,
        categoryName: '',
        categoryStatus: true
      });
    }
    setIsModalOpen(true);
  };

  // Modalı Kapat
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Form Gönderme (Ekleme & Güncelleme)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editMode) {
        // Güncelleme İsteği
        await updateCategoryAPI({
          categoryId: formData.categoryId,
          categoryName: formData.categoryName,
          categoryStatus: formData.categoryStatus
        });
      } else {
        // Yeni Ekleme İsteği (Id gönderilmez, Backend kendi atar)
        await createCategoryAPI({
          categoryName: formData.categoryName,
          categoryStatus: formData.categoryStatus
        });
      }
      
      // İşlem başarılıysa listeyi yenile ve modalı kapat
      await fetchCategories();
      closeModal();
      
    } catch (error: any) {
      alert("İşlem sırasında bir hata oluştu: " + (error.response?.data || error.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Silme İşlemi
  const handleDelete = async (id: number, name: string) => {
    if (window.confirm(`'${name}' adlı kategoriyi silmek istediğinize emin misiniz? Bu kategoriye ait ilanlar etkilenebilir.`)) {
      try {
        await deleteCategoryAPI(id);
        // Listeden silineni çıkar (API'ye tekrar istek atmadan UI'ı günceller)
        setCategories(prev => prev.filter(c => c.categoryId !== id));
      } catch (error) {
        alert("Silme işlemi başarısız oldu.");
      }
    }
  };

  // --- 4. RENDER ---
  return (
    <div className="max-w-7xl mx-auto pb-20">
      
      {/* Üst Başlık ve Ekle Butonu */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900">Kategori Yönetimi</h2>
          <p className="text-gray-500 mt-1">İlanların bağlı olduğu emlak tiplerini ekleyin veya düzenleyin.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition shadow-md"
        >
          <FiPlus className="text-xl" /> Yeni Kategori Ekle
        </button>
      </div>

      {/* Kategoriler Tablosu */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-gray-500 font-medium animate-pulse">Kategoriler yükleniyor...</div>
        ) : categories.length === 0 ? (
          <div className="p-12 text-center text-gray-500 font-medium">Henüz hiç kategori eklenmemiş.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="p-5 font-bold text-gray-700">ID</th>
                  <th className="p-5 font-bold text-gray-700">Kategori Adı</th>
                  <th className="p-5 font-bold text-gray-700 text-center">Durum</th>
                  <th className="p-5 font-bold text-gray-700 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {categories.map((category) => (
                  <tr key={category.categoryId} className="hover:bg-gray-50 transition-colors">
                    <td className="p-5 text-gray-500 font-medium">#{category.categoryId}</td>
                    <td className="p-5 font-bold text-gray-900">{category.categoryName}</td>
                    <td className="p-5 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold ${category.categoryStatus ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {category.categoryStatus ? <><FiCheckCircle /> Aktif</> : <><FiXCircle /> Pasif</>}
                      </span>
                    </td>
                    <td className="p-5 flex items-center justify-end gap-3">
                      <button 
                        onClick={() => openModal(category)}
                        className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
                        title="Düzenle"
                      >
                        <FiEdit2 />
                      </button>
                      <button 
                        onClick={() => handleDelete(category.categoryId, category.categoryName)}
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

      {/* --- EKLE/DÜZENLE MODALI (POPUP) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-fadeIn">
            
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-extrabold text-gray-900">
                {editMode ? 'Kategoriyi Düzenle' : 'Yeni Kategori Ekle'}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-red-500 transition-colors text-2xl">
                <FiX />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              
              <div className="mb-5">
                <label className="block text-sm font-bold text-gray-700 mb-2">Kategori Adı</label>
                <input 
                  type="text" 
                  required
                  value={formData.categoryName}
                  onChange={(e) => setFormData({...formData, categoryName: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-colors"
                  placeholder="Örn: Daire, Villa, Arsa..."
                />
              </div>

              <div className="mb-8">
                <label className="block text-sm font-bold text-gray-700 mb-2">Kategori Durumu</label>
                <select 
                  value={formData.categoryStatus ? "true" : "false"}
                  onChange={(e) => setFormData({...formData, categoryStatus: e.target.value === "true"})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-colors appearance-none"
                >
                  <option value="true">Aktif (İlanlarda Görünür)</option>
                  <option value="false">Pasif (Gizli)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button 
                  type="button" 
                  onClick={closeModal}
                  className="px-5 py-2.5 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-colors"
                >
                  İptal
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-md transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            </form>

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