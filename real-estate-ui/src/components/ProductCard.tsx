import Link from 'next/link';
import { FiMapPin } from 'react-icons/fi';

// API'den gelecek olan veri tipini (Props) belirliyoruz
interface ProductProps {
  productId: number;
  title: string;
  price: number;
  city: string;
  district: string;
  type: string; // Satılık veya Kiralık
  coverImage: string;
}

export default function ProductCard({ product }: { product: ProductProps }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all overflow-hidden group">
      
      {/* Resim Alanı */}
      <div className="relative h-64 overflow-hidden bg-gray-200">
        <img
          // Eğer ilanın resmi yoksa varsayılan (default) şık bir ev resmi göster
          src={product.coverImage || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80'}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {/* Satılık / Kiralık Etiketi */}
        <div className={`absolute top-4 right-4 text-white font-bold px-3 py-1 rounded-lg text-sm shadow-md ${product.type === 'Kiralık' ? 'bg-orange-500' : 'bg-blue-600'}`}>
          {product.type}
        </div>
      </div>

      {/* İçerik Alanı */}
      <div className="p-5">
        <h3 className="text-xl font-bold text-gray-900 mb-2 truncate" title={product.title}>
          {product.title}
        </h3>
        <p className="text-gray-500 text-sm flex items-center gap-1 mb-4">
          <FiMapPin className="text-blue-500" /> {product.city}, {product.district}
        </p>
        
        {/* Fiyat ve Detay Butonu */}
        <div className="flex justify-between items-center border-t border-gray-100 pt-4">
          <span className="text-2xl font-extrabold text-blue-600">
            {/* Parayı Türk Lirası formatında (₺1.500.000,00) yazdırıyoruz */}
            {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(product.price)}
          </span>
          <Link href={`/ilan/${product.productId}`} className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors">
            Detaylar &rarr;
          </Link>
        </div>
      </div>

    </div>
  );
}