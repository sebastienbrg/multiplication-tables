import React from "react";
import { QuizState } from "../quizzState";
import { AppState } from "../appState";

interface ResultPhaseProps {
    appState: AppState;
    quizzState: QuizState;
    onFinish: () => void;
    onRestart: () => void;
}

const ResultPhase: React.FC<ResultPhaseProps> = ({
    quizzState,
    appState,
    onFinish,
    onRestart
}) => {
    const totalQuestions = quizzState.questions.length;
    return <div className="flex flex-col items-center justify-center min-h-screen gap-8">
        {/* Session widget */}
        <>
            <h2>Score : {quizzState.score}  (max : {totalQuestions * (appState.user?.maxResponseTime || 9)} )</h2>
            <button
                className="mt-6 w-48 px-6 py-3 bg-green-600 text-white rounded-lg text-lg hover:bg-blue-700 transition"
                onClick={onRestart}
            >
                Nouvelle session
            </button>
            <button
                className="mt-6 w-48 px-6 py-3 bg-blue-600 text-white rounded-lg text-lg hover:bg-blue-700 transition"
                onClick={onFinish}
            >
                Terminer
            </button>
        </>

    </div>
};

export default ResultPhase;
