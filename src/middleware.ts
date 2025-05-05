import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');

  // Define different CSP rules for development and production
  const isDev = process.env.NODE_ENV === 'development';
  
  const cspHeader = `
    default-src 'self';
    script-src 'self' ${isDev ? "'unsafe-eval'" : ""} 'unsafe-inline' https://*.googletagmanager.com https://www.google-analytics.com https://maps.googleapis.com;
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: https://*.google-analytics.com https://*.googletagmanager.com;
    connect-src 'self' ${isDev ? "* 'unsafe-eval'" : ""} https://*.google-analytics.com https://www.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com;
    font-src 'self';
    object-src 'none';
    frame-src 'self' https://buymeacoffee.com;
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    block-all-mixed-content;
    ${!isDev ? 'upgrade-insecure-requests;' : ''}
`.replace(/\s{2,}/g, ' ').trim();

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);

  // Only set CSP header in production
  if (!isDev) {
    requestHeaders.set('Content-Security-Policy', cspHeader);
  } else {
    // In development, use Content-Security-Policy-Report-Only to debug issues
    requestHeaders.set('Content-Security-Policy-Report-Only', cspHeader);
  }

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Set security headers
  if (!isDev) {
    response.headers.set('Content-Security-Policy', cspHeader);
  } else {
    response.headers.set('Content-Security-Policy-Report-Only', cspHeader);
  }
   
  // Get existing cookies
  // const cookies = request.cookies;
   
  // Preserve existing cookies with new security attributes
  // cookies.getAll().forEach(cookie => {
  //   response.cookies.set({
  //     name: cookie.name,
  //     value: cookie.value,
  //     httpOnly: true,
  //     secure: true,
  //     sameSite: 'lax'
  //   });
  // });

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    {
      source: '/((?!api|_next/static|_next/image|favicon.ico|public/).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
}; 