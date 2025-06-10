'use client';

import React, { useState, useEffect } from "react";

const USERS = ["Nao", "Thaïs", "Papa", "Maman"];

type QuizState =
  | { step: "select-user" }
  | { step: "quiz"; user: string; a: number; b: number; answer: string; showResult: boolean; correct: boolean; timer: number };

const TimeToRespond = 5; // seconds

export default function Home() {
  const [state, setState] = useState<QuizState>({ step: "select-user" });
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  // Track if ready for next question
  const [readyForNext, setReadyForNext] = useState(false);

  // Start quiz for selected user
  const startQuiz = (user: string) => {
    const a = Math.floor(Math.random() * 9) + 1;
    const b = Math.floor(Math.random() * 9) + 1;
    setState({ step: "quiz", user, a, b, answer: "", showResult: false, correct: false, timer: TimeToRespond });
    setReadyForNext(false);
    startTimer(user, a, b);
  };

  // Modified timer logic with pause
  const startTimer = (user: string, a: number, b: number) => {
    let t = TimeToRespond;
    const id = setInterval(() => {
      setState((prev) => {
        if (prev.step === "quiz") {
          t = prev.timer - 1;
          if (t >= 0) {
            return { ...prev, timer: t };
          }
        }
        return prev;
      });
      if (t === 0) {
        clearInterval(id);
        setTimeoutId(null);
        setState((prev) => {
          if (prev.step === "quiz") {
            return { ...prev, showResult: true, correct: false };
          }
          return prev;
        });
        setReadyForNext(true);
      }
    }, 1000);
    setTimeoutId(id);
  };


  // Handle answer input
  const handleAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (state.step !== "quiz" || readyForNext) return;
    if (timeoutId) clearInterval(timeoutId);
    const correct = Number(state.answer) === state.a * state.b;
    setState({ ...state, showResult: true, correct });
    setReadyForNext(true);
  };

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (state.step !== "quiz") return;
    setState({ ...state, answer: e.target.value });
  };

  // Handle next question
  const handleNext = () => {
    if (state.step === "quiz") {
      startQuiz(state.user);
    }
  };

  // Keyboard shortcut for next (Enter)
  useEffect(() => {
    if (!readyForNext) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleNext();
        e.preventDefault(); // Prevent default form submission
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [readyForNext, state.step]);

  // UI rendering
  if (state.step === "select-user") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-8">
        <h1 className="text-3xl font-bold mb-4">Qui s'entraine?</h1>
        <div className="flex gap-6">
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
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-8">
        <h2 className="text-2xl font-semibold mb-2">{state.user}, calcul ça :</h2>

        {(state.showResult) ? <div className="text-4xl font-bold mb-4">{state.a} × {state.b} = {state.a * state.b} </div> :
          <div className="text-4xl font-bold mb-4">
            {state.a} × {state.b} = ?
          </div>
        }

        {!state.showResult ? (
          <form onSubmit={handleAnswer} className="flex flex-col items-center gap-4">
            <input
              type="number"
              className="border px-4 py-2 rounded text-xl w-32 text-center"
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
                <span className="text-green-600 font-bold">Correct!</span>
              ) : (
                <span className="text-red-600 font-bold">
                  {state.answer !== '' && Number(state.answer) !== state.a * state.b
                    ? 'Erreur !'
                    : `Trop tard ! `}
                </span>

              )}
            </div>
            <button
              className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg text-lg hover:bg-blue-700 transition"
              onClick={handleNext}

            >
              Suivant
            </button>
          </>
        )}
      </div>
    );
  }

  return null;
}
