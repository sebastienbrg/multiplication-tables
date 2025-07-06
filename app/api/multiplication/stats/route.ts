import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma: PrismaClient = new PrismaClient();

// GET /api/multiplication/stats?user=userId
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const userIdParam = searchParams.get('userId');
    if (!userIdParam) {
        return NextResponse.json({ error: 'Missing user id' }, { status: 400 });
    }
    const userId = Number(userIdParam);
    if (isNaN(userId)) {
        return NextResponse.json({ error: 'Invalid user id' }, { status: 400 });
    }
    // Retrieve user from DB
    const dbUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!dbUser) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    // Group by a, b and get correct/total counts
    const stats = await prisma.result.groupBy({
        by: ['a', 'b', 'correct'],
        where: { user: dbUser },
        _count: { _all: true },
    });
    // Format: [{ a, b, total, correct }]
    const operations: { [op: string]: { correct: number, incorrect: number } } = {}
    stats.forEach(s => {
        const count = (s._count as { _all: number })?._all ?? 0;
        if (operations[`${s.a}x${s.b}`] === undefined) {
            operations[`${s.a}x${s.b}`] = { correct: 0, incorrect: 0 };
        }
        if (s.correct) {
            operations[`${s.a}x${s.b}`].correct += count;
        }
        else {
            operations[`${s.a}x${s.b}`].incorrect += count;
        }
    });
    return NextResponse.json({
        minTable: dbUser.minTable,
        maxTable: dbUser.maxTable,
        operations
    });
}
