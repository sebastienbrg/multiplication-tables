import React from "react";

interface ResultPhaseProps {
    correct: boolean;
    answer: string;
    a: number;
    b: number;
    timer: number;
    TimeToRespond: number;
    PerfectResponseTime: number;
    perfectCount: number;
    correctCount: number;
    errorCount: number;
    currentQuestionIndex: number;
    totalQuestions: number;
    onNext: () => void;
    onFinish: () => void;
}

const ResultPhase: React.FC<ResultPhaseProps> = ({
    correct, answer, a, b, timer, TimeToRespond, PerfectResponseTime, perfectCount, correctCount, errorCount, currentQuestionIndex, totalQuestions, onNext, onFinish
}) => (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8">
        {/* Session widget */}
        <div className="fixed top-4 right-4 bg-white/80 shadow px-4 py-2 rounded-lg border text-sm flex flex-col items-end">
            <div>Question: <b>{currentQuestionIndex + 1}</b> / {totalQuestions}</div>
            <div>Perfect : <b>{perfectCount}</b></div>
            <div>Correct : <b>{correctCount}</b></div>
            <div>Erreurs: <b>{errorCount}</b></div>
        </div>
        <div className="text-4xl font-bold mb-4">{a} × {b} = {a * b}</div>
        <div className="text-2xl mt-4">
            {correct ? (
                <span className="text-green-600 font-bold">{(timer > (TimeToRespond - PerfectResponseTime)) ? "Perfect" : "Correct"}!</span>
            ) : (
                <span className="text-red-600 font-bold">
                    {answer !== '' && Number(answer) !== a * b
                        ? 'Erreur !'
                        : `Trop tard ! `}
                </span>
            )}
        </div>
        {currentQuestionIndex < (totalQuestions - 1) ? (
            <button
                className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg text-lg hover:bg-blue-700 transition"
                onClick={onNext}
            >
                Suivant
            </button>
        ) : (
            <>
                <h2>Score : {perfectCount * 3 + (correctCount - perfectCount) * 1}  (max : {totalQuestions * 3} )</h2>
                <button
                    className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg text-lg hover:bg-blue-700 transition"
                    onClick={onFinish}
                >
                    Terminer
                </button>
            </>
        )}
    </div>
);

export default ResultPhase;
