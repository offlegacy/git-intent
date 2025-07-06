import { Spacer, useApp, useInput } from "ink";
import { ActiveIntentBox } from "./ActiveIntentBox";
import { QueryProvider } from "./contexts/QueryContext";
import { Help } from "./Help";
import { InputBox } from "./InputBox";
import { MainLayout } from "./MainLayout";

export const App = () => {
  const { exit } = useApp();

  useInput((input, key) => {
    if (input === "q" || key.escape) {
      exit();
    }
  });

  return (
    <QueryProvider>
      <MainLayout>
        <ActiveIntentBox />
        <Spacer />
        <InputBox />
        <Help />
        <Spacer />
      </MainLayout>
    </QueryProvider>
  );
};
