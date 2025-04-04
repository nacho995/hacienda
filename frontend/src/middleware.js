import { NextResponse } from 'next/server';

// Ya no necesitamos rutas públicas específicas aquí
// const publicRoutes = ['/admin/login', '/admin/registro'];

export default function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Aplicar lógica solo a rutas /admin
  if (pathname.startsWith('/admin')) {
    console.log(`Middleware: Accediendo a ruta admin: ${pathname}`);
    // Por ahora, permitimos que todas las rutas /admin pasen.
    // La protección real vendrá del AuthContext/Layout en el cliente
    // y de la validación del token JWT en el backend (localhost:5000)
    // cuando se hagan llamadas a la API.
    
    // Comentamos la lógica de cookies:
    /*
    if (publicRoutes.includes(pathname)) {
      return NextResponse.next();
    }
    const adminSessionCookie = request.cookies.get('adminSession');
    if (!adminSessionCookie) {
      const url = new URL('/admin/login', request.url);
      url.searchParams.set('from', pathname);
      return NextResponse.redirect(url);
    }
    try {
      const sessionData = JSON.parse(adminSessionCookie.value);
      const isValid = sessionData && sessionData.email && sessionData.role && sessionData.authenticated === true;
      if (!isValid) throw new Error('Sesión inválida');
      return NextResponse.next();
    } catch (error) {
      console.error('Middleware Error validando sesión:', error);
      const url = new URL('/admin/login', request.url);
      return NextResponse.redirect(url);
    }
    */
    
    // Permitir que la solicitud continúe hacia la página/componente
    return NextResponse.next(); 
  }
  
  // Para rutas no /admin, continuar normalmente
  return NextResponse.next();
}

// El matcher sigue siendo útil para definir a qué rutas se aplica el middleware
export const config = {
  matcher: [
    '/admin/:path*'
  ]
}; 