import { Box, CardMedia, Stack, useTheme } from "@mui/material";
import PersonBuild from "../../assets/image/person-build.svg";

export const ComingSoon = () => {
  const theme = useTheme();

  return (
    <Stack
      display="flex"
      flexDirection="row"
      justifyContent="center"
      alignItems="center"
      minHeight="100%"
    >
      <CardMedia
        component="img"
        image={PersonBuild}
        alt="Coming soon"
        sx={{ width: theme.spacing(75), marginRight: theme.spacing(5) }}
      />
      <Stack display="flex">
        <Box fontSize={theme.spacing(8)} marginBottom={theme.spacing(3)}>
          Coming Soon...!
        </Box>
        <Box>
          <Box>I'd love to hear that you want to see this function.</Box>
          <Box>
            And I'm really sorry that this function is not available yet, I'm
            trying my best to make it come true!
          </Box>
        </Box>
      </Stack>
    </Stack>
  );
};
