import { Box, Text } from "ink";
import type React from "react";

type TitleAlignment = "left" | "center" | "right";

interface TitledBoxProps {
  title: string;
  titleAlignment?: TitleAlignment;
  borderStyle?:
    | "single"
    | "double"
    | "round"
    | "bold"
    | "singleDouble"
    | "doubleSingle"
    | "classic";
  borderColor?: string;
  width?: number;
  children?: React.ReactNode;
}

export const TitledBox: React.FC<TitledBoxProps> = ({
  title,
  titleAlignment = "left",
  width,
  children,
}) => {
  const getJustifyContent = (): "flex-start" | "center" | "flex-end" => {
    switch (titleAlignment) {
      case "center":
        return "center";
      case "right":
        return "flex-end";
      default:
        return "flex-start";
    }
  };

  return (
    <Box flexDirection="column" width={width}>
      <Box justifyContent={getJustifyContent()} paddingX={1} marginTop={-1}>
        <Text>{title}</Text>
      </Box>
      <Box paddingX={1}>{children}</Box>
    </Box>
  );
};
