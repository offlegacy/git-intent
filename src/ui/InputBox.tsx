import { useState } from "react";
import TextInput from "ink-text-input";
import { Box } from "ink";
import { useCommands } from "./CommandContext";

export const InputBox = ({
  setShowInputBox,
}: {
  setShowInputBox: (show: boolean) => void;
}) => {
  const [query, setQuery] = useState("");
  const { add } = useCommands();

  return (
    <Box borderStyle="round">
      <TextInput
        value={query}
        onChange={setQuery}
        onSubmit={() => {
          add(query);
          setShowInputBox(false);
        }}
        placeholder="What are you trying to achieve?"
      />
    </Box>
  );
};
