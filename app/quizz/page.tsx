"use client"

import React, { useEffect, useState } from "react";
import { AppState, User } from "../appState";
import { QuizState } from "../quizzState";
import SessionWidget from "../components/SessionWdget";
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
    timer: 9,
    resultSent: false,
    readyForNext: false,
    running: false,
    testSessionId: 0
};

export function getInitialQuizzState(timeToRespond: number): QuizState {
    return {
        ...InitialQuizState,
        timer: timeToRespond,
        questions: [],
    };
}

const QuizPhase: React.FC<QuizPhaseProps> = ({
    appState,
    quizzState,
    setQuizzState: setState
}) => {
    // Handle input change
    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {

        setState(prev => ({ ...prev, answer: e.target.value }));
    };
    // Handle answer input
    const onAnswer = (e: React.FormEvent) => {
        e.preventDefault();
        const { a, b } = quizzState.questions[quizzState.currentQuestionIndex];
        const correct = Number(quizzState.answer) === a * b;
        setState(prev => ({ ...prev, showResult: true, correct }));
    };
    const { questions,
        currentQuestionIndex,
        answer,
        showResult,
        testSessionId,
        timer } = quizzState;

    const { user } = appState;


    const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);


    // Fetch a and b from backend
    const fetchMultiplication = async (user: User) => {
        const res = await fetch(`/api/multiplication?userId=${user.id}`);
        if (!res.ok) return { questions: [{ a: 1, b: 1 }], testSessionId: null };
        return res.json();
    };

    // Send result to backend
    const sendResult = async (userId: number, a: number, b: number, answer: string, correct: boolean) => {
        await fetch('/api/result', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, a, b, answer, correct, testSessionId }),
        });
    };

    // Start quiz for selected user
    const startQuiz = async (user: User) => {
        const newQuizz = getInitialQuizzState(appState.userMaxTimeToRespond)
        const { questions, testSessionId } = await fetchMultiplication(user);
        newQuizz.testSessionId = testSessionId;
        newQuizz.questions = questions;
        return setState(newQuizz);
    };

    // Timer effect
    useEffect(() => {
        if (timeoutId) clearInterval(timeoutId);
        if (quizzState.running) {
            const id = setInterval(() => {
                setState(prev => {
                    if (!prev.showResult) {
                        if (prev.timer > 0) {
                            return { ...prev, timer: prev.timer - 1 };
                        } else {
                            return { ...prev, showResult: true, correct: false };
                        }
                    }
                    return prev;
                });
            }, 1000);
            setTimeoutId(id);
            return () => clearInterval(id);
        }
        // eslint-disable-next-line
    }, [quizzState.currentQuestionIndex, quizzState.showResult, quizzState.running]);

    // Send result effect
    useEffect(() => {
        if (!quizzState.showResult || quizzState.resultSent) return;
        if (quizzState.questions.length === 0) return;
        const { a, b } = quizzState.questions[quizzState.currentQuestionIndex];
        const correct = Number(quizzState.answer) === a * b;
        if (appState.user)
            sendResult(appState.user.id || 0, a, b, quizzState.answer, correct);
        setState(prev => {
            return {
                ...prev,
                errorCount: prev.errorCount + (!correct ? 1 : 0),
                correctCount: prev.correctCount + (correct ? 1 : 0),
                perfectCount: prev.perfectCount + (correct && (prev.timer > (appState.userMaxTimeToRespond - PerfectResponseTime)) ? 1 : 0),
                resultSent: true,
                readyForNext: true
            };
        });

        // eslint-disable-next-line
    }, [quizzState.showResult]);




    // Handle next question
    const handleNext = () => {

        if (quizzState.currentQuestionIndex < quizzState.questions.length - 1) {
            setState(prev => ({
                ...prev,
                currentQuestionIndex: prev.currentQuestionIndex + 1,
                answer: "",
                showResult: false,
                correct: false,
                timer: appState.userMaxTimeToRespond,
                resultSent: false,
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

    if (!quizzState.running && quizzState.questions.length === 0) {
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
                            setState(prev => ({ ...prev, running: true }));
                        });
                    }}
                >
                    {"Commencer le quiz"}
                </button>
            </div>
        );
    }


    const { a, b } = questions[currentQuestionIndex];

    return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-8">
            {/* Session widget */}
            <SessionWidget
                quizzState={quizzState}
                appState={appState}
            />

            {showResult
                && <><div className="text-4xl font-bold mb-4">{a} × {b} = {a * b} </div>
                    <button
                        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
                        onClick={handleNext}
                    >
                        {quizzState.currentQuestionIndex < quizzState.questions.length - 1 ? "Question suivante (<Enter>)" : "Terminer le quiz"}
                    </button>
                </>
            }
            {!showResult ? (
                <>
                    <h2 className="text-2xl font-semibold mb-2">{user?.name}, combien ça fait ?</h2>
                    <div className="text-4xl font-bold mb-4">{a} × {b} = ?</div>
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
                </>
            ) : null}
        </div>
    );
};

export default QuizPhase;
