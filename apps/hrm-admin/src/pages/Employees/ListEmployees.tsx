import { PATH, ROLES, WORKING_STATUS } from "@/common/constants";
import {
  ActionsField,
  CustomStatus,
  PostPagination,
} from "@/components/common";
import FieldWrapper from "@/components/common/FieldWrapper";
import {
  SOCKET_ESTABLISH,
  doAction,
  employeesFetchStatus,
} from "@/redux/actions";
import { RootState } from "@/redux/store";
import { Box, Button, Stack, Theme, useTheme } from "@mui/material";
import { makeStyles } from "@mui/styles";
import _, { get } from "lodash";
import { Fragment, useCallback, useEffect, useState } from "react";
import {
  CreateButton,
  DatagridConfigurable,
  ExportButton,
  FunctionField,
  List,
  Loading,
  NotFound,
  SelectColumnsButton,
  TextField,
  TopToolbar,
  useCreate,
  useDataProvider,
  useNotify,
  usePermissions,
} from "react-admin";
import { useDispatch, useSelector } from "react-redux";
import { formatTimeToYMD } from "../../utilities";
import FilterEmployeesSidebar from "./FilterSidebar";

const useStyles = makeStyles((theme: Theme) => {
  return {
    columnBtn: {
      [theme.breakpoints.up("md")]: {
        width: "124%",
      },
    },
  };
});

export const ListEmployees = () => {
  const classes = useStyles();
  const theme = useTheme();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const notify = useNotify();
  const [create] = useCreate();
  const { permissions } = usePermissions();
  const dataProvider = useDataProvider();
  const employeesState = useSelector((state: RootState) => state.employees);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [where, setWhere] = useState<any>({
    and: [
      {
        or: [], // For Departments
      },
      {
        or: [], // For Positions
      },
      {
        or: [], // For Working Status
      },
    ],
  });

  const handleDrawerOpen = useCallback(() => {
    setIsDrawerOpen(true);
  }, []);

  const handleDrawerClose = useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  const handleEncodeImages = useCallback(() => {
    setIsLoading(true);
    create(
      "/check-in/encode-img",
      {},
      {
        onSuccess: () => {
          setIsLoading(false);
          notify("Successful encode!", { type: "success" });
        },
        onError: () => {
          setIsLoading(false);
          notify("Create failed !", { type: "error" });
        },
      }
    );
  }, []);

  useEffect(() => {
    if (!permissions.includes(ROLES.EMPLOYEE)) {
      dispatch(doAction(SOCKET_ESTABLISH));

      dataProvider
        .send(PATH.USERS, {
          method: "get",
          query: {
            filter: {
              fields: ["id"],
            },
          },
        })
        .then((res: { data: { data: { id: number }[] } }) => {
          const allEmployeesIds = res.data.data.map((user) => user.id);
          dispatch(employeesFetchStatus(allEmployeesIds));
        });
    }
  }, []);

  return isLoading ? (
    <Loading />
  ) : (
    <Fragment>
      {permissions.includes(ROLES.EMPLOYEE) ? (
        <NotFound />
      ) : (
        <List
          aside={
            <FilterEmployeesSidebar
              setWhere={setWhere}
              isDrawerOpen={isDrawerOpen}
              closeDrawer={handleDrawerClose}
            />
          }
          filter={{
            ...where,
            include: ["profile", "departments", "positions"],
          }}
          sort={{ field: "id", order: "DESC" }}
          sx={{ padding: theme.spacing(1.25) }}
          pagination={<PostPagination />}
          perPage={100}
          empty={false}
          actions={
            <TopToolbar sx={{ width: { xs: "20%", md: "40%" } }}>
              <Button
                sx={{
                  height: "27px !important",
                  padding: "4px 10px !important",
                  fontSize: "13px",
                }}
                onClick={handleEncodeImages}
              >
                Sync
              </Button>
              <Button
                sx={{
                  height: "27px !important",
                  padding: "4px 10px !important",
                  fontSize: "13px",
                }}
                onClick={handleDrawerOpen}
              >
                Filter
              </Button>
              <SelectColumnsButton className={classes.columnBtn} />
              <CreateButton />
              <ExportButton />
            </TopToolbar>
          }
        >
          <DatagridConfigurable
            sx={{ "& .column-actions": { textAlign: "center" } }}
            bulkActionButtons={false}
          >
            <TextField source="id" label="ID" />
            <FunctionField
              label="Name"
              render={(record: any) => record?.profile?.fullName}
            />
            <FunctionField
              label="Created At"
              render={(record: any) =>
                `${formatTimeToYMD(record?.profile?.createdAt)}`
              }
            />
            <FunctionField
              source="lastLoginAt"
              label="Last Login"
              render={(record: any) =>
                `${formatTimeToYMD(record?.lastLoginAt)}`
              }
            />
            <FunctionField
              source="status"
              label="Status"
              render={(record: any) => CustomStatus(record?.status)}
            />
            <FunctionField
              label="Positions"
              render={(record: any) =>
                record?.positions
                  ? record.positions
                      .map((position: { title: string }) => position.title)
                      .join(", ")
                  : ""
              }
            />
            <FunctionField
              label="Departments"
              render={(record: any) =>
                record?.departments
                  ? record.departments
                      .map((position: { name: string }) => position.name)
                      .join(", ")
                  : ""
              }
            />
            <FunctionField
              label="Working Status"
              render={(record: any) => {
                return (
                  <Stack
                    flexDirection="row"
                    spacing={2}
                    flexWrap="nowrap"
                    alignItems="center"
                  >
                    <Box
                      width="12px"
                      height="12px"
                      marginRight="5px"
                      borderRadius="50%"
                      sx={{
                        backgroundColor: get(
                          WORKING_STATUS.COLOR,
                          get(employeesState, record?.id)?.status
                        ),
                      }}
                    ></Box>
                    <>{get(employeesState, record?.id)?.status}</>
                  </Stack>
                );
              }}
            />
            <FieldWrapper label="Actions" source="actions" sortable={false}>
              <FunctionField
                render={(record: Record<string, any>) => {
                  return (
                    <ActionsField
                      id={record.id}
                      actions={new Set(["show", "edit", "delete"])}
                      resource={PATH.USERS}
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
