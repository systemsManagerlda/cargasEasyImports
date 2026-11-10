// middleware.ts
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    const isAuth = !!token;

    console.log('🔐 Middleware:', path, '| autenticado:', isAuth);

    // Páginas públicas (não requerem autenticação)
    const publicPaths = ['/login', '/register', '/recuperar-senha'];
    const isPublicPath = publicPaths.some(p => path === p || path.startsWith(p));

    // Usuário autenticado tentando acessar página pública (login/register)
    if (isPublicPath && isAuth) {
      // Verificar se é uma requisição para registro com parâmetros
      if (path === '/register' && req.nextUrl.searchParams.has('perfil')) {
        // Permitir acesso ao registro mesmo estando autenticado
        // para criar novos transportadores, clientes, etc.
        return NextResponse.next();
      }
      
      console.log('🔐 Usuário autenticado → dashboard');
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // Usuário não autenticado tentando acessar área protegida
    if (!isAuth && !isPublicPath) {
      console.log('🔐 Usuário não autenticado → login');
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('from', path);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: () => true,
    },
  }
);

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/cargas/:path*',
    '/cargas/nova',
    '/transportadores/:path*',
    '/clientes/:path*',
    '/alertas/:path*',
    '/relatorios/:path*',
    '/configuracoes/:path*',
    '/login',
    '/register',
    '/recuperar-senha',
  ],
};