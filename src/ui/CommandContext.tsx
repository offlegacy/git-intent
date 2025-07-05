import { createContext, type ReactNode, useContext } from "react";
import { add } from "../core/commands";

type CommandContextType = {
  add: typeof add;
};

const CommandContext = createContext<CommandContextType | null>(null);

export const useCommands = () => {
  const context = useContext(CommandContext);
  if (!context) {
    throw new Error("useCommands must be used within CommandProvider");
  }
  return context;
};

export const CommandProvider = ({ children }: { children: ReactNode }) => {
  return (
    <CommandContext.Provider value={{ add }}>
      {children}
    </CommandContext.Provider>
  );
};
