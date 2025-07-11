import { PrismaClient, User } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma: PrismaClient = new PrismaClient();

const Session_Size = 16;
const AddingNice = 4; //questions to add if not enough
const MemoryLen = 14; //days


async function getSessionOperationsForUser(user: User) {
    const userId: number = user.id;
    const results: { a: number, b: number, responseTime: number }[] = await prisma.$queryRaw`
  SELECT DISTINCT ON (r.a, r.b) r.a, r.b, r."responseTime"
  FROM "Result" r
  WHERE r."userId" = ${userId}
  ORDER BY r.a, r.b, r.id DESC
`
    const easyResults = [];
    const hardResults = [];
    const workingOnResults = [];
    const maxSeen: { a: number, b: number } = { a: 2, b: 1 };
    for (const result of results) {
        const responseTime = result.responseTime || user.maxResponseTime;
        if (responseTime <= user.targetResponseTime + 1.01) {
            easyResults.push({ a: result.a, b: result.b, responseTime });
        } else if (responseTime >= Math.min(user.maxResponseTime, user.targetResponseTime * 1.5)) {
            hardResults.push({ a: result.a, b: result.b, responseTime });
        } else {
            workingOnResults.push({ a: result.a, b: result.b, responseTime });
        }
        if (result.a > maxSeen.a) {
            maxSeen.a = result.a;
            maxSeen.b = result.b;
        } else if (result.a === maxSeen.a && result.b > maxSeen.b) {
            maxSeen.b = result.b;
        }
    }
    const availableEasy = easyResults.length;
    const hardsToAdd = Math.max(0, Session_Size - AddingNice);

    const selection = [];
    if (availableEasy > 0) {
        const randomEasys = easyResults.sort(() => Math.random() - 0.5).slice(0, Math.min(AddingNice, availableEasy));
        selection.push(...randomEasys);
    }
    if (hardsToAdd > 0) {
        const randomHards = hardResults.sort(() => Math.random() - 0.5).slice(0, hardsToAdd);
        selection.push(...randomHards);
    }
    const workingOnToAdd = Math.max(0, Session_Size - selection.length);
    if (workingOnToAdd > 0) {
        const randomWorkingOn = workingOnResults.sort(() => Math.random() - 0.5).slice(0, workingOnToAdd);
        selection.push(...randomWorkingOn);
    }
    if (selection.length < Session_Size) {
        if (maxSeen.b === 9) {
            maxSeen.b = 1;
            maxSeen.a += 1;
        }
        for (let a = maxSeen.a; a <= user.maxTable; a++) {
            for (let b = 2; b <= 9; b++) {
                if (a === maxSeen.a && b <= maxSeen.b) continue;
                const key = a * 100 + b; // Unique key for each multiplication
                if (!selection.some(q => q.a * 100 + q.b === key)) {
                    selection.push({ a, b, responseTime: user.maxResponseTime });
                }
                if (selection.length >= Session_Size) {
                    break;
                }
            }
            if (selection.length >= Session_Size) {
                break;
            }
        }
    }
    if (selection.length < Session_Size) {
        const randomEasys = easyResults.sort(() => Math.random() - 0.5).slice(0, Session_Size - selection.length);
        selection.push(...randomEasys);
    }
    // Shuffle the selection
    selection.sort(() => Math.random() - 0.5);
    // Limit to Session_Size
    console.log({
        easyResults,
        hardResults,
        workingOnResults,
        maxSeen,
        selectionBeforeLimit: selection,
        availableEasy,
        hardsToAdd,
        workingOnToAdd,
        Session_Size,
        AddingNice,
        MemoryLen,
        user
    });
    return selection.slice(0, Session_Size);
}

// Return a random multiplication for a user
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
    // Create a new test session
    const testSession = await prisma.testSession.create({ data: { userId: dbUser.id, } });
    const questions: { a: number, b: number }[] = await getSessionOperationsForUser(dbUser)

    return NextResponse.json({ questions: questions.slice(0, Session_Size), testSessionId: testSession.id }, { status: 200 });
};
