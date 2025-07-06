import { Spacer, useApp, useInput } from "ink";
import { ActiveIntentBox } from "./ActiveIntentBox";
import { CommandProvider } from "./CommandContext";
import { Help } from "./Help";
import { InputBox } from "./InputBox";
import { MainLayout } from "./MainLayout";
import { PlannedIntentsBox } from "./PlannedIntentsBox";

export const App = () => {
  const { exit } = useApp();

  useInput((input, key) => {
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
        <InputBox />
        <Help />
      </MainLayout>
    </CommandProvider>
  );
};
