import axiosInstance from '../utils/axiosInstance';

// Tüm Kullanıcıları Getir
export const getAllUsersAPI = async () => {
  const response = await axiosInstance.get('/Users', { params: { PageSize: 1000 } });
  return response.data;
};

// Rol Değiştir / Ata
export const assignRoleAPI = async (data: { userId: number; roleName: string }) => {
  const response = await axiosInstance.post('/Users/assign-role', data);
  return response.data;
};

// Kullanıcı Sil
export const deleteUserAPI = async (id: number) => {
  const response = await axiosInstance.delete(`/Users/${id}`);
  return response.data;
};