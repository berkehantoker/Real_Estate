import axiosInstance from '../utils/axiosInstance';

// İlana ait tüm mesajları getir
export const getChatMessagesAPI = async (productId: number) => {
  const response = await axiosInstance.get(`/Chat/${productId}`);
  return response.data;
};

// Yeni mesaj gönder
export const sendChatMessageAPI = async (data: {
  senderId: number;
  receiverId: number;
  productId: number;
  message: string;
}) => {
  const response = await axiosInstance.post('/Chat', data);
  return response.data;
};