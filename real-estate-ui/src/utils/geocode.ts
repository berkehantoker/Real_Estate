// OpenStreetMap Nominatim API ile adresi koordinata çevirir.
export async function geocodeAddress(
  city: string,
  district: string,
  neighborhood: string
): Promise<{ lat: number; lng: number } | null> {
  // Gelen mahalle adının sonunda zaten "Mahallesi" veya "Mah." yoksa biz ekleyelim
  let cleanNeighborhood = neighborhood.trim();
  if (!cleanNeighborhood.toLowerCase().includes('mahallesi') && !cleanNeighborhood.toLowerCase().includes('mah.')) {
    cleanNeighborhood = `${cleanNeighborhood} Mahallesi`;
  }

  // Arama sorgusunu daha net hale getirelim (Örn: Caferağa Mahallesi, Kadıköy, İstanbul, Türkiye)
  const searchQuery = `${cleanNeighborhood}, ${district.trim()}, ${city.trim()}, Türkiye`;
  const query = encodeURIComponent(searchQuery);
  const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`;

  try {
    const response = await fetch(url, {
      headers: {
        'Accept-Language': 'tr',
        'User-Agent': 'RealEstateAppCustom/1.0 (iletisim@domain.com)', // Nominatim bot korumasını aşmak için e-posta tarzı bir string iyidir
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP hata kodu: ${response.status}`);
    }

    const data = await response.json();

    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
      };
    }

    // EĞER MAHALLE İLE BULAMAZSA: Aramayı esnetip sadece İlçe ve İl ile şansımızı deneyelim (Böylece harita tamamen donmaz)
    console.warn("Mahalle ile sonuç bulunamadı, ilçe bazlı aranıyor...");
    const fallbackQuery = encodeURIComponent(`${district.trim()}, ${city.trim()}, Türkiye`);
    const fallbackUrl = `https://nominatim.openstreetmap.org/search?q=${fallbackQuery}&format=json&limit=1`;
    const fallbackResponse = await fetch(fallbackUrl, { headers: { 'Accept-Language': 'tr', 'User-Agent': 'RealEstateAppCustom/1.0' } });
    const fallbackData = await fallbackResponse.json();

    if (fallbackData && fallbackData.length > 0) {
      return {
        lat: parseFloat(fallbackData[0].lat),
        lng: parseFloat(fallbackData[0].lon),
      };
    }

    return null;
  } catch (error) {
    console.error('Geocode hatası:', error);
    return null;
  }
}
