import {
  NotFound,
  Show,
  SimpleShowLayout,
  TextField,
  useGetOne,
  useNotify,
  usePermissions,
} from "react-admin";
import { Box, Button, Stack, Theme, useTheme } from "@mui/material";
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

export const DetailDepartment = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const classes = useStyles();
  const { permissions } = usePermissions();

  const { data: department, isLoading: departmentLoading } = useGetOne(
    PATH.DEPARTMENTS,
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
    { enabled: !!Number(id) }
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
                <Box>Name</Box>
                <TextField source="name" label="Name" />
              </Box>
              <Box className={classes.boxItems}>
                <Box>Code</Box>
                <TextField source="code" label="Code" />
              </Box>
            </Stack>
            {!departmentLoading && department?.users && (
              <TableCustom
                tableKey={1}
                tableHeader={[
                  "User ID",
                  "User Name",
                  "Full Name",
                  "Create At",
                  "Status",
                ]}
                tableBody={department?.users?.map((user: any) => [
                  user?.profile?.userId,
                  user?.identifiers?.[0].identifier,
                  user?.profile?.fullName,
                  formatTimeToYMD(user?.profile?.createdAt),
                  user?.status,
                ])}
                count={department?.users?.length}
              />
            )}
            <Box display="flex" justifyContent="center">
              <Button
                color="error"
                variant="contained"
                sx={{ width: "50%" }}
                onClick={() => navigate(`/${PATH.DEPARTMENTS}`)}
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
