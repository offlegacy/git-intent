import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import * as commands from "../../core/commands";
import type { Intent } from "../../core/db/schema";
import { ensureBranch } from "../../core/utils/branch";
import { ensureProject } from "../../core/utils/project";

type QueryContextType = {
  query: string;
  setQuery: (query: string) => void;
  submitQuery: () => void;
  activeIntent: Intent | null;
  error: string | null;
};

const QueryContext = createContext<QueryContextType | null>(null);

export const useQuery = () => {
  const context = useContext(QueryContext);
  if (!context) {
    throw new Error("useQuery must be used within QueryProvider");
  }
  return context;
};

export const QueryProvider = ({ children }: { children: ReactNode }) => {
  const [query, setQuery] = useState("");
  const [activeIntent, setActiveIntent] = useState<Intent | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadActiveIntent = async () => {
      try {
        setError(null);
        const projectId = ensureProject();
        const branchId = ensureBranch(projectId);
        const activeIntent = await commands.findActiveIntent({ branchId });
        setActiveIntent(activeIntent || null);
      } catch (error) {
        console.error("Failed to load active intent:", error);
        setError("Failed to load active intent");
        setActiveIntent(null);
      }
    };

    loadActiveIntent();
  }, []);

  const submitQuery = async () => {
    if (query.trim() === "") {
      return;
    }

    try {
      setError(null);
      const projectId = await ensureProject();
      const branchId = await ensureBranch(projectId);
      const newActiveIntent = await commands.start({
        message: query,
        branchId,
      });
      setActiveIntent(newActiveIntent);
      setQuery("");
    } catch (error) {
      console.error("Failed to create intent:", error);
      setError("Failed to create intent. Please try again.");
    }
  };

  return (
    <QueryContext.Provider
      value={{ query, setQuery, submitQuery, activeIntent, error }}
    >
      {children}
    </QueryContext.Provider>
  );
};
