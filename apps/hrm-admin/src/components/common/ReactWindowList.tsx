import { FixedSizeList as List } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import { Stack } from "@mui/material";
import { ReactNode } from "react";

export const ReactWindowList = (props: { item: ReactNode }) => {
  const { item } = props;

  const Cell = () => <Stack flexDirection="column">{item}</Stack>;

  return (
    <AutoSizer>
      {({ height, width }: {height: number; width: number}) => (
        <List
          className="Grid"
          height={height}
          width={width}
          itemCount={1000}
          itemSize={1000}
        >
          {Cell}
        </List>
      )}
    </AutoSizer>
  );
};
