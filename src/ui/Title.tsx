import { Box, measureElement, Text } from "ink";
import React, { type ReactElement, useEffect, useRef } from "react";

type TitleAlignment = "left" | "center" | "right";

export const TitleText = (props: typeof Text.defaultProps) => Text(props);
TitleText.displayName = "BoxTitle";
TitleText.defaultProps = Text.defaultProps;

type TitledBoxProps = {
  alignment?: TitleAlignment;
} & typeof Box.defaultProps;

export const TitledBox = (props: TitledBoxProps) => {
  const ref = useRef();
  const [calculatedWidth, setCalculatedWidth] = React.useState(0);
  const { borderStyle, borderColor, alignment, width, children, ...rest } =
    props;

  useEffect(() => {
    const { width } = measureElement(ref.current);
    setCalculatedWidth(width);
  }, []);

  const cArray = React.Children.toArray(children);
  let textWrapper: JSX.Element;
  if (cArray.length > 0) {
    const cText = cArray.find((child) => {
      return React.isValidElement(child) && child.type === TitleText;
    });
    if (cText) {
      let margin = 0;
      const textWidth = (cText as ReactElement).props.children.length;
      switch (alignment) {
        case "left":
          break;
        case "center":
          if (calculatedWidth > 0) {
            margin = Math.floor((calculatedWidth - textWidth) / 2);
          }
          break;
        case "right":
          if (calculatedWidth > 0) {
            margin = calculatedWidth - textWidth - 2; // -2 to cater for the left/right border
          }
      }
      textWrapper = (
        <Box marginTop={-1} marginLeft={margin} {...rest}>
          {cText}
        </Box>
      );
    }
  }

  return (
    <Box
      flexDirection="column"
      alignItems="stretch"
      {...{ borderStyle, borderColor, width }}
      ref={ref}
    >
      {textWrapper}
      <Box {...rest}>
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child) && child.type === TitleText) return; // skip title
          return child;
        })}
      </Box>
    </Box>
  );
};

TitledBox.defaultProps = {
  alignment: "left",
};
