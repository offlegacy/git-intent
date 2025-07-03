import { Box, Text } from "ink";

import * as commands from "../core/commands";

export const PlannedIntentsBox = () => {
  const intentsList = commands.list("created");

  if (intentsList.length === 0) {
    return (
      <Box paddingLeft={1} borderStyle="round" flexDirection="column">
        <Text>No intent found.</Text>
      </Box>
    );
  }

  return (
    <Box
      paddingLeft={1}
      marginRight={1}
      borderStyle="round"
      flexDirection="column"
    >
      <Box marginTop={-1}>
        <Text> Intent </Text>
      </Box>
      {intentsList.map((intent) => (
        <Box>
          <Text>{`${intent.message}`}</Text>
        </Box>
      ))}
    </Box>
  );
};
