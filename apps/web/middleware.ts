import { NextResponse } from 'next/server';
import { auth } from '@/auth';

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

/** Redirect target for staff (not /staff/login — that page doesn't exist; use /login) */
const STAFF_LOGIN = '/login';
const CUSTOMER_LOGIN = '/login';

export default auth((req) => {
  const url = req.nextUrl;
  const { pathname } = url;
  const role = ((req.auth?.user as any)?.role ?? '').toLowerCase();
  const forwardedProto = req.headers.get('x-forwarded-proto');
  const isLocalHost = url.hostname === 'localhost' || url.hostname === '127.0.0.1';

  if (process.env.NODE_ENV === 'production' && forwardedProto === 'http' && !isLocalHost) {
    url.protocol = 'https:';
    return NextResponse.redirect(url, 308);
  }

  // ── Staff dashboards ─────────────────────────────────────────────────────
  if (pathname.startsWith('/manager')) {
    if (!req.auth || (role !== 'manager' && role !== 'admin')) {
      return NextResponse.redirect(new URL(STAFF_LOGIN, req.url));
    }
  }

  if (pathname.startsWith('/kitchen')) {
    if (!req.auth || (role !== 'kitchen' && role !== 'manager' && role !== 'admin')) {
      return NextResponse.redirect(new URL(STAFF_LOGIN, req.url));
    }
  }

  if (pathname.startsWith('/waiter')) {
    if (!req.auth || (role !== 'waiter' && role !== 'manager' && role !== 'admin')) {
      return NextResponse.redirect(new URL(STAFF_LOGIN, req.url));
    }
  }

  // ── Authenticated-customer pages ─────────────────────────────────────────
  if (pathname.startsWith('/profile') || pathname.startsWith('/orders')) {
    if (!req.auth) {
      return NextResponse.redirect(
        new URL(`${CUSTOMER_LOGIN}?redirect=${encodeURIComponent(pathname)}`, req.url),
      );
    }
  }

  return NextResponse.next();
});
