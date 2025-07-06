import React from "react";
import { AppState } from "../appState";
import { QuizState } from "../quizzState";

interface ResultPhaseProps {
    quizzState: QuizState;
    onFinish: () => void;
}

const ResultPhase: React.FC<ResultPhaseProps> = ({
    quizzState,
    onFinish
}) => {
    const { perfectCount, correctCount } = quizzState;
    const totalQuestions = quizzState.questions.length;
    return <div className="flex flex-col items-center justify-center min-h-screen gap-8">
        {/* Session widget */}
        <>
            <h2>Score : {perfectCount * 3 + (correctCount - perfectCount) * 1}  (max : {totalQuestions * 3} )</h2>
            <button
                className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg text-lg hover:bg-blue-700 transition"
                onClick={onFinish}
            >
                Terminer
            </button>
        </>

    </div>
};

export default ResultPhase;
