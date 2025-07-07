
export type Stat = {
    correct: number;
    incorrect: number;
    responseTime: number; // Optional, if you want to track response time
};

export type StatsData = {
    [question: string]: Stat; // e.g. "3x4": { correct: 2, incorrect: 1, responseTime: 5 }
};
