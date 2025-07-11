"use client"

import React, { useEffect, useState } from "react";
import { AppState, User } from "../appState";
import { QuizState } from "../quizzState";
import SessionWidget from "./SessionWdget";
import TimerAnimation from "./TimerAnimation";
import QuestionResultViewer from "./QuestionResultViewer";
import { getScorePointsForAnswer } from "./getScorePointsForAnswer";
const PerfectResponseTime = 4; // seconds

interface QuizPhaseProps {
    appState: AppState;
    setAppState: (newState: AppState | ((prevState: AppState) => AppState)) => void;
    quizzState: QuizState;
    setQuizzState: (newState: QuizState | ((prevState: QuizState) => QuizState)) => void;
}
const InitialQuizState: QuizState = {
    questions: [],
    currentQuestionIndex: 0,
    errorCount: 0,
    correctCount: 0,
    perfectCount: 0,
    answer: "",
    showResult: false,
    correct: false,
    readyForNext: false,
    testSessionId: 0,
    score: 0,
    timedOut: false,
    responseTime: 0,
};
export function getInitialQuizzState(): QuizState {
    return {
        ...InitialQuizState,
        questions: [],
    };
}

const QuizPhase: React.FC<QuizPhaseProps> = ({
    appState,
    quizzState,
    setAppState,
    setQuizzState: setState
}) => {
    // Handle input change
    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setState(prev => ({ ...prev, answer: e.target.value }));
    };
    // Handle answer input
    const onAnswer = (e: React.FormEvent | null) => {
        if (e) // If e is not null, prevent default form submission
            e.preventDefault();
        const { a, b } = quizzState.questions[quizzState.currentQuestionIndex];
        const correct = Number(quizzState.answer) === a * b;
        const responseTime = Math.round((Date.now() - questionStartTime) / 10) / 100;
        const scoreBonus = getScorePointsForAnswer(appState.user, responseTime, correct);

        if (appState.user) {
            const isLastQuestion = quizzState.currentQuestionIndex >= (quizzState.questions.length - 1);
            const correctResponseTime = correct ? responseTime : user?.maxResponseTime || 9;

            fetch('/api/result', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: appState.user.id, a, b, answer, correct, testSessionId, responseTime: correctResponseTime, isLastQuestion }),
            });

            setState(prev => {
                return {
                    ...prev,
                    errorCount: prev.errorCount + (!correct ? 1 : 0),
                    score: prev.score + scoreBonus,
                    correct,
                    correctCount: prev.correctCount + (correct ? 1 : 0),
                    perfectCount: prev.perfectCount + ((correct && (responseTime <= PerfectResponseTime)) ? 1 : 0),
                    responseTime,
                    showResult: true,
                    readyForNext: true
                };
            });
        }

    };
    const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
    const { questions,
        currentQuestionIndex,
        answer,
        showResult,
        testSessionId } = quizzState;

    const { user } = appState;


    // Fetch a and b from backend
    const fetchMultiplication = async (user: User) => {
        const res = await fetch(`/api/multiplication?userId=${user.id}`);
        if (!res.ok) return { questions: [{ a: 1, b: 1 }], testSessionId: null };
        return res.json();
    };



    // Start quiz for selected user
    const startQuiz = async (user: User) => {
        const newQuizz = getInitialQuizzState()
        const { questions, testSessionId } = await fetchMultiplication(user);
        newQuizz.testSessionId = testSessionId;
        newQuizz.questions = questions;
        setQuestionStartTime(Date.now());
        return setState(newQuizz);
    };


    const onTrigger = () => {
        console.log("Timer triggered");
        setState(prev => ({
            ...prev,
            timedOut: true,
        }));
        onAnswer(null);
    }


    // Handle next question
    const handleNext = () => {
        if (quizzState.currentQuestionIndex >= (quizzState.questions.length - 1)) {
            setAppState(prev => ({
                ...prev,
                step: "result"
            }));
        }
        else {
            setQuestionStartTime(Date.now());
            setState(prev => ({
                ...prev,
                currentQuestionIndex: prev.currentQuestionIndex + 1,
                answer: "",
                showResult: false,
                timedOut: false,
                correct: false,
                readyForNext: false,
            }));


        }
    };

    // Keyboard shortcut for next (Enter)
    useEffect(() => {
        if (!quizzState.readyForNext) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
                handleNext();
                e.preventDefault();
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
        // eslint-disable-next-line
    }, [quizzState.readyForNext]);

    if (quizzState.questions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-8">
                <h2 className="text-2xl font-semibold mb-2">{"Bienvenue " + appState.user?.name}</h2>
                <button
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg text-lg hover:bg-blue-700 transition"
                    onClick={() => {
                        if (!appState.user) {
                            alert("Veuillez sélectionner un utilisateur d'abord.");
                            return;
                        }
                        startQuiz(appState.user).then(() => {
                            setState(prev => ({ ...prev }));
                            setQuestionStartTime(Date.now());
                        });
                    }}
                >
                    {"Commencer le quiz"}
                </button>
            </div>
        );
    }


    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-8">
                <h2 className="text-2xl font-semibold mb-2">{"Veuillez sélectionner un utilisateur pour commencer le quiz."}</h2>
            </div>
        );
    }

    const { a, b } = questions[currentQuestionIndex];


    return (
        <div className="flex flex-col mt-[62px] md:mt-[0px] items-center justify-top md:justify-center min-h-screen gap-8">
            {/* Session widget */}
            <SessionWidget
                quizzState={quizzState}
                appState={appState}
            />

            {showResult
                && <>
                    <QuestionResultViewer quizzState={quizzState} user={appState.user as User} />

                    <button
                        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
                        onClick={handleNext}
                    >
                        {(quizzState.currentQuestionIndex < quizzState.questions.length - 1) ? "Question suivante (<Enter>)" : "Terminer le quiz"}
                    </button>
                </>
            }
            {!showResult ? (
                <>
                    <h2 className="text-2xl font-semibold mb-2 hidden md:block">{user?.name}, combien ça fait ?</h2>
                    <TimerAnimation onTrigger={onTrigger} duration={user?.maxResponseTime || 9} questionStartTime={questionStartTime} />
                    <div className="text-4xl font-bold mb-04">{a} × {b} = ?</div>
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


                    </form>
                </>
            ) : null}
        </div>
    );
};

export default QuizPhase;
