import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
	const pathname = request.nextUrl.pathname;

	if (pathname === '/' || pathname === '') {
		return NextResponse.redirect(new URL('/admin/posts', request.url));
	}

	if (pathname === '/admin' || pathname === '/admin/') {
		return NextResponse.redirect(new URL('/admin/posts', request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: ['/admin/:path*'],
};
