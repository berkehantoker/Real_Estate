import axiosInstance from '../utils/axiosInstance';

export const getAgentDetailAPI = async (userId: number) => {
  try {
    const response = await axiosInstance.get(`/AgentDetails/${userId}`);
    return response.data;
  } catch (error: any) {
    // Profil henüz oluşturulmamışsa (404) null dönüyoruz
    if (error.response && error.response.status === 404) {
      return null;
    }
    throw error;
  }
};

export const createAgentDetailAPI = async (data: any) => {
  const response = await axiosInstance.post('/AgentDetails', data);
  return response.data;
};

export const updateAgentDetailAPI = async (data: any) => {
  const response = await axiosInstance.put('/AgentDetails', data);
  return response.data;
};