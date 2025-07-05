import { NextRequest, NextResponse } from 'next/server';

export default function middleware(req: NextRequest) {
    console.log("Middleware triggered for:", req.nextUrl.pathname);
    return NextResponse.redirect(new URL('/password', req.url));
}

export const config = {
    matcher: ['/'],
};
