import { NextRequest, NextResponse } from 'next/server';

export const config = {
  matcher: [
    /*
     * Match all paths except API routes, static files, and asset optimizations:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, manifest.json, icon.png (PWA/static assets)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|manifest.json|icon.png|offline.html).*)',
  ],
};

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = req.headers.get('host') || '';

  // Allowed root domains for local development and production
  const rootDomains = ['localhost:3000', 'yourapp.com', 'staging.yourapp.com'];
  
  let currentRootDomain = rootDomains.find((domain) => hostname.includes(domain));
  
  if (!currentRootDomain) {
    return NextResponse.next();
  }

  const subdomain = hostname.replace(`.${currentRootDomain}`, '');

  // If there is no subdomain (e.g., accessing yourapp.com directly), let it pass normally
  if (subdomain === hostname || subdomain.trim() === '') {
    return NextResponse.next();
  }

  // Bypass www cleanly
  if (subdomain === 'www') {
    return NextResponse.redirect(new URL(url.pathname, `https://${currentRootDomain}`));
  }

  // Multi-tenant rewrite routing
  // Maps funai.yourapp.com/dashboard internally to apps/web/src/app/schools/funai/dashboard
  const schoolSlug = subdomain.toLowerCase();
  
  const response = NextResponse.rewrite(
    new URL(`/schools/${schoolSlug}${url.pathname}${url.search}`, req.url)
  );

  // Injects x-school-slug header so server components can catch the current school context instantly
  response.headers.set('x-school-slug', schoolSlug);

  return response;
}