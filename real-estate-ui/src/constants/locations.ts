// Tüm Türkiye il-ilçe-mahalle verisi public/data klasöründen fetch edilir.
// Veri yapısı: { "İl": { "İlçe": ["Mahalle1", "Mahalle2", ...] } }

export interface LocationData {
  [city: string]: {
    [district: string]: string[];
  };
}

let cachedData: LocationData | null = null;

async function loadLocationData(): Promise<LocationData> {
  if (cachedData) return cachedData;
  const response = await fetch('/data/turkiye-il-ilce-mahalle-koy.json');
  cachedData = await response.json();
  return cachedData!;
}

// 81 ili sıralı döndürür
export async function getCities(): Promise<string[]> {
  const data = await loadLocationData();
  return Object.keys(data).sort((a, b) => a.localeCompare(b, 'tr'));
}

// Seçilen ile bağlı ilçeleri sıralı döndürür
export async function getDistrictsByCity(cityName: string): Promise<string[]> {
  const data = await loadLocationData();
  const city = data[cityName];
  if (!city) return [];
  return Object.keys(city).sort((a, b) => a.localeCompare(b, 'tr'));
}

// Seçilen il ve ilçeye bağlı mahalleleri sıralı döndürür
export async function getNeighborhoodsByDistrict(cityName: string, districtName: string): Promise<string[]> {
  const data = await loadLocationData();
  const city = data[cityName];
  if (!city) return [];
  const neighborhoods = city[districtName];
  if (!neighborhoods) return [];
  return [...neighborhoods].sort((a, b) => a.localeCompare(b, 'tr'));
}