import { PrismaClient } from "@prisma/client";
import { StatsData } from "../../../components/StatsData";
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const sessionId = url.searchParams.get("sessionId");

    if (!sessionId) {
        return NextResponse.json({ error: "Invalid session ID" }, { status: 400 });
    }

    try {
        const session = await prisma.testSession.findUnique({
            where: { id: parseInt(sessionId) },
            include: {
                results: true,
            },
        });

        if (!session) {
            return NextResponse.json({ error: "Session not found" }, { status: 404 });
        }

        const statsData: StatsData = {};

        session.results.forEach((result: { a: number; b: number; correct: boolean; responseTime: number; }) => {
            const question = `${result.a}x${result.b}`;
            if (!statsData[question]) {
                statsData[question] = {
                    correct: 0,
                    incorrect: 0,
                    responseTime: 0,
                };
            }

            if (result.correct) {
                statsData[question].correct += 1;
            } else {
                statsData[question].incorrect += 1;
            }

            statsData[question].responseTime += result.responseTime;
        });

        return NextResponse.json({
            sessionInfo: {
                id: session.id,
                createdAt: session.createdAt,
                meanResponseTime: session.meanResponseTime,
                correctCount: session.correctCount,
                incorrectCount: session.incorrectCount,
            },
            statsData,
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}