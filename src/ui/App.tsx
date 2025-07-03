import { MainLayout } from "./MainLayout";
import { ActiveIntentBox } from "./ActiveIntentBox";
import { PlannedIntentsBox } from "./PlannedIntentsBox";
import { Help } from "./Help";

export const App = () => {
  return (
    <MainLayout>
      <ActiveIntentBox />
      <PlannedIntentsBox />
    </MainLayout>
        <Spacer />
        <Help />
  );
};
