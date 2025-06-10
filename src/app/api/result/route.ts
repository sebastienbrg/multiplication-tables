import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

let prisma: PrismaClient = new PrismaClient();


// Store a quiz result (POST)
export async function POST(req: NextRequest) {
    try {
        const data = await req.json();
        const { username, a, b, answer, correct } = data;
        if (!username || typeof a !== 'number' || typeof b !== 'number' || typeof correct !== 'boolean') {
            return NextResponse.json({ error: 'Missing or invalid fields' }, { status: 400 });
        }
        const result = await prisma.result.create({
            data: {
                username,
                a,
                b,
                answer: answer !== undefined ? Number(answer) : null,
                correct,
            },
        });
        return NextResponse.json(result);
    } catch (err: any) {
        return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
    }
}
