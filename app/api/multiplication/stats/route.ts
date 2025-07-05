import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma: PrismaClient = new PrismaClient();

// GET /api/multiplication/stats?user=username
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
    // Group by a, b and get correct/total counts
    const stats = await prisma.result.groupBy({
        by: ['a', 'b', 'correct'],
        where: { username },
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
