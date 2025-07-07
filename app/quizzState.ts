export type QuizState = {
    questions: { a: number; b: number }[];
    currentQuestionIndex: number;
    errorCount: number;
    correctCount: number;
    perfectCount: number;
    answer: string;
    showResult: boolean;
    correct: boolean;
    timedOut: boolean;
    responseTime: number;
    readyForNext: boolean;
    testSessionId: number
    score: number;
};
