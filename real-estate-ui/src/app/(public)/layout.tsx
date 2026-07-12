import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import NotificationProvider from '@/components/NotificationProvider';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <NotificationProvider />
      <Navbar />
      
      <main className="flex-grow">{children}</main>

      <Footer />
    </div>
  );
}
