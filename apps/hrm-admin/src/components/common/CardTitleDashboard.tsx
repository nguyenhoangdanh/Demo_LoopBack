import { Box, Paper, Stack, Theme, useTheme } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { ReactNode } from "react";
import CountUp from "react-countup";

const useStyles: any = makeStyles((theme: Theme) => {
  return {
    PaperCustom: {
      width: "100%",
      padding: theme.spacing(2),
      fontSize: theme.spacing(3),
    },
    BoxCustom: {
      width: "50px",
      height: "50px",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      marginLeft: theme.spacing(3),
      borderRadius: "50%",
    },
  };
});

export const CardTitleDashboard = (props: {
  dataCount: number;
  title: string;
  icon: ReactNode;
  backgroundColor: string;
}) => {
  const { dataCount, title, backgroundColor, icon } = props;

  const theme = useTheme();
  const classes = useStyles();

  return (
    <Paper className={classes.PaperCustom} elevation={1}>
      <Stack flexDirection="row" alignItems="center">
        <Box
          className={classes.BoxCustom}
          sx={{ backgroundColor: `${backgroundColor} !important` }}
        >
          {icon}
        </Box>
        <Stack alignItems="center" flexGrow={1}>
          <Box sx={{ fontSize: theme.spacing(20) }}>
            <CountUp end={dataCount} duration={3} />
          </Box>
          <Box>{title}</Box>
        </Stack>
      </Stack>
    </Paper>
  );
};
