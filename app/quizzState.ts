export type QuizState = {
    step: "quiz" | "select-user";
    user: string | null;
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
};
