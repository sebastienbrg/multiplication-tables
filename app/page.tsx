'use client';
import React, { useState, useEffect } from "react";
import SelectUser from "./components/SelectUser";
import QuizPhase from "./components/QuizPhase";
import ResultPhase from "./components/ResultPhase";
import { QuizState } from "./quizzState";

const TimeToRespond = 9; // seconds
const PerfectResponseTime = 4; // seconds

const InitialQuizState: QuizState = {
  step: "select-user",
  user: null,
  questions: [],
  currentQuestionIndex: 0,
  errorCount: 0,
  correctCount: 0,
  perfectCount: 0,
  answer: "",
  showResult: false,
  correct: false,
  timer: TimeToRespond,
  resultSent: false,
  readyForNext: false,
};

export default function Home() {
  const [state, setState] = useState<QuizState>({ ...InitialQuizState });
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);


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
      readyForNext: false,
    });
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
    if (state.user === null) return; // No user selected, do not send result
    sendResult(state.user, a, b, state.answer, correct);
    setState(prev => {
      if (prev.step !== "quiz") return prev;
      return {
        ...prev,
        errorCount: prev.errorCount + (!correct ? 1 : 0),
        correctCount: prev.correctCount + (correct ? 1 : 0),
        perfectCount: prev.perfectCount + (correct && (prev.timer > (TimeToRespond - PerfectResponseTime)) ? 1 : 0),
        resultSent: true,
        readyForNext: true
      };
    });

    // eslint-disable-next-line
  }, [state.step, (state as any).showResult]);




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
            readyForNext: false,
          }
          : prev
        );

      } else {
        setState({ ...InitialQuizState });

      }
    }
  };

  // Keyboard shortcut for next (Enter)
  useEffect(() => {
    if (!state.readyForNext) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleNext();
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line
  }, [state.readyForNext, state.step]);

  // UI rendering
  if (state.step === "select-user") {
    return <SelectUser onSelect={startQuiz} />;
  }

  if (state.step === "quiz" && state.showResult) {
    const { a, b } = state.questions[state.currentQuestionIndex];
    return (
      <ResultPhase
        correct={state.correct}
        answer={state.answer}
        a={a}
        b={b}
        timer={state.timer}
        TimeToRespond={TimeToRespond}
        PerfectResponseTime={PerfectResponseTime}
        perfectCount={state.perfectCount}
        correctCount={state.correctCount}
        errorCount={state.errorCount}
        currentQuestionIndex={state.currentQuestionIndex}
        totalQuestions={state.questions.length}
        onNext={handleNext}
        onFinish={() => setState({ ...InitialQuizState })}
      />
    );
  }

  if (state.user) {
    return (
      <QuizPhase
        state={state}
        setState={setState}
      />
    );
  }

  return null;
}