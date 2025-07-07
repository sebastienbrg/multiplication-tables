"use client";
import { User } from "../appState";

export function getScorePointsForAnswer(user: User | null, responseTime: number, correct: boolean): number {
    if (!user || !correct) return 0;
    const maxResponseTime = user.maxResponseTime;
    const scoreBonus = maxResponseTime - responseTime + 2;
    return Math.max(0, scoreBonus);
}
