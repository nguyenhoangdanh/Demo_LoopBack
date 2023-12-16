import {
  Box,
  Button,
  Stack,
  useTheme,
  Theme,
  Dialog,
  Slide,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from "@mui/material";
import React, { useCallback, useState } from "react";
import { makeStyles } from "@mui/styles";
import { Loading, useNotify } from "react-admin";
import { BASE_URL, ICheckIn } from "../../../common";
import { LbProviderGetter } from "@/helpers";
import { TransitionProps } from "@mui/material/transitions";
import { formatTimeToYMD } from "@/utilities";

const useStyles: any = makeStyles((theme: Theme) => {
  const { spacing } = theme;
  return {
    strikethrough: {
      width: "100%",
      margin: spacing(1.5, 0),
      border: "none",
      borderTop: "1px dashed #AAB0AB",
    },
    identifyCorrect: {
      padding: spacing(1.5),
      marginTop: spacing(3),
      border: "1px dashed #22bb33",
      [theme.breakpoints.down("md")]: {
        width: "100%",
      },
      [theme.breakpoints.up("md")]: {
        width: "50%",
      },
    },
  };
});

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

type CheckInProps = {
  opts: ICheckIn;
  resetState: () => void;
};

export const CheckIn: React.FC<CheckInProps> = ({ opts, resetState }) => {
  const { id, fullname, checkInTime, latitude, longitude, address } =
    opts ?? {};
  const classes = useStyles();
  const theme = useTheme();
  const notify = useNotify();
  const [isLoading, setIsLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleCheckOut = useCallback(async () => {
    type IData = {
      data: object;
    };
    setIsLoading(true);
    const data = await LbProviderGetter({
      baseUrl: BASE_URL,
    }).send(`check-in/out/${id}`, {
      method: "patch",
    });
    const parseData = (data as IData).data;

    setIsLoading(false);
    setDialogOpen(false);
    if (parseData) {
      notify("Successful create!", { type: "success" });
      resetState();
    } else {
      notify("Create failed!", { type: "error" });
    }
  }, [checkInTime, latitude, longitude]);

  return isLoading ? (
    <Loading />
  ) : (
    <Stack display="flex" justifyContent="center" alignItems="center">
      <Stack className={classes.identifyCorrect}>
        {/* <img src={imgFace ?? ""} width={400} height={400} alt="screenshot" /> */}
        <Box display="flex" justifyContent="space-between">
          <Box sx={{ marginRight: theme.spacing(2) }}>Fullname:</Box>
          <Box>{fullname}</Box>
        </Box>
        <Box className={classes.strikethrough}></Box>
        <Box display="flex" justifyContent="space-between">
          <Box sx={{ marginRight: theme.spacing(2) }}>Check-in time:</Box>
          <Box>{formatTimeToYMD(checkInTime)}</Box>
        </Box>
        <Box className={classes.strikethrough}></Box>
        <Box display="flex" justifyContent="space-between">
          <Box>Latitude:</Box>
          <Box>{latitude}</Box>
        </Box>
        <Box className={classes.strikethrough}></Box>
        <Box display="flex" justifyContent="space-between">
          <Box>Longtitude:</Box>
          <Box>{longitude}</Box>
        </Box>
        <Box className={classes.strikethrough}></Box>
        <Box display="flex" justifyContent="space-between">
          <Box sx={{ marginRight: theme.spacing(2) }}>Address:</Box>
          <Box>{address}</Box>
        </Box>
      </Stack>
      <Box width={"50%"} marginTop={theme.spacing(3)}>
        <Button color="info" itemType="file" onClick={() => handleOpenDialog()}>
          Check Out
        </Button>
      </Box>

      <Dialog
        open={dialogOpen}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleCloseDialog}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle>{"Confirm End of Work Session"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            Are you sure you want to end your current work session? Please
            remember to save any unfinished work and close any open files before
            checking out. If you have any ongoing tasks, please ensure they are
            set to a state that can be safely resumed when you check in next.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={handleCloseDialog}>
            Cancel
          </Button>
          <Button color="info" onClick={handleCheckOut}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};
