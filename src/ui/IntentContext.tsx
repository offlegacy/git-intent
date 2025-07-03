import { type ReactNode, createContext, useContext, useReducer } from "react";
import { IntentStatus } from "../types";
import { add } from "../core/commands";
import { type Intent } from "../core/db/schema";

type IntentAction =
  | {
      type: "ADD_INTENT";
      payload: { message: string; status?: (typeof IntentStatus)[number] };
    }
  | {
      type: "UPDATE_INTENT";
      payload: { id: number; status: (typeof IntentStatus)[number] };
    };

type IntentState = {
  intents: Omit<Intent, "createdAt">[];
};

type IntentContextType = {
  state: IntentState;
  dispatch: (action: IntentAction) => void;
};

const IntentContext = createContext<IntentContextType | null>(null);

const intentReducer = (
  state: IntentState,
  action: IntentAction,
): IntentState => {
  switch (action.type) {
    case "ADD_INTENT":
      const id = add(action.payload.message, action.payload.status);
      return {
        ...state,
        intents: [
          ...state.intents,
          {
            id,
            message: action.payload.message,
            status: action.payload.status || "created",
          },
        ],
      };
    default:
      return state;
  }
};

export const useIntents = () => {
  const context = useContext(IntentContext);
  if (!context) {
    throw new Error("useIntents must be used within IntentProvider");
  }
  return context;
};

export const IntentProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(intentReducer, { intents: [] });

  return (
    <IntentContext.Provider value={{ state, dispatch }}>
      {children}
    </IntentContext.Provider>
  );
};
