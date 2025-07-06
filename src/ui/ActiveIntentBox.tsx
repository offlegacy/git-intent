import { Box, Text, useFocus } from "ink";

import { useQuery } from "./contexts/QueryContext";
import { TitledBox } from "./Title";

export const ActiveIntentBox = () => {
  const { isFocused } = useFocus();
  const { activeIntentList } = useQuery();

  if (!Array.isArray(activeIntentList) || activeIntentList.length === 0) {
    return (
      <Box paddingLeft={1} borderStyle="round" flexDirection="column">
        <Text>No active intent found.</Text>
      </Box>
    );
  }

  if (activeIntentList.length > 1) {
    return (
      <Box paddingLeft={1} borderStyle="round" flexDirection="column">
        <Text color="yellow">
          Warning: Multiple active intents found. Showing first one.
        </Text>
        <Text>
          {activeIntentList[0]?.message || "Intent message unavailable"}
        </Text>
      </Box>
    );
  }

  const intent = activeIntentList[0];

  if (!intent) {
    throw new Error(
      "Invariant violation: intent should exist when activeList.length !== 0",
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
        <Text>{`${intent.message}`}</Text>
      </TitledBox>
    </Box>
  );
};
