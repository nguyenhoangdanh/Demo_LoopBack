import { PATH, ROLES } from "@/common";
import { ActionsField, PostPagination } from "@/components/common";
import FieldWrapper from "@/components/common/FieldWrapper";
import { TableCustom } from "@/components/common/TableCustom";
import { formatTimeToYMD } from "@/utilities";
import { Box, Theme, useTheme } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { Fragment } from "react";
import {
  List,
  TextField,
  FunctionField,
  usePermissions,
  NotFound,
  DatagridConfigurable,
  TopToolbar,
  SelectColumnsButton,
  CreateButton,
  ExportButton,
} from "react-admin";

const useStyles = makeStyles((theme: Theme) => {
  return {
    columnBtn: {
      [theme.breakpoints.up("md")]: {
        width: "124%",
      },
    },
  };
});

export const ListDepartments = () => {
  const classes = useStyles();
  const theme = useTheme();
  const { permissions } = usePermissions();

  return (
    <Fragment>
      {permissions.includes(ROLES.EMPLOYEE) ? (
        <NotFound />
      ) : (
        <List
          actions={
            <TopToolbar>
              <SelectColumnsButton className={classes.columnBtn} />
              <CreateButton />
              <ExportButton />
            </TopToolbar>
          }
          filter={{
            someField: true,
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
          }}
          sort={{ field: "id", order: "DESC" }}
          sx={{ padding: theme.spacing(1.25) }}
          pagination={<PostPagination />}
          perPage={100}
        >
          <DatagridConfigurable
            bulkActionButtons={false}
            rowClick="expand"
            sx={{ "& .column-actions": { textAlign: "center" } }}
            expand={
              <Box>
                <FunctionField
                  render={(record: any) => {
                    const tableHeader = [
                      "User ID",
                      "User Name",
                      "Full Name",
                      "Create At",
                      "Status",
                    ];
                    const tableBody = record.users?.map((user: any) => [
                      user?.profile?.userId,
                      user?.identifiers?.[0].identifier,
                      user?.profile?.fullName,
                      formatTimeToYMD(user?.profile?.createdAt),
                      user?.status,
                    ]);
                    return (
                      <Box>
                        {tableBody && (
                          <TableCustom
                            tableKey={record.id}
                            tableHeader={tableHeader}
                            tableBody={tableBody}
                            count={record?.users?.length}
                          />
                        )}
                      </Box>
                    );
                  }}
                />
              </Box>
            }
          >
            <TextField source="id" />
            <TextField source="name" />
            <TextField source="code" />
            <FieldWrapper label="Actions" source="actions" sortable={false}>
              <FunctionField
                render={(record: Record<string, any>) => {
                  return (
                    <ActionsField
                      id={record.id}
                      actions={new Set(["edit", "show", "delete"])}
                      resource={PATH.DEPARTMENTS}
                    />
                  );
                }}
              />
            </FieldWrapper>
          </DatagridConfigurable>
        </List>
      )}
    </Fragment>
  );
};
