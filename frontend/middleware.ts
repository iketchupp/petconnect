import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { useAuthStore } from '@/stores/auth-store';

const protectedRoutes = [
  // /^\/pets$/, // Matches /pets exactly
  /^\/pets\/\d+/, // Matches /pets/123456789
  /^\/pets\/[^/]+\/.+/, // Matches /pets/123456789/anything
  /^\/user$/, // Matches /user exactly
];

function isProtectedRoute(pathname: string) {
  return protectedRoutes.some((pattern) => pattern.test(pathname));
}

export default async function middleware(request: NextRequest) {
  const cookiesStore = await cookies();
  const sessionToken = cookiesStore.get('session_token');

  if (!sessionToken && isProtectedRoute(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL('/?error=unauthorized', request.url));
  }

  if (sessionToken && isProtectedRoute(request.nextUrl.pathname)) {
    const isLoading = useAuthStore.getState().isLoading;
    let session = useAuthStore.getState().session;

    if (isLoading && !session) {
      await useAuthStore.getState().initialize();
      session = useAuthStore.getState().session;
    }

    if (!session) {
      return NextResponse.redirect(new URL('/?error=unauthorized', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)'],
};
