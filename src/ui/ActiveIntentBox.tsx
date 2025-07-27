import { Box, Text, useFocus } from "ink";

import { useQuery } from "./contexts/QueryContext";
import { TitledBox } from "./Title";

export const ActiveIntentBox = () => {
  const { isFocused } = useFocus();
  const { activeIntent, error } = useQuery();

  if (error) {
    return (
      <Box paddingLeft={1} borderStyle="round" flexDirection="column">
        <Text color="red">Error: {error}</Text>
      </Box>
    );
  }

  if (!activeIntent) {
    return (
      <Box paddingLeft={1} borderStyle="round" flexDirection="column">
        <Text>No active intent found.</Text>
      </Box>
    );
  }

  return (
    <Box
      paddingLeft={1}
      borderStyle="round"
      borderColor={isFocused ? "green" : "white"}
      flexDirection="column"
    >
      <TitledBox title="Active Intent">
        <Text>{`${activeIntent.message}`}</Text>
      </TitledBox>
    </Box>
  );
};
