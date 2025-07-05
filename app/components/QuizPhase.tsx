import React from "react";
import { QuizState } from "../quizzState";

interface QuizPhaseProps {
    state: QuizState;
    setState: (newState: QuizState | ((prevState: QuizState) => QuizState)) => void;
}

const QuizPhase: React.FC<QuizPhaseProps> = ({
    state,
    setState,
}) => {


    // Handle input change
    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (state.step !== "quiz") return;
        setState(prev => prev.step === "quiz"
            ? { ...prev, answer: e.target.value }
            : prev
        );
    };
    // Handle answer input
    const onAnswer = (e: React.FormEvent) => {
        e.preventDefault();
        if (state.step !== "quiz" || state.showResult) return;
        const { a, b } = state.questions[state.currentQuestionIndex];
        const correct = Number(state.answer) === a * b;
        setState(prev => prev.step === "quiz"
            ? { ...prev, showResult: true, correct }
            : prev
        );
    };
    const { user,
        questions,
        currentQuestionIndex,
        answer,
        showResult,
        timer,
        perfectCount,
        correctCount,
        errorCount } = state;

    const totalQuestions = questions.length;
    const currentIndex = currentQuestionIndex + 1;
    const { a, b } = questions[currentQuestionIndex];

    return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-8">
            {/* Session widget */}
            <div className="fixed top-4 right-4 bg-white/80 shadow px-4 py-2 rounded-lg border text-sm flex flex-col items-end">
                <div>Question: <b>{currentIndex}</b> / {totalQuestions}</div>
                <div>Perfect : <b>{perfectCount}</b></div>
                <div>Correct : <b>{correctCount}</b></div>
                <div>Erreurs: <b>{errorCount}</b></div>
            </div>
            <h2 className="text-2xl font-semibold mb-2">{user}, combien ça fait ?</h2>
            {showResult
                ? <div className="text-4xl font-bold mb-4">{a} × {b} = {a * b} </div>
                : <div className="text-4xl font-bold mb-4">{a} × {b} = ?</div>
            }
            {!showResult ? (
                <form onSubmit={onAnswer} className="flex flex-col items-center gap-4">
                    <input
                        type="number"
                        className="border px-4 py-2 rounded text-xl w-32 text-center"
                        inputMode="numeric"
                        value={answer}
                        onChange={onChange}
                        autoFocus
                    />
                    <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition">
                        {"Repondre (<Enter>)"}
                    </button>
                    <div className="text-gray-500 mt-2">Time left: {timer}s</div>
                </form>
            ) : null}
        </div>
    );
};

export default QuizPhase;
