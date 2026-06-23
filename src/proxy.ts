import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const pathname = request.nextUrl.pathname;

  // Exclude assets, static files, and API routes from rewrites
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/tenants')
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
    // Only clone URL when internally rewriting path
    const url = request.nextUrl.clone();
    url.pathname = `/tenants/${subdomain}${pathname}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\..*).*)'],
};
