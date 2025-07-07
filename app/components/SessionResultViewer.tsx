import React, { useState, useEffect } from "react";
import { QuizState } from "../quizzState";
import { AppState, User } from "../appState";
import { Stat, StatsData } from "./StatsData";
import { Loader } from "./Loader";
import TableOfTables from "./TableOfTables";
import { getDisplayTextResponseTime, getMarginDisplay } from "../tools/statsDisplayTools";
import clsx from "clsx";
import { getScorePointsForAnswer } from "./getScorePointsForAnswer";
import UserStats from "./UserStats";

interface ResultPhaseProps {
    appState: AppState;
    quizzState: QuizState;
    onFinish: () => void;
    onRestart: () => void;
}

const SessionResultViewer: React.FC<ResultPhaseProps> = ({
    quizzState,
    appState,
    onFinish,
    onRestart
}) => {
    const [quizzStats, setQuizzStats] = useState<StatsData | null>(null);
    const [sessionStats, setSessionStats] = useState<{ correctCount: number, incorrectCount: number, meanResponseTime: number } | null>(null);
    const [loading, setLoading] = useState(true);
    const [showStats, setShowStats] = useState<User | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch(`/api/multiplication/sessionStats?sessionId=${quizzState.testSessionId}`);
                if (!response.ok) {
                    throw new Error("Failed to fetch stats");
                }
                const data = await response.json();
                setQuizzStats(data.statsData);
                const sessionInfo = data.sessionInfo;
                setSessionStats({
                    correctCount: sessionInfo.correctCount,
                    incorrectCount: sessionInfo.incorrectCount,
                    meanResponseTime: sessionInfo.meanResponseTime
                });
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [quizzState.testSessionId]);

    const totalQuestions = quizzState.questions.length;

    const getCellColor = (stat: Stat) => {
        if (stat === undefined) {
            return "#e2dede";
        }
        if (stat.correct > 0) {
            return "green";
        } else if (stat.incorrect > 0) {
            return "red";
        } else {
            return "#e2dede";
        }
    }
    const getDisplayText = (stat: Stat) => {
        if (!appState.user) {
            return "-";
        }
        return getDisplayTextResponseTime(stat, appState.user);
    };
    const targetScore = totalQuestions * getScorePointsForAnswer(appState.user, appState.user?.targetResponseTime || 3, true);

    return <div className="flex flex-col items-center justify-center min-h-screen gap-8">
        {/* Session widget */}
        <>
            <div
                key="scoreTitle"
                className={clsx(
                    "text-4xl font-bold text-gray-800 transition-transform",
                    quizzState.score >= targetScore && "text-green-600 animate-bounce",
                )}
            >
                Score : {Math.round(quizzState.score)}  (Objectif : {targetScore})
            </div>

            {(loading) ? <Loader /> : <>
                <div key="summup" className="mt-2 text-lg text-gray-700">
                    <p className="mb-2">Bonnes réponses : {sessionStats?.correctCount || 0}</p>
                    <p className="mb-2">Mauvaises réponses : {sessionStats?.incorrectCount || 0}</p>
                    <div className="flex" ><div className="mb-2">Temps de réponse moyen : {sessionStats ? `${sessionStats.meanResponseTime.toFixed(2)} secondes` : "N/A"}</div>
                        {sessionStats && getMarginDisplay(sessionStats.meanResponseTime, appState.user?.maxResponseTime || 9)}
                    </div>

                </div>
                <TableOfTables
                    user={appState.user}
                    stats={quizzStats || {}}
                    getCellColor={getCellColor}
                    loading={loading}
                    getDisplayText={getDisplayText}
                />
            </>}
            <button
                className="w-48 px-2 py-1 bg-blue-600 text-white rounded-lg text-lg hover:bg-blue-700 transition"
                onClick={() => setShowStats(appState.user ? appState.user : null)}
            >
                {showStats ? "Cacher les stats" : "Voir les stats"}
            </button>

            <button
                className=" w-48 px-2 py-1 bg-green-600 text-white rounded-lg text-lg hover:bg-blue-700 transition"
                onClick={onRestart}
            >
                Nouvelle session
            </button>
            <button
                className="w-48 px-2 py-1 bg-blue-600 text-white rounded-lg text-lg hover:bg-blue-700 transition"
                onClick={onFinish}
            >
                Terminer
            </button>
        </>
        {showStats && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div
                    className="fixed inset-0 bg-black bg-opacity-40"
                    onClick={() => setShowStats(null)}
                />
                <div className="relative bg-white rounded-lg shadow-lg p-6 z-10 max-w-2xl w-full max-h-[90vh] overflow-auto">
                    <button
                        className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-2xl"
                        onClick={() => setShowStats(null)}
                        title="Fermer"
                    >
                        ×
                    </button>
                    <UserStats user={showStats} />
                </div>
            </div>
        )}
    </div>
};

export default SessionResultViewer;


