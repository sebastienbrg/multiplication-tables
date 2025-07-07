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
            return <span>-</span>;
        }
        return getDisplayTextResponseTime(stat, appState.user);
    };
    const targetScore = totalQuestions * getScorePointsForAnswer(appState.user, appState.user?.targetResponseTime || 3, true);

    return <div className="flex flex-col items-center justify-center min-h-screen gap-6 px-2 sm:px-6 bg-gradient-to-b from-white to-blue-50">
        {/* Session widget */}
        <>
            <div
                key="scoreTitle"
                className={clsx(
                    "mt-4 text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 transition-transform text-center mb-0",
                    quizzState.score >= targetScore && "text-green-600 animate-bounce",
                )}
            >
                Score : {Math.round(quizzState.score)} <span className="text-base sm:text-lg font-normal">(Objectif : {targetScore})</span>
            </div>

            {(loading) ? <Loader /> : <>
                <div key="summup" className="w-full max-w-xl mx-auto mt-0 text-base sm:text-lg text-gray-700 bg-white/80 rounded-lg shadow p-3 flex flex-col gap-1">
                    <div className="flex flex-row flex-wrap gap-4 justify-between">
                        <span>✅ Bonnes réponses : <b>{sessionStats?.correctCount || 0}</b></span>
                        <span>❌ Mauvaises réponses : <b>{sessionStats?.incorrectCount || 0}</b></span>
                    </div>
                    <div className="flex flex-row flex-wrap gap-2 items-center mt-2">
                        <span>⏱️ Temps de réponse moyen : <b>{sessionStats ? `${sessionStats.meanResponseTime.toFixed(2)} s` : "N/A"}</b></span>
                        {sessionStats && getMarginDisplay(sessionStats.meanResponseTime, appState.user?.maxResponseTime || 9)}
                    </div>
                </div>
                <div key="toggleStatsSession" className="w-full max-w-xl mx-auto text-base sm:text-lg text-gray-700 mb-2 flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="toggleStatsSession"
                        className="mr-2"
                        checked={!!showStats}
                        onChange={(e) => {
                            if (e.target.checked) {
                                setShowStats(appState.user);
                            } else {
                                setShowStats(null);
                            }
                        }}
                    />
                    <label htmlFor="toggleStatsSession">{"Afficher les stats de l'utilisateur"}</label>
                </div>
                <div className={
                    showStats
                        ? "overflow-x-auto flex flex-col lg:flex-row gap-2 items-stretch"
                        : "overflow-x-auto flex justify-center"
                }>

                    <div key="1" className="flex max-w-xl mx-auto">
                        <TableOfTables
                            user={appState.user}
                            stats={quizzStats || {}}
                            getCellColor={getCellColor}
                            loading={loading}
                            getDisplayText={getDisplayText}
                        />
                    </div>
                    {showStats && <div key="2" className="flex max-w-xl mx-auto">
                        <UserStats user={showStats} />
                    </div>}

                </div>
            </>}

            <div className="flex flex-col sm:flex-row gap-3 mt-4 w-full max-w-xl mx-auto">
                <button
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg text-base sm:text-lg hover:bg-blue-700 transition font-semibold"
                    onClick={onRestart}
                >
                    Nouvelle session
                </button>
                <button
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-base sm:text-lg hover:bg-blue-700 transition font-semibold"
                    onClick={onFinish}
                >
                    Terminer
                </button>
            </div>
        </>
    </div>
};

export default SessionResultViewer;


