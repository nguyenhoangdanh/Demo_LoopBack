import { ISSUES_STATUS } from "@/common";
import { Box } from "@mui/material";
import { get } from "lodash";

export default function ColoredTag({ name }: { name: string }) {
  return (
    <Box
      width="100%"
      minWidth="80px"
      height="100%"
      display={"inline-flex"}
      justifyContent={"center"}
      textAlign={"center"}
      padding={"2px 4px"}
      borderRadius={"2px"}
      sx={{
        backgroundColor: get(ISSUES_STATUS.COLOR, name)?.default,
        cursor: "pointer",
      }}
    >
      {name}
    </Box>
  );
}
