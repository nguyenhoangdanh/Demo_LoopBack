import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import ButtonGroup from "@mui/material/ButtonGroup";
import { EView } from "@/common";
import { useState, ReactNode } from "react";
import { Stack } from "@mui/material";
import GridViewOutlinedIcon from "@mui/icons-material/GridViewOutlined";
import ListOutlinedIcon from "@mui/icons-material/ListOutlined";

const buttons = [
  <Button key="one">One</Button>,
  <Button key="two">Two</Button>,
  <Button key="three">Three</Button>,
];

export const ButtonGroupCustom = (props: {
  gridChildren: ReactNode;
  listChildren: ReactNode;
  extra: ReactNode;
}) => {
  const { gridChildren, listChildren, extra } = props;
  const [view, setView] = useState<EView>(EView.GRID);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        "& > *": {
          m: 1,
        },
      }}
    >
      <Stack
        width={"100%"}
        flexDirection={"row"}
        justifyContent="space-between"
        alignItems="flex-start"
      >
        {extra && <Box>{extra}</Box>}
        <ButtonGroup size="small" aria-label="small button group">
          <Button
            key="one"
            onClick={() => setView(EView.GRID)}
            variant={view === EView.GRID ? "contained" : "outlined"}
          >
            <GridViewOutlinedIcon />
          </Button>
          <Button
            key="two"
            onClick={() => setView(EView.LIST)}
            variant={view === EView.LIST ? "contained" : "outlined"}
          >
            <ListOutlinedIcon />
          </Button>
        </ButtonGroup>
      </Stack>
      {view === EView.GRID ? gridChildren : listChildren}
    </Box>
  );
};
