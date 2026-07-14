import axiosInstance from '../utils/axiosInstance';

// ============================================================================
// 1. İLAN GÖRÜNTÜLEME VE LİSTELEME İŞLEMLERİ
// ============================================================================

// Tekil İlan Detayını Getirme (Müşteri Vitrini ve Güncelleme İçin)
export const getProductWithDetailsAPI = async (id: number) => {
  const response = await axiosInstance.get(`/Products/GetProductWithDetails/${id}`);
  return response.data;
};

// Standart İlan Listesi
export const getAllProductsAPI = async () => {
  const response = await axiosInstance.get('/Products');
  return response.data?.items || response.data?.$values || response.data || [];
};

// Admin İçin Detaylı Tüm İlanlar Listesi (Kategori ve Kullanıcı bilgisiyle)
export const getAllProductsWithDetailsAPI = async () => {
  const response = await axiosInstance.get('/Products', { params: { PageSize: 1000 } }); 
  return response.data?.items || response.data?.$values || response.data || [];
};

// Emlakçının Sadece Kendi İlanlarını Getirmesi
export const getMyProductsAPI = async (userId: number) => {
  const response = await axiosInstance.get('/Products', { params: { AppUserId: userId, PageSize: 1000 } });
  return response.data?.items || response.data?.$values || response.data || [];
};

// Filtreli/Aramalı İlan Listesi (Vitrin İçin)
export const getProductsAPI = async (filters: any = {}) => {
  // C#'ın anlayacağı formata (amenities=1&amenities=2) çeviriyoruz
  let queryParams = new URLSearchParams();
  
  Object.keys(filters).forEach(key => {
    if (Array.isArray(filters[key])) {
      filters[key].forEach((val: any) => queryParams.append(key, val));
    } else if (filters[key] !== '' && filters[key] !== null && filters[key] !== undefined) {
      queryParams.append(key, filters[key]);
    }
  });

  const response = await axiosInstance.get(`/Products?${queryParams.toString()}`);
  return response.data;
};

// ============================================================================
// 2. İLAN YÖNETİMİ (EKLEME / GÜNCELLEME / SİLME)
// ============================================================================

// İlan Silme İşlemi
export const deleteProductAPI = async (id: number) => {
  const response = await axiosInstance.delete(`/Products/${id}`);
  return response.data;
};

// İlan Güncelleme (Ana Bilgiler)
export const updateProductAPI = async (updateData: any) => {
  const response = await axiosInstance.put('/Products', updateData);
  return response.data;
};

// ============================================================================
// 3. İLAN EKLEME SİHİRBAZI (WIZARD) İŞLEMLERİ
// ============================================================================

export const createProductDraftAPI = async (productData: any) => {
  const response = await axiosInstance.post('/Products/create-draft', productData);
  return response.data;
};

export const addProductDetailAPI = async (detailData: any) => {
  const response = await axiosInstance.post('/Products/add-detail', detailData);
  return response.data;
};

export const addProductImagesAPI = async (imagesData: any) => {
  const response = await axiosInstance.post('/Products/add-images', imagesData);
  return response.data;
};

export const publishProductAPI = async (productId: number) => {
  const response = await axiosInstance.put(`/Products/publish/${productId}`);
  return response.data;
};

// ============================================================================
// 4. FİZİKSEL DOSYA YÜKLEME İŞLEMİ (IMAGES CONTROLLER)
// ============================================================================

export const uploadImageAPI = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file); // Backend'deki "IFormFile file" adı

  const response = await axiosInstance.post('/Images/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data; // Örn: { url: "/images/xyz.jpg" } döner
};

// Galeri resmi silme (Admin/Emlakçı)
export const deleteProductImageAPI = async (imageId: number) => {
  const response = await axiosInstance.delete(`/Images/${imageId}`);
  return response.data;
};

// ============================================================================
// 5. İLAN ÖZELLİKLERİ (AMENITIES) İŞLEMLERİ
// ============================================================================

export const getProductAmenitiesAPI = async (productId: number) => {
  const response = await axiosInstance.get(`/ProductAmenities/product/${productId}`);
  return response.data?.$values || response.data || [];
};

export const updateProductAmenityAPI = async (dto: any) => {
  const response = await axiosInstance.put('/ProductAmenities', dto);
  return response.data;
};

export const updateProductAmenitiesAPI = async (data: { productId: number, amenityIds: number[] }) => {
  const response = await axiosInstance.post('/Products/add-amenities', data);
  return response.data;
};