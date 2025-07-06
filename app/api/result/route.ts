import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma: PrismaClient = new PrismaClient();


// Store a quiz result (POST)
export async function POST(req: NextRequest) {
    try {
        const data = await req.json();
        const { userId, a, b, answer, correct, testSessionId } = data;

        const result = await prisma.result.create({
            data: {
                userId: userId,
                a,
                b,
                answer: answer !== undefined ? Number(answer) : null,
                correct,
                testSessionId: testSessionId,
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
        const userIdParam = searchParams.get('userId');
        if (!userIdParam) {
            return NextResponse.json({ error: 'Missing user name' }, { status: 400 });
        }
        const userId = Number(userIdParam);
        if (isNaN(userId)) {
            return NextResponse.json({ error: 'Invalid user id' }, { status: 400 });
        }
        await prisma.result.deleteMany({ where: { userId: userId } });
        return NextResponse.json({ success: true });
    } catch (err: unknown) {
        let message = 'Internal server error';
        if (err instanceof Error) message = err.message;
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
