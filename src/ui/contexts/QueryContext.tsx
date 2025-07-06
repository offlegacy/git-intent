import { createContext, type ReactNode, useContext, useState } from "react";
import * as commands from "../../core/commands";
import type { Intent } from "../../core/db/schema";

type QueryContextType = {
  query: string;
  setQuery: (query: string) => void;
  submitQuery: () => void;
  activeIntentList: Intent[];
};

const QueryContext = createContext<QueryContextType | null>(null);

export const useQuery = () => {
  const context = useContext(QueryContext);
  if (!context) {
    throw new Error("useQuery must be used within QueryProvider");
  }
  return context;
};

const getActiveIntent = () => {
  const activeIntentArray = commands.list("in_progress");
  return Array.isArray(activeIntentArray) ? activeIntentArray : [];
};

export const QueryProvider = ({ children }: { children: ReactNode }) => {
  const [query, setQuery] = useState("");

  const [activeIntentList, setActiveIntentList] = useState(getActiveIntent);

  const submitQuery = () => {
    if (query.trim() === "") {
      return;
    }

    commands.add(query, "in_progress");

    setActiveIntentList(getActiveIntent());
    setQuery("");
  };

  return (
    <QueryContext.Provider
      value={{ query, setQuery, submitQuery, activeIntentList }}
    >
      {children}
    </QueryContext.Provider>
  );
};
