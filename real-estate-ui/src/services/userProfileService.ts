import axiosInstance from '../utils/axiosInstance';

export const getMyProfileAPI = async () => {
  const response = await axiosInstance.get('/UserProfiles');
  return response.data;
};

export const updateMyProfileAPI = async (data: {
  userName: string;
  email: string;
  phoneNumber: string;
  currentPassword?: string;
  newPassword?: string;
}) => {
  const response = await axiosInstance.put('/UserProfiles', data);
  return response.data;
};