import axiosInstance from '../utils/axiosInstance';

// Adminin tüm mesajları çekmesi için (GET /api/Contacts)
export const getAllContactsAPI = async () => {
  const response = await axiosInstance.get('/Contacts', { params: { PageSize: 1000 } });
  return response.data;
};

// Ziyaretçilerin siteden mesaj göndermesi için (POST /api/Contacts)
// Bunu daha sonra vitrin kısmında (Public İletişim sayfasında) kullanacağız
export const createContactAPI = async (data: { name: string; email: string; subject: string; message: string }) => {
  const response = await axiosInstance.post('/Contacts', data);
  return response.data;
};

// Adminin mesajı silmesi için (DELETE /api/Contacts/{id})
export const deleteContactAPI = async (id: number) => {
  const response = await axiosInstance.delete(`/Contacts/${id}`);
  return response.data;
};