import { NextRequest, NextResponse } from 'next/server';

const PASSWORD = process.env.SITE_PASSWORD || 'letmein';
const COOKIE_NAME = 'site_auth';

export async function POST(req: NextRequest) {
    const { password } = await req.json();
    if (password === PASSWORD) {
        const res = NextResponse.json({ success: true });
        res.cookies.set(COOKIE_NAME, PASSWORD, {
            httpOnly: true,
            path: '/',
            maxAge: 60 * 60 * 24 * 365, // 1 year
        });
        return res;
    }
    return NextResponse.json({ error: 'Mot de passe incorrect' }, { status: 401 });
}
