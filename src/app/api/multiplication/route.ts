import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma: PrismaClient = new PrismaClient();

const Session_Size = 20;
const AddingNice = 5; //questions to add if not enough
const MemoryLen = 7; //days

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
    const questions: { a: number, b: number, sortKey?: number }[] = [];


    // Grab all results for this user
    return prisma.result.groupBy({
        by: ['a', 'b', 'correct'],
        where: { username: dbUser.name, createdAt: { gte: new Date(Date.now() - 24 * MemoryLen * 60 * 60 * 1000) } },
        _count: { correct: true },

    }).then(results => {
        console.log(`Found ${results.length} results for user ${dbUser.name}`);
        const resultMap = new Map<number, { correctCount: number, errorCount: number }>();
        for (const result of results) {
            const key = result.a * 100 + result.b; // Unique key for each multiplication
            if (!resultMap.has(key)) {
                resultMap.set(key, { correctCount: 0, errorCount: 0 });
            }
            const entry = resultMap.get(key);
            if (!entry) continue; // Should not happen, but just in case
            if (result.correct) {
                entry.correctCount += result._count.correct;
            } else {
                entry.errorCount += result._count.correct;
            }
        }
        const potentialNice: { a: number, b: number, sortKey?: number }[] = [];
        for (let a = dbUser.minTable; a <= dbUser.maxTable; a++) {
            for (let b = 2; b <= 9; b++) {
                const key = a * 100 + b; // Unique key for each multiplication
                const entry = resultMap.get(key);
                if (!entry || (entry.errorCount >= entry.correctCount)) {
                    // If no results or more errors than correct, add to questions
                    questions.push({ a, b, sortKey: Math.random() });
                } else {
                    potentialNice.push({ a, b, sortKey: Math.random() });
                }
                if (questions.length >= Session_Size) {
                    // If we already have enough questions, stop
                    break;
                }
            }
            if (questions.length >= Session_Size) {
                // If we already have enough questions, stop
                break;
            }
        }


        // sort potentialNice by sortKey
        potentialNice.sort((q1, q2) => {
            if (q1.sortKey && q2.sortKey) {
                return q1.sortKey - q2.sortKey;
            }
            return 0; // If sortKey is not defined, keep original order
        });

        // Add some nice questions        
        const needed = Math.max(Session_Size - questions.length, AddingNice);
        for (let i = 0; i < needed && i < potentialNice.length; i++) {
            questions.push(potentialNice[i]);
        }
        // randomize the questions
        questions.sort((q1, q2) => {
            if (q1.sortKey && q2.sortKey) {
                return q1.sortKey - q2.sortKey;
            }
            return 0; // If sortKey is not defined, keep original order
        });

        questions.forEach(q => {
            delete q.sortKey; // Remove sortKey before returning    
        }
        );
        return NextResponse.json({ questions: questions.slice(0, Session_Size) }, { status: 200 });
    });



}
