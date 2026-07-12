// OpenStreetMap Nominatim API ile adresi koordinata çevirir.
export async function geocodeAddress(
  city: string,
  district: string,
  neighborhood: string
): Promise<{ lat: number; lng: number } | null> {
  const query = encodeURIComponent(`${neighborhood}, ${district}, ${city}, Turkey`);
  const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`;

  try {
    const response = await fetch(url, {
      headers: {
        'Accept-Language': 'tr',
        'User-Agent': 'RealEstateApp/1.0',
      },
    });
    const data = await response.json();

    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
      };
    }
    return null;
  } catch (error) {
    console.error('Geocode hatası:', error);
    return null;
  }
}