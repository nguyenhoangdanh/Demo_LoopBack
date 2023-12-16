import { Box, Chip, useAutocomplete } from "@mui/material";
import { InputWrapper, StyledTag } from "../Components";
import { IUser, ITag } from "@/common";

export default function Assignees(assignees: IUser[]) {
  return (
    <Box sx={{ display: "flex" }}>
      {assignees?.map((item: IUser, index: number) => (
        <StyledTag label={item.profile.fullName} key={index} />
      ))}
    </Box>
  );
}
