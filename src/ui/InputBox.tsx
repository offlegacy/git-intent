import { Box, Text } from "ink";
import TextInput from "ink-text-input";
import { useQuery } from "./contexts/QueryContext";

export const InputBox = () => {
  const { query, setQuery, submitQuery } = useQuery();

  return (
    <Box borderStyle="round" borderDimColor>
      <Text> &gt; </Text>
      <TextInput
        value={query}
        onChange={setQuery}
        onSubmit={submitQuery}
        placeholder="What are you trying to achieve?"
      />
    </Box>
  );
};
