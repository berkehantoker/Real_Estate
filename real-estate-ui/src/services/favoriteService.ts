import axiosInstance from '../utils/axiosInstance';
import Cookies from 'js-cookie';

export const getMyFavoritesAPI = async () => {
  const response = await axiosInstance.get('/FavoriteProducts/my-favorites');
  return response.data;
};

export const getMyFavoriteIdsAPI = async (): Promise<number[]> => {
  const token = Cookies.get('token');
  if (!token) return []; // Misafir kullanıcılar için boş dizi
  
  try {
    const response = await axiosInstance.get('/FavoriteProducts/my-favorite-ids');
    return response.data || [];
  } catch {
    return [];
  }
};

export const toggleFavoriteAPI = async (productId: number) => {
  const response = await axiosInstance.post('/FavoriteProducts/toggle', { productId });
  return response.data;
};
