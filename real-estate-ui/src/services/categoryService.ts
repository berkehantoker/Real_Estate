import axiosInstance from '../utils/axiosInstance';

export const getAllCategoriesAPI = async () => {
  try {
    // Eğer backend'de controller adın farklıysa buradaki '/Categories' kısmını '/Category' yapman gerekebilir.
    const response = await axiosInstance.get('/Categories');
    
    console.log("🔥 KATEGORİ CEVABI:", response.data); // Casus kodumuz
    
    return response.data?.items || response.data?.$values || response.data || [];
  } catch (error) {
    console.error("🚨 KATEGORİ HATASI:", error);
    return [];
  }
};

// Kategori Listesini Getir
export const getCategoriesAPI = async () => {
  const response = await axiosInstance.get('/Categories');
  return response.data;
};

// Tekil Kategori Getir (Gerekirse)
export const getCategoryByIdAPI = async (id: number) => {
  const response = await axiosInstance.get(`/Categories/${id}`);
  return response.data;
};

// Kategori Ekle
export const createCategoryAPI = async (data: { categoryName: string; categoryStatus: boolean }) => {
  const response = await axiosInstance.post('/Categories', data);
  return response.data;
};

// Kategori Güncelle
export const updateCategoryAPI = async (data: { categoryId: number; categoryName: string; categoryStatus: boolean }) => {
  const response = await axiosInstance.put('/Categories', data);
  return response.data;
};

// Kategori Sil
export const deleteCategoryAPI = async (id: number) => {
  const response = await axiosInstance.delete(`/Categories/${id}`);
  return response.data;
};