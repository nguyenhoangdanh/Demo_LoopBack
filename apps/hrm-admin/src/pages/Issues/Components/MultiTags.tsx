import { Box, Chip, useAutocomplete } from "@mui/material";
import { InputWrapper, StyledTag } from ".";
import { ITag } from "@/common";

export default function MultiTags(tags: ITag[]) {
  return (
    <Box sx={{ display: "flex" }}>
      {tags?.map((item: ITag, index: number) => (
        <StyledTag label={item.name} key={index} />
      ))}
    </Box>
  );
}
