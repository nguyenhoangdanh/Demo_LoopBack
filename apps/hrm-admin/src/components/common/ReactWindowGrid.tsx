import { FixedSizeGrid as Grid } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import { Stack } from "@mui/material";

export const ReactWindowGrid = (props: { item: any }) => {
  const { item } = props;

  const Cell = () => (
    <Stack flexWrap="wrap" flexDirection="row" marginRight={"0px"}>
      {item}
    </Stack>
  );

  return (
    <AutoSizer>
      {({ height, width }: {height: number; width: number}) => (
        <Grid
          className="Grid"
          height={height}
          width={width}
          columnCount={1}
          columnWidth={width}
          rowCount={1}
          rowHeight={height}
        >
          {Cell}
        </Grid>
      )}
    </AutoSizer>
  );
};
