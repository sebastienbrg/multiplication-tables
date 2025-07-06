'use client';
import React, { useState, useEffect } from "react";
import SelectUser from "./components/SelectUser";

import ResultPhase from "./components/ResultPhase";
import { AppState } from "./appState";
import QuizPhase, { getInitialQuizzState } from "./quizz/page";
import { QuizState } from "./quizzState";

const TimeToRespond = 9; // seconds


const InitialAppState: AppState = {
  step: "select-user",
  user: null,
  userMaxTimeToRespond: TimeToRespond,
};

export default function Home() {
  const [appState, setAppState] = useState<AppState>({ ...InitialAppState });
  const [quizzState, setQuizzState] = React.useState<QuizState>(getInitialQuizzState(appState.userMaxTimeToRespond));

  // UI rendering
  if (appState.step === "select-user") {
    return <SelectUser
      appState={appState}
      setAppState={setAppState}
    />;
  } else if (appState.step === "quiz") {
    return <QuizPhase
      appState={appState}
      setAppState={setAppState}
      quizzState={quizzState}
      setQuizzState={setQuizzState}
    />;
  } else if (appState.step === "result") {
    return <ResultPhase
      quizzState={quizzState}
      onFinish={() => {
        setAppState(InitialAppState);
        setQuizzState(getInitialQuizzState(appState.userMaxTimeToRespond));
      }}
    />;
  }

  return null;
}