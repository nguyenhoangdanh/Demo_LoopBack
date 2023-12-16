import { Show, SimpleShowLayout, useGetOne } from "react-admin";
import { Box, Button, Stack, Theme, useTheme } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { PATH } from "@/common";
import { formatTimeToYMD } from "@/utilities";
import { makeStyles } from "@mui/styles";
import { CustomStatus } from "@/components/common";

const useStyles: any = makeStyles((theme: Theme) => {
  return {
    boxItems: {
      display: "flex",
      justifyContent: "space-between",
      borderBottom: "1px dashed #aab0ab",
      margin: theme.spacing(1.5, 0),
    },
  };
});

export const DetailAttendance = () => {
  const navigate = useNavigate();
  const classes = useStyles();
  const { id } = useParams();
  const theme = useTheme();

  const { data: attendance } = useGetOne(
    PATH.ATTENDANCE,
    {
      id: Number(id),
      meta: {
        filter: {
          include: [
            {
              relation: "user",
              scope: {
                include: [
                  {
                    relation: "profile",
                  },
                ],
              },
            },
          ],
        },
      },
    },
    { enabled: Boolean(id) }
  );

  return (
    <Show actions={false}>
      <SimpleShowLayout>
        <Stack width="50%" margin="auto">
          <Box className={classes.boxItems}>
            <Box>ID</Box>
            <Box>{attendance?.id}</Box>
          </Box>
          <Box className={classes.boxItems}>
            <Box>FullName</Box>
            <Box>{attendance?.user?.profile?.fullName}</Box>
          </Box>
          <Box className={classes.boxItems}>
            <Box>Check In Time</Box>
            <Box>{formatTimeToYMD(attendance?.createdAt)}</Box>
          </Box>
          <Box className={classes.boxItems}>
            <Box>Check Out Time</Box>
            <Box>{formatTimeToYMD(attendance?.checkOutTime)}</Box>
          </Box>
          <Box className={classes.boxItems}>
            <Box>Location</Box>
            <Box>{attendance?.address}</Box>
          </Box>
          <Box className={classes.boxItems}>
            <Box>Coordinates</Box>
            <Box>{`${attendance?.coordinates.lat}, ${attendance?.coordinates.lng}`}</Box>
          </Box>
          <Box className={classes.boxItems}>
            <Box>Last Login</Box>
            <Box>{formatTimeToYMD(attendance?.user?.lastLoginAt)}</Box>
          </Box>
          <Box className={classes.boxItems}>
            <Box>Status</Box>
            <Box>{CustomStatus(attendance?.user?.status)}</Box>
          </Box>
          <Button
            color="error"
            variant="contained"
            sx={{ marginTop: theme.spacing(2) }}
            onClick={() => navigate(`/${PATH.ATTENDANCE}`)}
          >
            Back
          </Button>
        </Stack>
      </SimpleShowLayout>
    </Show>
  );
};
