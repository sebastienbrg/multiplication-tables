'use client';
import React, { useState, useEffect, useMemo } from "react";

const USERS = ["Nao", "Thaïs", "Papa", "Maman"];
const TimeToRespond = 5; // seconds

type QuizState =
  | { step: "select-user" }
  | {
    step: "quiz";
    user: string;
    questions: { a: number; b: number }[];
    currentQuestionIndex: number;
    errorCount: number;
    correctCount: number;
    perfectCount: number;
    answer: string;
    showResult: boolean;
    correct: boolean;
    timer: number;
    resultSent: boolean;
  };

export default function Home() {
  const [state, setState] = useState<QuizState>({ step: "select-user" });
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [readyForNext, setReadyForNext] = useState(false);

  // Fetch a and b from backend
  const fetchMultiplication = async (user: string) => {
    const res = await fetch(`/api/multiplication?user=${encodeURIComponent(user)}`);
    if (!res.ok) return { questions: [{ a: 1, b: 1 }] };
    return res.json();
  };

  // Send result to backend
  const sendResult = async (username: string, a: number, b: number, answer: string, correct: boolean) => {
    await fetch('/api/result', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, a, b, answer, correct }),
    });
  };

  // Start quiz for selected user
  const startQuiz = async (user: string) => {
    const { questions } = await fetchMultiplication(user);
    setState({
      step: "quiz",
      user,
      questions,
      currentQuestionIndex: 0,
      errorCount: 0,
      correctCount: 0,
      perfectCount: 0,
      answer: "",
      showResult: false,
      correct: false,
      timer: TimeToRespond,
      resultSent: false,
    });
    setReadyForNext(false);
  };

  // Timer effect
  useEffect(() => {
    if (state.step !== "quiz" || state.showResult) return;
    if (timeoutId) clearInterval(timeoutId);
    const id = setInterval(() => {
      setState(prev => {
        if (prev.step === "quiz" && !prev.showResult) {
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
    // eslint-disable-next-line
  }, [state.step, (state as any).currentQuestionIndex, (state as any).showResult]);

  // Send result effect
  useEffect(() => {
    if (state.step !== "quiz" || !state.showResult || state.resultSent) return;
    const { a, b } = state.questions[state.currentQuestionIndex];
    const correct = Number(state.answer) === a * b;
    sendResult(state.user, a, b, state.answer, correct);
    setState(prev => {
      if (prev.step !== "quiz") return prev;
      return {
        ...prev,
        errorCount: prev.errorCount + (!correct ? 1 : 0),
        correctCount: prev.correctCount + (correct ? 1 : 0),
        perfectCount: prev.perfectCount + (correct && prev.timer > TimeToRespond - 3 ? 1 : 0),
        resultSent: true,
      };
    });
    setReadyForNext(true);
    // eslint-disable-next-line
  }, [state.step, (state as any).showResult]);

  // Handle answer input
  const handleAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (state.step !== "quiz" || state.showResult) return;
    const { a, b } = state.questions[state.currentQuestionIndex];
    const correct = Number(state.answer) === a * b;
    setState(prev => prev.step === "quiz"
      ? { ...prev, showResult: true, correct }
      : prev
    );
  };

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (state.step !== "quiz") return;
    setState(prev => prev.step === "quiz"
      ? { ...prev, answer: e.target.value }
      : prev
    );
  };

  // Handle next question
  const handleNext = () => {
    if (state.step === "quiz") {
      if (state.currentQuestionIndex < state.questions.length - 1) {
        setState(prev => prev.step === "quiz"
          ? {
            ...prev,
            currentQuestionIndex: prev.currentQuestionIndex + 1,
            answer: "",
            showResult: false,
            correct: false,
            timer: TimeToRespond,
            resultSent: false,
          }
          : prev
        );
        setReadyForNext(false);
      } else {
        setState({ step: "select-user" });
        setReadyForNext(false);
      }
    }
  };

  // Keyboard shortcut for next (Enter)
  useEffect(() => {
    if (!readyForNext) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleNext();
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line
  }, [readyForNext, state.step]);

  // UI rendering
  if (state.step === "select-user") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-8">
        <h1 className="text-3xl font-bold mb-4">Qui s'entraine?</h1>
        <div className="flex gap-6 flex-col " >
          {USERS.map((user) => (
            <button
              key={user}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg text-lg hover:bg-blue-700 transition"
              onClick={() => startQuiz(user)}
            >
              {user}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (state.step === "quiz") {
    const totalQuestions = state.questions.length;
    const currentIndex = state.currentQuestionIndex + 1;
    const { a, b } = state.questions[state.currentQuestionIndex];

    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-8">
        {/* Session widget */}
        <div className="fixed top-4 right-4 bg-white/80 shadow px-4 py-2 rounded-lg border text-sm flex flex-col items-end">
          <div>Question: <b>{currentIndex}</b> / {totalQuestions}</div>
          <div>Perfect : <b>{state.perfectCount}</b></div>
          <div>Correct : <b>{state.correctCount}</b></div>
          <div>Erreurs: <b>{state.errorCount}</b></div>
        </div>
        <h2 className="text-2xl font-semibold mb-2">{state.user}, combien ça fait ?</h2>
        {state.showResult
          ? <div className="text-4xl font-bold mb-4">{a} × {b} = {a * b} </div>
          : <div className="text-4xl font-bold mb-4">{a} × {b} = ?</div>
        }
        {!state.showResult ? (
          <form onSubmit={handleAnswer} className="flex flex-col items-center gap-4">
            <input
              type="number"
              className="border px-4 py-2 rounded text-xl w-32 text-center"
              inputMode="numeric"
              value={state.answer}
              onChange={handleChange}
              autoFocus
            />
            <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition">
              {"Repondre (<Enter>)"}
            </button>
            <div className="text-gray-500 mt-2">Time left: {state.timer}s</div>
          </form>
        ) : (
          <>
            <div className="text-2xl mt-4">
              {state.correct ? (
                <span className="text-green-600 font-bold">{(state.timer > (TimeToRespond - 3)) ? "Perfect" : "Correct"}!</span>
              ) : (
                <span className="text-red-600 font-bold">
                  {state.answer !== '' && Number(state.answer) !== a * b
                    ? 'Erreur !'
                    : `Trop tard ! `}
                </span>
              )}
            </div>
            {state.currentQuestionIndex < (state.questions.length - 1) ? (
              <button
                className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg text-lg hover:bg-blue-700 transition"
                onClick={handleNext}
              >
                Suivant
              </button>
            ) : (
              <button
                className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg text-lg hover:bg-blue-700 transition"
                onClick={() => setState({ step: "select-user" })}
              >
                Terminer
              </button>
            )}
          </>
        )}
      </div>
    );
  }

  return null;
}