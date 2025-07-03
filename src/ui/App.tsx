import { useApp, useInput, Spacer } from "ink";

import { MainLayout } from "./MainLayout";
import { ActiveIntentBox } from "./ActiveIntentBox";
import { PlannedIntentsBox } from "./PlannedIntentsBox";
import { Help } from "./Help";
import { InputBox } from "./InputBox";
import { useState } from "react";
import { IntentProvider } from "./IntentContext";

export const App = () => {
  const [showInputBox, setShowInputBox] = useState(false);
  const { exit } = useApp();

  useInput((input, key) => {
    if (input === "a") {
      setShowInputBox(true);
    }
    if (input === "q" || key.escape) {
      exit();
    }
  });

  return (
    <IntentProvider>
      <MainLayout>
        <ActiveIntentBox />
        <PlannedIntentsBox />
        <Spacer />
        {showInputBox ? <InputBox setShowInputBox={setShowInputBox} /> : null}
        <Help />
      </MainLayout>
    </IntentProvider>
  );
};
