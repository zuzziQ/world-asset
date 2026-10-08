import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/api/proxy/')) {
    const targetPath = pathname.replace(/^\/api\/proxy/, '');
    const searchParams = request.nextUrl.search;
    
    // Server-side environment variables (không lộ ra client)
    const backendUrl = process.env.CORE_API_URL || process.env.NEXT_PUBLIC_CORE_API_URL || 'https://dev-hub.storymee.com';
    const hubApiKey = process.env.HUB_API_KEY || '';
    
    // Đảm bảo backendUrl được sanitize để có đuôi /api
    const cleanBackendUrl = backendUrl.endsWith('/') ? backendUrl.slice(0, -1) : backendUrl;
    const finalBackendUrl = cleanBackendUrl.endsWith('/api') ? cleanBackendUrl : `${cleanBackendUrl}/api`;
    
    const destinationUrl = `${finalBackendUrl}${targetPath}${searchParams}`;

    // Clone headers và inject API Key bảo mật
    const requestHeaders = new Headers(request.headers);
    if (hubApiKey) {
      requestHeaders.set('Authorization', `Bearer ${hubApiKey}`);
    }

    // Rewrite ngầm tới VPS, client F12 hoàn toàn không thấy domain VPS lẫn API Key
    return NextResponse.rewrite(new URL(destinationUrl), {
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/proxy/:path*'],
};
