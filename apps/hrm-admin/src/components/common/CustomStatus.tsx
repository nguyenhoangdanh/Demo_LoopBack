import { EMPLOYEES_STATUS } from "@/common";
import { Box, Stack } from "@mui/material";
import get from "lodash/get";

export const CustomStatus = (status: string) => {
  return (
    <Stack
      flexDirection="row"
      spacing={2}
      flexWrap="nowrap"
      alignItems="center"
    >
      <Box
        width="12px"
        height="12px"
        marginRight="5px"
        borderRadius="50%"
        sx={{ backgroundColor: get(EMPLOYEES_STATUS.COLOR, status) }}
      ></Box>
      <>{get(EMPLOYEES_STATUS.NAME, status)}</>
    </Stack>
  );
};
