import axiosInstance from '../utils/axiosInstance';

// Tüm hizmetleri listele (anonim erişim)
export const getAllServicesAPI = async () => {
  const response = await axiosInstance.get('/Services');
  return response.data?.$values || response.data || [];
};

// Hizmet ekle (Admin)
export const createServiceAPI = async (data: { serviceName: string; serviceStatus: boolean }) => {
  const response = await axiosInstance.post('/Services', data);
  return response.data;
};

// Hizmet güncelle (Admin)
export const updateServiceAPI = async (data: { serviceId: number; serviceName: string; serviceStatus: boolean }) => {
  const response = await axiosInstance.put('/Services', data);
  return response.data;
};

// Hizmet sil (Admin)
export const deleteServiceAPI = async (id: number) => {
  const response = await axiosInstance.delete(`/Services/${id}`);
  return response.data;
};