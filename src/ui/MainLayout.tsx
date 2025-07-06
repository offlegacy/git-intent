import { Box } from "ink";

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <Box flexGrow={1} paddingX={1} marginRight={30} flexDirection="column">
      {children}
    </Box>
  );
};
