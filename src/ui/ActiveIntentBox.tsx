import { Box, Text, useFocus } from "ink";

import * as commands from "../core/commands";
import { TitledBox } from "./Title";

export const ActiveIntentBox = () => {
  const { isFocused } = useFocus();
  const activeList = commands.list("in_progress");

  if (!Array.isArray(activeList) || activeList.length === 0) {
    return (
      <Box paddingLeft={1} borderStyle="round" flexDirection="column">
        <Text>No active intent found.</Text>
      </Box>
    );
  }

  if (activeList.length > 1) {
    return (
      <Box paddingLeft={1} borderStyle="round" flexDirection="column">
        <Text color="yellow">
          Warning: Multiple active intents found. Showing first one.
        </Text>
        <Text>{activeList[0]?.message || "Intent message unavailable"}</Text>
      </Box>
    );
  }

  const intent = activeList[0];

  if (!intent) {
    throw new Error(
      "Invariant violation: intent should exist when activeList.length !== 0",
    );
  }

  return (
    <Box
      paddingLeft={1}
      marginRight={1}
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
