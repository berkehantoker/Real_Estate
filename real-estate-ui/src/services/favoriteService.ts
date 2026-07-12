import axiosInstance from '../utils/axiosInstance';

export const getMyFavoritesAPI = async () => {
  const response = await axiosInstance.get('/FavoriteProducts/my-favorites');
  return response.data;
};

export const toggleFavoriteAPI = async (productId: number) => {
  // Backend dto.AppUserId'yi Token'dan kendisi eziyor, biz sadece ProductId gönderiyoruz
  const response = await axiosInstance.post('/FavoriteProducts/toggle', { productId });
  return response.data;
};