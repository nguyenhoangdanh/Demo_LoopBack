import { Box } from "@mui/material";
import { StyledTag } from ".";

export default function SingleTag(name?: string) {
  return name ? (
    <Box>
      <StyledTag label={name} />
    </Box>
  ) : (
    <></>
  );
}
