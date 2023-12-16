import AvatarIcon from "@/assets/image/avatar-modification.svg";
import {
  BASE_URL,
  EMPLOYEES_STATUS,
  IDepartmentDaysOff,
  IStatusDisplayedUser,
  IUserDepartmentData,
  WORKING_STATUS,
} from "@/common";
import {Box, CardMedia, Paper, Stack, Theme} from "@mui/material";
import {makeStyles} from "@mui/styles";
import dayjs from "dayjs";
import get from "lodash/get";

interface IUserCardProps {
  item:
    | (IUserDepartmentData & {
        spentDayOff?: number;
        totalDayOff?: number;
        year?: number;
        id?: number;
      })
    | IDepartmentDaysOff;
  employeesState: { status: IStatusDisplayedUser; createdAt?: string };
}

const useStyles: any = makeStyles((theme: Theme) => {
  return {
    PaperCard: {
      display: "flex",
      flexDirection: "column",
      padding: theme.spacing(2),
      margin: theme.spacing(1),
      [theme.breakpoints.up("xs")]: {
        width: "100%",
      },
      [theme.breakpoints.up("md")]: {
        width: "30%",
      },
      [theme.breakpoints.up("lg")]: {
        width: "23%",
      },
    },
    BoxName: {
      display: "flex",
      justifyContent: "center",
      marginLeft: theme.spacing(4),
      fontSize: theme.spacing(4),
      fontWeight: 500,
    },
    BoxItems: {
      display: "flex",
      justifyContent: "space-between",
      borderBottom: "1px dashed #aab0ab",
      margin: theme.spacing(1.5, 0),
      fontSize: theme.spacing(3),
    },
    WorkingStatus: {
      position: "absolute",
      width: theme.spacing(1.0),
      height: theme.spacing(1.0),
      top: "30%",
      left: "-20%",
      borderRadius: "50%",
    },
  };
});

export const ProfileCard: React.FC<IUserCardProps> = ({
  item,
  employeesState,
}) => {
  const classes = useStyles();
  const faceImgUrl = item?.profile?.avatarImgUrl;
  const imageSrc = faceImgUrl
    ? { src: `${BASE_URL}/static-assets/${faceImgUrl}` }
    : { image: `${AvatarIcon}` };
  return (
    <Paper className={classes.PaperCard}>
      <Stack flexDirection="row" alignItems="center">
        <CardMedia
          component="img"
          alt="avatar"
          sx={{
            width: "20%",
            borderRadius: "50%",
          }}
          {...imageSrc}
        />
        <Box className={classes.BoxName}>{item?.profile?.fullName}</Box>
      </Stack>
      <Box className={classes.BoxItems}>
        <Box>ID:</Box>
        <Box>{item?.id}</Box>
      </Box>
      <Box className={classes.BoxItems}>
        <Box>Status:</Box>
        <Box
          width="auto"
          height="auto"
          padding=" 2px 4px"
          borderRadius="4px"
          sx={{ backgroundColor: get(EMPLOYEES_STATUS.COLOR, item?.status) }}
        >
          {get(EMPLOYEES_STATUS.NAME, item?.status)}
        </Box>
      </Box>
      <Box className={classes.BoxItems}>
        <Box>Attendance:</Box>
        <Box position={"relative"}>
          <Box
            className={classes.WorkingStatus}
            sx={{
              backgroundColor: get(
                WORKING_STATUS.COLOR,
                employeesState?.status
              ),
            }}
          ></Box>
          {employeesState?.status}
        </Box>
      </Box>
      {employeesState?.createdAt && (
        <Box className={classes.BoxItems}>
          <Box>Last checked in at:</Box>
          {dayjs(employeesState?.createdAt).format("HH:mm:ss")}
        </Box>
      )}
      <Box className={classes.BoxItems}>
        <Box>Spent Days Off:</Box>
        <Box>{item?.spentDayOff ?? 0}</Box>
      </Box>
      <Box className={classes.BoxItems}>
        <Box>Total Days Off:</Box>
        <Box>{item?.totalDayOff ?? 0}</Box>
      </Box>
    </Paper>
  );
};
