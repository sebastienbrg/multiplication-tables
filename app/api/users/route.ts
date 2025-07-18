import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma: PrismaClient = new PrismaClient();

// List all users
export async function GET() {
    try {
        const users = await prisma.user.findMany();
        return NextResponse.json({ users });
    } catch (err: unknown) {
        let message = 'Internal server error';
        if (err instanceof Error) message = err.message;
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

// Create a new user
export async function POST(req: NextRequest) {
    try {
        const data = await req.json();
        const { name } = data;
        if (!name) {
            return NextResponse.json({ error: 'Missing or invalid fields' }, { status: 400 });
        }
        let { minTable, maxTable } = data;
        if (typeof minTable !== 'number' || typeof maxTable !== 'number' || minTable < 2 || maxTable > 9 || minTable > maxTable) {
            minTable = 2;
            maxTable = 9;
        }
        const user = await prisma.user.create({
            data: { name, minTable, maxTable },
        });
        return NextResponse.json(user);
    } catch (err: unknown) {
        let message = 'Internal server error';
        if (err instanceof Error) message = err.message;
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

// Delete a user
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
        await prisma.user.delete({ where: { id: userId } });
        return NextResponse.json({ success: true });
    } catch (err: unknown) {
        let message = 'Internal server error';
        if (err instanceof Error) message = err.message;
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

// Update a user's minTable and maxTable
export async function PUT(req: NextRequest) {
    try {
        const data = await req.json();
        const { name, minTable, maxTable, maxResponseTime, password, targetResponseTime } = data;
        if (!name || typeof minTable !== 'number' || typeof maxTable !== 'number') {
            return NextResponse.json({ error: 'Missing or invalid fields' }, { status: 400 });
        }
        const user = await prisma.user.update({
            where: { name },
            data: { minTable, maxTable, maxResponseTime, password, targetResponseTime },
        });
        return NextResponse.json(user);
    } catch (err: unknown) {
        let message = 'Internal server error';
        if (err instanceof Error) message = err.message;
        return NextResponse.json({ error: message }, { status: 500 });
    }
}