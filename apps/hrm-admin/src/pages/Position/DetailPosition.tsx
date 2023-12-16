import {
  NotFound,
  Show,
  SimpleShowLayout,
  TextField,
  useGetOne,
  usePermissions,
} from "react-admin";
import { Box, Button, Stack, Theme } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { formatTimeToYMD } from "@/utilities";
import { TableCustom } from "@/components/common/TableCustom";
import { makeStyles } from "@mui/styles";
import { PATH, ROLES } from "@/common";
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

export const DetailPosition = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const classes = useStyles();
  const { permissions } = usePermissions();

  const { data: position, isLoading: positionLoading } = useGetOne(
    PATH.POSITIONS,
    {
      id: Number(id),
      meta: {
        filter: {
          include: [
            {
              relation: "users",
              scope: {
                include: [
                  {
                    relation: "profile",
                  },
                  {
                    relation: "identifiers",
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
    <Fragment>
      {permissions.includes(ROLES.EMPLOYEE) ? (
        <NotFound />
      ) : (
        <Show actions={false}>
          <SimpleShowLayout>
            <Stack width="50%" margin="auto">
              <Box className={classes.boxItems}>
                <Box>ID</Box>
                <TextField source="id" />
              </Box>
              <Box className={classes.boxItems}>
                <Box>Title</Box>
                <TextField source="title" label="Title" />
              </Box>
              <Box className={classes.boxItems}>
                <Box>Code</Box>
                <TextField source="code" label="Code" />
              </Box>
            </Stack>
            {!positionLoading && position.users && (
              <TableCustom
                tableKey={1}
                tableHeader={[
                  "User ID",
                  "User Name",
                  "Full Name",
                  "Create At",
                  "Status",
                ]}
                tableBody={position.users.map((user: any) => [
                  user?.profile?.userId,
                  user?.identifiers?.[0].identifier,
                  user?.profile?.fullName,
                  formatTimeToYMD(user?.profile?.createdAt),
                  user?.status,
                ])}
                count={position?.users?.length}
              />
            )}
            <Box display="flex" justifyContent="center">
              <Button
                color="error"
                variant="contained"
                sx={{ width: "50%" }}
                onClick={() => navigate(`/${PATH.POSITIONS}`)}
              >
                Back
              </Button>
            </Box>
          </SimpleShowLayout>
        </Show>
      )}
    </Fragment>
  );
};
