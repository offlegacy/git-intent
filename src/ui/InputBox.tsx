import { useState } from "react";
import TextInput from "ink-text-input";
import { Box } from "ink";
import { useIntents } from "./IntentContext";

export const InputBox = ({
  setShowInputBox,
}: {
  setShowInputBox: (show: boolean) => void;
}) => {
  const [query, setQuery] = useState("");
  const { dispatch } = useIntents();

  return (
    <Box borderStyle="round">
      <TextInput
        value={query}
        onChange={setQuery}
        onSubmit={() => {
          dispatch({ type: "ADD_INTENT", payload: { message: query } });
          setShowInputBox(false);
        }}
        placeholder="What are you trying to achieve?"
      />
    </Box>
  );
};
