import { Box, Grid, TextField, useTheme } from "@mui/material";

export const TextFieldCustom = (props: { title: string; value: any }) => {
  const { title, value } = props;
  const theme = useTheme();

  return (
    <Grid
      container
      spacing={3}
      padding={`${theme.spacing(1)} ${theme.spacing(0)}`}
    >
      <Grid
        item
        xs={4}
        md={2}
        display="flex"
        alignItems="center"
        justifyContent="flex-end"
      >
        <Box>{title}</Box>
      </Grid>
      <Grid item xs={8} md={10}>
        <TextField sx={{ width: "100%" }} value={value} disabled />
      </Grid>
    </Grid>
  );
};
