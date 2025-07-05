import { NextRequest, NextResponse } from 'next/server';

const PASSWORD = process.env.SITE_PASSWORD;
const COOKIE_NAME = 'site_auth';

export function middleware(req: NextRequest) {
    // Allow access to the password page and static files
    if (
        req.nextUrl.pathname.startsWith('/password') ||
        req.nextUrl.pathname.startsWith('/_next') ||
        req.nextUrl.pathname.startsWith('/api') ||
        req.nextUrl.pathname.startsWith('/favicon.ico') ||
        req.nextUrl.pathname.startsWith('/public')
    ) {
        return NextResponse.next();
    }

    const cookie = req.cookies.get(COOKIE_NAME)?.value;
    if (cookie === PASSWORD) {
        return NextResponse.next();
    }

    // Redirect to password page
    const url = req.nextUrl.clone();
    url.pathname = '/password';
    return NextResponse.redirect(url);
}

export const config = {
    matcher: ['/((?!_next|api|favicon.ico|public).*)'],
};
