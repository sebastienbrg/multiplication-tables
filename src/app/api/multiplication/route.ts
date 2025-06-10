import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

let prisma: PrismaClient = new PrismaClient();

const Session_Size = 20;

// Return a random multiplication for a user
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get('user');
    if (!username) {
        return NextResponse.json({ error: 'Missing user' }, { status: 400 });
    }
    // Retrieve user from DB
    const dbUser = await prisma.user.findUnique({ where: { name: username } });
    if (!dbUser) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const questions = [];
    for (let i = 0; i < Session_Size; i++) {
        // Choose a between minTable and maxTable (inclusive)
        const a = Math.floor(Math.random() * (dbUser.maxTable - dbUser.minTable + 1)) + dbUser.minTable;
        const b = Math.floor(Math.random() * 8) + 2;
        questions.push({ a, b });
    }
    return NextResponse.json({ questions });
}
