import { create } from 'zustand';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';

interface AuthState {
  isAuthenticated: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null;
  unreadMessageCount: number;
  setUnreadMessageCount: (count: number) => void;
  incrementUnread: () => void;
  login: (token: string) => void;
  logout: () => void;
  checkAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  unreadMessageCount: 0,
  setUnreadMessageCount: (count: number) => set({ unreadMessageCount: count }),
  incrementUnread: () => set((state) => ({ unreadMessageCount: state.unreadMessageCount + 1 })),

  // Login olunca çalışacak fonksiyon
  login: (token: string) => {
    Cookies.set('token', token, { expires: 1 }); 
    
    try {
      const decoded: any = jwtDecode(token);
      
      // .NET'in uzun Claim isimlerini yakalıyoruz
      const role = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
      const name = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'];
      const email = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'];
      const id = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];

      set({
        isAuthenticated: true,
        user: { id, name, email, role }
      });
    } catch (error) {
      set({ isAuthenticated: false, user: null });
    }
  },

  logout: () => {
    Cookies.remove('token');
    set({ isAuthenticated: false, user: null, unreadMessageCount: 0 });
    if (typeof window !== 'undefined') {
        window.location.href = '/'; 
    }
  },

  // Sayfa yenilendiğinde hafızayı tekrar doldurmak için
  checkAuth: () => {
    const token = Cookies.get('token');
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        const role = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
        const name = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'];
        const email = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'];
        const id = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];

        set({
          isAuthenticated: true,
          user: { id, name, email, role }
        });
      } catch (error) {
        Cookies.remove('token');
        set({ isAuthenticated: false, user: null });
      }
    }
  }
}));