import axiosInstance from '../utils/axiosInstance';

// Hakkımızda bilgilerini listele (anonim erişim)
export const getAllWhoWeAreDetailsAPI = async () => {
  const response = await axiosInstance.get('/WhoWeAreDetails');
  return response.data?.$values || response.data || [];
};

// Hakkımızda bilgisi ekle (Admin)
export const createWhoWeAreDetailAPI = async (data: { title: string; subtitle: string; description1: string; description2: string }) => {
  const response = await axiosInstance.post('/WhoWeAreDetails', data);
  return response.data;
};

// Hakkımızda bilgisi güncelle (Admin)
export const updateWhoWeAreDetailAPI = async (data: { whoWeAreDetailId: number; title: string; subtitle: string; description1: string; description2: string }) => {
  const response = await axiosInstance.put('/WhoWeAreDetails', data);
  return response.data;
};

// Hakkımızda bilgisi sil (Admin)
export const deleteWhoWeAreDetailAPI = async (id: number) => {
  const response = await axiosInstance.delete(`/WhoWeAreDetails/${id}`);
  return response.data;
};