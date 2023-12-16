import {
  NotFound,
  Show,
  SimpleShowLayout,
  useGetOne,
  usePermissions,
} from "react-admin";
import { Box, Button, Stack, Theme, useTheme } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { makeStyles } from "@mui/styles";
import { formatTimeToYMD } from "@/utilities";
import { PATH, ROLES } from "@/common";
import { CustomStatus } from "@/components/common";
import { Fragment } from "react";

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

export const DetailUser = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const classes = useStyles();
  const theme = useTheme();
  const { permissions } = usePermissions();

  const { data: employee } = useGetOne(
    PATH.USERS,
    {
      id: Number(id),
      meta: {
        filter: {
          include: [
            {
              relation: "profile",
            },
          ],
        },
      },
    },
    { enabled: Boolean(id) }
  );

  const handleGoBack = () => {
    navigate(`/${PATH.USERS}`);
  };

  return (
    <Fragment>
      {permissions.includes(ROLES.EMPLOYEE) ? (
        <NotFound />
      ) : (
        <Show actions={false}>
          <SimpleShowLayout>
            <Stack width="50%" margin="auto">
              <Box className={classes.boxItems}>
                <Box>ID</Box>
                <Box>{employee?.id}</Box>
              </Box>
              <Box className={classes.boxItems}>
                <Box>Name</Box>
                <Box>{employee?.profile?.fullName}</Box>
              </Box>
              <Box className={classes.boxItems}>
                <Box>Created At</Box>
                <Box>{formatTimeToYMD(employee?.createdAt)}</Box>
              </Box>
              <Box className={classes.boxItems}>
                <Box>Last Login</Box>
                <Box>{formatTimeToYMD(employee?.lastLoginAt)}</Box>
              </Box>
              <Box className={classes.boxItems}>
                <Box>User Type</Box>
                <Box>{employee?.userType}</Box>
              </Box>
              <Box className={classes.boxItems}>
                <Box>Face Image Url</Box>
                <Box>{employee?.profile?.faceImgUrl}</Box>
              </Box>
              <Box className={classes.boxItems}>
                <Box>Status</Box>
                <Box>{CustomStatus(employee?.status)}</Box>
              </Box>
              <Button
                color="error"
                variant="contained"
                sx={{ marginTop: theme.spacing(2) }}
                onClick={handleGoBack}
              >
                Back
              </Button>
            </Stack>
          </SimpleShowLayout>
        </Show>
      )}
    </Fragment>
  );
};
