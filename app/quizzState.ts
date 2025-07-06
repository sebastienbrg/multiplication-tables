export type QuizState = {
    questions: { a: number; b: number }[];
    currentQuestionIndex: number;
    errorCount: number;
    correctCount: number;
    perfectCount: number;
    answer: string;
    showResult: boolean;
    correct: boolean;
    timer: number;
    resultSent: boolean;
    readyForNext: boolean;
    running: boolean;
    testSessionId: number
};
