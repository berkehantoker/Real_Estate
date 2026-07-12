import axiosInstance from '../utils/axiosInstance';

// Tüm referansları listele (anonim erişim)
export const getAllTestimonialsAPI = async () => {
  const response = await axiosInstance.get('/Testimonials');
  return response.data?.$values || response.data || [];
};

// Referans ekle (Admin)
export const createTestimonialAPI = async (data: { nameSurname: string; title: string; comment: string; status: boolean }) => {
  const response = await axiosInstance.post('/Testimonials', data);
  return response.data;
};

// Referans güncelle (Admin)
export const updateTestimonialAPI = async (data: { testimonialId: number; nameSurname: string; title: string; comment: string; status: boolean }) => {
  const response = await axiosInstance.put('/Testimonials', data);
  return response.data;
};

// Referans sil (Admin)
export const deleteTestimonialAPI = async (id: number) => {
  const response = await axiosInstance.delete(`/Testimonials/${id}`);
  return response.data;
};