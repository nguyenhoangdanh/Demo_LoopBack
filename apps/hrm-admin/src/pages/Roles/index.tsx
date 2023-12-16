import { Fragment, useCallback, useState } from "react";
import {
  CreateButton,
  DatagridConfigurable,
  ExportButton,
  FunctionField,
  List,
  SelectColumnsButton,
  TextField,
  TopToolbar,
} from "react-admin";
import {
  ActionsField,
  CustomStatus,
  PostPagination,
} from "@/components/common";
import { Theme, useTheme } from "@mui/material";
import SetDrawer from "./drawer";
import { makeStyles } from "@mui/styles";
import FieldWrapper from "@/components/common/FieldWrapper";
import { PATH } from "@/common";

const useStyles = makeStyles((theme: Theme) => {
  return {
    columnBtn: {
      [theme.breakpoints.up("md")]: {
        width: "124%",
      },
    },
  };
});

export default function ListRoles() {
  const theme = useTheme();
  const classes = useStyles();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [roleName, setRoleName] = useState("");
  const [roleId, setRoleId] = useState<string | undefined>();

  const handleDrawerOpen = useCallback(() => {
    setIsDrawerOpen(true);
  }, []);

  const handleDrawerClose = useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  return (

      <List
        filter={{
          someField: true,
          include: [
            {
              relation: "permissions",
            },
          ],
        }}
        sort={{ field: "id", order: "DESC" }}
        sx={{ padding: theme.spacing(1.25) }}
        pagination={<PostPagination />}
        perPage={100}
        actions={
          <TopToolbar>
            <SelectColumnsButton className={classes.columnBtn} />
            <CreateButton />
            <ExportButton />
          </TopToolbar>
        }
      >
        <DatagridConfigurable
          bulkActionButtons={false}
          sx={{ "& .column-actions": { textAlign: "center" } }}
          rowClick={(id, _resource, record) => {
            setRoleName(record?.name);
            setRoleId(`${id}`);
            return false;
          }}
          onClick={handleDrawerOpen}
        >
          <TextField source="id" />
          <TextField source="name" />
          <TextField source="identifier" />
          <FunctionField
            source="status"
            label="Status"
            render={(record: any) => CustomStatus(record?.status)}
          />
          <FieldWrapper label="Actions" source="actions" sortable={false}>
            <FunctionField
              render={(record: Record<string, any>) => {
                return (
                  <ActionsField
                    id={record.id}
                    actions={new Set(["edit", "delete"])}
                    resource={PATH.ROLES}
                  />
                );
              }}
            />
          </FieldWrapper>
        </DatagridConfigurable>
        <SetDrawer
          isDrawerOpen={isDrawerOpen}
          roleId={roleId}
          handleDrawerClose={handleDrawerClose}
          roleName={roleName}
        />
      </List>
  );
}
