import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma: PrismaClient = new PrismaClient();


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
    }
    catch (err: unknown) {
        let message = 'Internal server error';
        if (err instanceof Error) {
            message = err.message;
        }
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

// Delete all results for a user
export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const name = searchParams.get('name');
        if (!name) {
            return NextResponse.json({ error: 'Missing user name' }, { status: 400 });
        }
        await prisma.result.deleteMany({ where: { username: name } });
        return NextResponse.json({ success: true });
    } catch (err: unknown) {
        let message = 'Internal server error';
        if (err instanceof Error) message = err.message;
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
