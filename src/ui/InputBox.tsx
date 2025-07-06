import { Box, Text } from "ink";
import TextInput from "ink-text-input";
import { useState } from "react";
import { useCommands } from "./CommandContext";

export const InputBox = () => {
  const [query, setQuery] = useState("");
  const { add } = useCommands();

  return (
    <Box borderStyle="round" borderDimColor>
      <Text> &gt; </Text>
      <TextInput
        value={query}
        onChange={setQuery}
        onSubmit={() => {
          if (query.trim() === "") {
            return;
          }
          add(query);
        }}
        placeholder="What are you trying to achieve?"
      />
    </Box>
  );
};
