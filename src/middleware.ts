import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';

  // Exclude assets, static files, and API routes from rewrites
  if (
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/api') ||
    url.pathname.includes('.') ||
    url.pathname.startsWith('/favicon.ico') ||
    url.pathname.startsWith('/tenants')
  ) {
    return NextResponse.next();
  }

  let subdomain = '';
  const hostnameParts = hostname.split('.');

  // Handle localhost development domains (e.g. test.localhost:3000)
  if (hostname.includes('localhost')) {
    if (hostnameParts.length > 1 && hostnameParts[0] !== 'localhost') {
      subdomain = hostnameParts[0];
    }
  } else {
    // Handle production domains (e.g. tenant.medical.lk)
    if (hostnameParts.length > 2 && hostnameParts[0] !== 'www') {
      subdomain = hostnameParts[0];
    }
  }

  if (subdomain) {
    // Rewrite path internally to tenants sub-directory
    url.pathname = `/tenants/${subdomain}${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
