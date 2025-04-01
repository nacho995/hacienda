import { NextResponse } from 'next/server';

// Rutas que no requieren autenticación
const publicRoutes = ['/admin/login', '/admin/registro'];

export default function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Solo aplicar a rutas que comiencen con /admin
  if (pathname.startsWith('/admin')) {
    // No aplicar protección a rutas públicas
    if (publicRoutes.includes(pathname)) {
      // Permitir acceso a rutas públicas
      return NextResponse.next();
    }
    
    // Verificar si existe sesión de usuario
    const adminSessionCookie = request.cookies.get('adminSession');
    
    // Si no hay sesión, redirigir al login
    if (!adminSessionCookie) {
      const url = new URL('/admin/login', request.url);
      url.searchParams.set('from', pathname);
      return NextResponse.redirect(url);
    }
    
    try {
      // Verificar que la sesión sea válida (podríamos hacer más validaciones)
      const sessionData = JSON.parse(adminSessionCookie.value);
      const isValid = sessionData && 
                     sessionData.email && 
                     sessionData.role && 
                     sessionData.authenticated === true;
      
      if (!isValid) {
        throw new Error('Sesión inválida');
      }
      
      // Si llega aquí, la sesión es válida
      return NextResponse.next();
    } catch (error) {
      console.error('Error validando sesión:', error);
      
      // Si hay algún error en la sesión, redirigir al login
      const url = new URL('/admin/login', request.url);
      return NextResponse.redirect(url);
    }
  }
  
  // Para todas las demás rutas, continuar normalmente
  return NextResponse.next();
}

// Este es el matcher: solo aplicar a rutas específicas
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public directory
     */
    '/admin/:path*'
  ]
}; 