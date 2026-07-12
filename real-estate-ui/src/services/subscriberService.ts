import axiosInstance from '../utils/axiosInstance';

// Admin tüm aboneleri listeler
export const getAllSubscribersAPI = async () => {
  const response = await axiosInstance.get('/Subscribers');
  return response.data?.$values || response.data || [];
};

// Ziyaretçi bültene kaydolur (anonim erişim)
export const subscribeAPI = async (email: string) => {
  const response = await axiosInstance.post('/Subscribers', { email });
  return response.data;
};