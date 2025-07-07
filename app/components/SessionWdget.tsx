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
        <div className="fixed top-0 left-0 w-full bg-white/90 shadow px-1 py-1 border-b text-xs sm:text-sm md:text-base lg:text-lg flex flex-col items-end z-50">
            <div className="flex flex-row flex-wrap gap-0.5 mb-1 w-full justify-center">
                {quizzState.questions.map((q, idx) => {
                    let color = "bg-gray-300";
                    // No per-question result, so only show current as blue, previous as gray
                    if (idx === quizzState.currentQuestionIndex) {
                        color = "bg-blue-400 animate-pulse";
                    }
                    return (
                        <div
                            key={idx}
                            className={`w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 rounded-full ${color} border border-gray-400`}
                            title={`Question ${idx + 1}`}
                        />
                    );
                })}
            </div>
            <div className="flex flex-row flex-wrap gap-2 w-full justify-center items-center">
                <span className="sm:text-base md:text-lg lg:text-xl">Q: <b>{quizzState.currentQuestionIndex + 1}</b>/{quizzState.questions.length}</span>
                <span className="sm:text-base md:text-lg lg:text-xl">✔️ <b>{quizzState.correctCount}</b></span>
                <span className="sm:text-base md:text-lg lg:text-xl">🌟 <b>{quizzState.perfectCount}</b></span>
                <span className="sm:text-base md:text-lg lg:text-xl">❌ <b>{quizzState.errorCount}</b></span>
                <span className="sm:text-base md:text-lg lg:text-xl">🏆 <b>{Math.round(quizzState.score * 100) / 100}</b></span>
                {appState.user && (
                    <button
                        className="p-1 sm:p-2 rounded-full bg-gray-200 hover:bg-gray-300 text-blue-700 text-lg sm:text-xl md:text-2xl lg:text-3xl"
                        title="Voir les stats"
                        onClick={() => setShowStats(showStats ? null : appState.user)}
                    >
                        📊
                    </button>
                )}
            </div>
            {showStats && appState.user && (
                <div className="w-full flex justify-center"><UserStats user={appState.user} /></div>
            )}
        </div>
    );
};
export default SessionWidget;