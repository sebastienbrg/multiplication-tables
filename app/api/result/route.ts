import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma: PrismaClient = new PrismaClient();

async function getSessionAggregationInfo(testSessionId: number) {
    const correctCount = await prisma.result.count({
        where: { testSessionId: testSessionId, correct: true }
    });
    const errorCount = await prisma.result.count({
        where: { testSessionId: testSessionId, correct: false }
    });
    const meanResponseTimeAgg = await prisma.result.aggregate({
        _avg: { responseTime: true },
        where: { testSessionId: testSessionId }
    });
    const meanResponseTime = meanResponseTimeAgg._avg.responseTime || 0;
    return { correctCount, errorCount, meanResponseTime };
}

async function updateTestSession(testSessionId: number,
    correctCount: number, errorCount: number, meanResponseTime: number) {
    return prisma.testSession.update({
        where: { id: testSessionId },
        data: {
            correctCount: correctCount,
            incorrectCount: errorCount,
            meanResponseTime: meanResponseTime
        }
    });

}

// Store a quiz result (POST)
export async function POST(req: NextRequest) {
    try {
        const data = await req.json();
        const { userId, a, b, answer, correct, testSessionId, isLastQuestion, responseTime } = data;



        const result = await prisma.result.create({
            data: {
                userId: userId,
                a,
                b,
                answer: answer !== undefined ? Number(answer) : null,
                correct,
                testSessionId: testSessionId,
                responseTime: responseTime !== undefined ? Number(responseTime) : 9,
            },
        });
        if (isLastQuestion) {
            // Update the test session with the final results
            const { correctCount, errorCount, meanResponseTime } = await getSessionAggregationInfo(testSessionId);
            await updateTestSession(testSessionId, correctCount, errorCount, meanResponseTime);
        }

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
