import Sidebar from '@/components/Sidebar';
import NotificationProvider from '@/components/NotificationProvider';

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <NotificationProvider />
      
      {/* Sol Menü (Sidebar) */}
      <Sidebar />

      {/* Sağ Ana İçerik Alanı */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* Üst Bilgi Çubuğu (Top Bar) */}
        <header className="h-16 bg-white shadow-sm border-b border-gray-200 flex items-center px-8">
          <h1 className="text-xl font-semibold text-gray-800">Kontrol Paneli</h1>
        </header>

        {/* Sayfaların içeriğinin geleceği asıl yer */}
        <div className="flex-1 overflow-auto p-8">
          {children}
        </div>
      </main>

    </div>
  );
}