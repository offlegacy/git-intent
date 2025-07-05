import { Spacer, useApp, useInput } from "ink";
import { useState } from "react";
import { ActiveIntentBox } from "./ActiveIntentBox";
import { CommandProvider } from "./CommandContext";
import { Help } from "./Help";
import { InputBox } from "./InputBox";
import { MainLayout } from "./MainLayout";
import { PlannedIntentsBox } from "./PlannedIntentsBox";

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
    <CommandProvider>
      <MainLayout>
        <ActiveIntentBox />
        <PlannedIntentsBox />
        <Spacer />
        {showInputBox ? <InputBox setShowInputBox={setShowInputBox} /> : null}
        <Help />
      </MainLayout>
    </CommandProvider>
  );
};
