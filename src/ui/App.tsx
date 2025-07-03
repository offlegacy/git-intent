import { MainLayout } from "./MainLayout";
import { ActiveIntentBox } from "./ActiveIntentBox";
import { PlannedIntentsBox } from "./PlannedIntentsBox";

export const App = () => {
  return (
    <MainLayout>
      <ActiveIntentBox />
      <PlannedIntentsBox />
    </MainLayout>
  );
};
