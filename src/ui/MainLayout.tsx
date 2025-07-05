import { Box } from "ink";

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <Box flexGrow={1} paddingLeft={1} flexDirection="column">
      {children}
    </Box>
  );
};
