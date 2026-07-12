import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // KURAL 1: Panele girmeye çalışıyor ama Token yoksa login'e at
  if (pathname.startsWith('/panel') && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // KURAL 2: Panele girmeye çalışıyor ve Token'ı VARSA, Rolüne bak!
  if (pathname.startsWith('/panel') && token) {
    try {
      // Token'ı manuel çözümlüyoruz
      const payload = JSON.parse(atob(token.split('.')[1]));
      const role = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

      // Rolü Müşteri (User) ise panelde işi yok, Ana Sayfaya postala!
      if (role === 'User') {
        return NextResponse.redirect(new URL('/', request.url));
      }
    } catch (error) {
      // Token bozuksa login'e at
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // KURAL 3: Zaten giriş yapmışsa (Token varsa) Login ve Register sayfalarını görmesin
  if ((pathname.startsWith('/login') || pathname.startsWith('/register')) && token) {
     return NextResponse.redirect(new URL('/panel', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/panel/:path*', '/login', '/register'],
};