import axiosInstance from '../utils/axiosInstance';

// Tüm alt bilgi kartlarını listele (anonim erişim)
export const getAllBottomGridsAPI = async () => {
  const response = await axiosInstance.get('/BottomGrids');
  return response.data?.$values || response.data || [];
};

// Alt bilgi kartı ekle (Admin)
export const createBottomGridAPI = async (data: { icon: string; title: string; description: string }) => {
  const response = await axiosInstance.post('/BottomGrids', data);
  return response.data;
};

// Alt bilgi kartı güncelle (Admin)
export const updateBottomGridAPI = async (data: { bottomGridId: number; icon: string; title: string; description: string }) => {
  const response = await axiosInstance.put('/BottomGrids', data);
  return response.data;
};

// Alt bilgi kartı sil (Admin)
export const deleteBottomGridAPI = async (id: number) => {
  const response = await axiosInstance.delete(`/BottomGrids/${id}`);
  return response.data;
};