import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect Admin Pages and Admin API Routes
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      if (pathname.startsWith('/api/admin')) {
        return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
      }
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid token structure');
      }

      // Base64URL decode payload in edge-safe manner
      const base64Payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const decodedJson = atob(base64Payload);
      const payload = JSON.parse(decodedJson);

      // Verify expiration and admin role
      const isExpired = payload.exp && payload.exp * 1000 < Date.now();
      const isAdmin = payload.role === 'admin';

      if (isExpired || !isAdmin) {
        if (pathname.startsWith('/api/admin')) {
          return NextResponse.json({ error: 'Forbidden: Administrator privileges required' }, { status: 403 });
        }
        const loginUrl = new URL('/auth/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
      }
    } catch (e) {
      if (pathname.startsWith('/api/admin')) {
        return NextResponse.json({ error: 'Unauthorized: Invalid authentication session' }, { status: 401 });
      }
      const loginUrl = new URL('/auth/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
  ],
};
