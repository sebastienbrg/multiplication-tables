
"use client"

import React, { useState } from "react";
import UserStats from "./UserStats";
import { QuizState } from "../quizzState";
import { AppState, User } from "../appState";

interface SessionWidgetProps {
    quizzState: QuizState;
    appState: AppState;

}
const SessionWidget: React.FC<SessionWidgetProps> = ({ quizzState, appState }) => {
    const [showStats, setShowStats] = useState<User | null>(null);

    return (
        <div className="fixed top-4 right-4 bg-white/80 shadow px-4 py-2 rounded-lg border text-md flex flex-col items-end">
            <div>Question: <b>{quizzState.currentQuestionIndex + 1}</b> / {quizzState.questions.length}</div>
            <div>Perfect : <b>{quizzState.perfectCount}</b></div>
            <div>Correct : <b>{quizzState.correctCount}</b></div>
            <div>Erreurs: <b>{quizzState.errorCount}</b></div>
            {appState.user && (
                <button
                    className="mt-2 text-blue-600 hover:underline"
                    onClick={() => {
                        if (showStats) {
                            setShowStats(null); // Hide stats if already showing for this user
                        } else
                            setShowStats(appState.user);
                    }
                    }
                >
                    Stats
                </button>
            )}
            {showStats && appState.user && (
                <UserStats user={appState.user} />
            )}
        </div>
    );
};
export default SessionWidget;