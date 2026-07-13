import axiosInstance from '../utils/axiosInstance';

// İlana ve kişiye ait mesaj geçmişini getir
export const getChatMessagesAPI = async (productId: number, otherUserId: number) => {
  const response = await axiosInstance.get(`/Chat/${productId}/${otherUserId}`);
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

// Tekil mesaj sil (Herkes için sil)
export const deleteChatMessageAPI = async (chatMessageId: number) => {
  const response = await axiosInstance.delete(`/Chat/message/${chatMessageId}`);
  return response.data;
};

// Komple sohbeti temizle (Sadece benden sil)
export const deleteConversationAPI = async (productId: number, otherUserId: number) => {
  const response = await axiosInstance.delete(`/Chat/conversation/${productId}/${otherUserId}`);
  return response.data;
};

// Mesajları veritabanında kalıcı olarak okundu işaretle
export const markChatAsReadAPI = async (productId: number, otherUserId: number) => {
  const response = await axiosInstance.post(`/Chat/mark-as-read/${productId}/${otherUserId}`);
  return response.data;
};
