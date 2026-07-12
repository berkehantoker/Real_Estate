import axiosInstance from '../utils/axiosInstance';

// Login DTO'ya uygun parametreler (Username, Password)
export const loginAPI = async (loginData: any) => {
  const response = await axiosInstance.post('/Auth/Login', loginData);
  // Eğer backend objenin içinde 'token' diye dönüyorsa onu al, yoksa direkt datayı al
  return response.data?.token || response.data; 
};

export const registerUserAPI = async (registerData: any) => {
  const response = await axiosInstance.post('/Auth/Register', registerData);
  return response.data;
};

export const registerAgentAPI = async (registerData: any) => {
  const response = await axiosInstance.post('/Auth/RegisterAgent', registerData);
  return response.data;
};