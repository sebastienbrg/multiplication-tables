'use client';
import React, { useState } from "react";
import SelectUser from "./components/SelectUser";

import SessionResultViewer from "./components/SessionResultViewer";
import { AppState } from "./appState";
import QuizPhase, { getInitialQuizzState } from "./components/quizzComponant";
import { QuizState } from "./quizzState";



const InitialAppState: AppState = {
  step: "select-user",
  user: null
};

export default function Home() {
  const [appState, setAppState] = useState<AppState>({ ...InitialAppState });
  const [quizzState, setQuizzState] = React.useState<QuizState>(getInitialQuizzState());

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
    return <SessionResultViewer
      quizzState={quizzState}
      appState={appState}
      onRestart={() => {
        setAppState(prev => ({
          ...prev,
          step: "quiz",
        }));

        const newQuizState = getInitialQuizzState();
        setQuizzState(newQuizState);
      }}
      onFinish={() => {
        setAppState(InitialAppState);
        setQuizzState(getInitialQuizzState());
      }}
    />;
  }

  return null;
}