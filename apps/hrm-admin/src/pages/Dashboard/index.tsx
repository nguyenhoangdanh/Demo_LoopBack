import {
  EMPLOYEES_STATUS,
  IDaysOff,
  IDepartmentData,
  IDepartmentDaysOff,
  IDepartmentDaysOffMapping,
  IDepartmentSelection,
  IOtherEmployeesData,
  IStatisticItem,
  IUserDepartmentData,
  PATH,
  ROLES,
} from "@/common";
import {ProfileCard} from "@/components/common";
import {ButtonGroupCustom} from "@/components/common/ButtonGroupCustom";
import {CardTitleDashboard} from "@/components/common/CardTitleDashboard";
import {ReactWindowGrid} from "@/components/common/ReactWindowGrid";
import {TableCustom} from "@/components/common/TableCustom";
import {DASHBOARD_FETCH, doAction, employeesFetchStatus, SOCKET_ESTABLISH,} from "@/redux/actions";
import {RootState} from "@/redux/store";
import {convertArrayToObject} from "@/utilities";
import BusinessIcon from "@mui/icons-material/Business";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import EventBusyIcon from "@mui/icons-material/EventBusy";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import {
  Box,
  Button,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Stack,
  Theme,
  useTheme,
} from "@mui/material";
import {makeStyles} from "@mui/styles";
import dayjs from "dayjs";
import {get} from "lodash";
import {useDataProvider} from "ra-core";
import {Fragment, useCallback, useEffect, useState} from "react";
import {usePermissions} from "react-admin";
import {useDispatch, useSelector} from "react-redux";
import {useNavigate} from "react-router-dom";

const TableHeader = [
  "User ID",
  "Full Name",
  "Status",
  "Attendance",
  "Last checked in at",
  "spent Days Off",
  "Total Days Off",
];

const useStyles: any = makeStyles((theme: Theme) => {
  return {
    PaperCustom: {
      width: "100%",
      marginTop: theme.spacing(6),
      padding: theme.spacing(4),
    },
    FormControlCustom: {
      minWidth: theme.spacing(30),
      width: theme.spacing(75),
    },
    ButtonCustom: {
      marginTop: theme.spacing(6),
      padding: theme.spacing(0),
      backgroundColor: "transparent",
    },
    TitleDepartment: {
      position: "relative",
      textAlign: "center",
      margin: `${theme.spacing(4)} 0`,
      fontSize: theme.spacing(6),
      fontWeight: 600,
      "&::before, &::after": {
        content: "''",
        position: "absolute",
        top: "50%",
        height: theme.spacing(0.25),
        backgroundColor: "rgba(0, 0, 0, 0.23)",
        [theme.breakpoints.up("lg")]: {
          width: "35%",
        },
        [theme.breakpoints.down("lg")]: {
          width: "30%",
        },
        [theme.breakpoints.down("md")]: {
          width: "20%",
        },
      },
      "&::before": {
        left: 0,
        marginRight: theme.spacing(4),
      },
      "&::after": {
        right: 0,
        marginLeft: theme.spacing(4),
      },
    },
  };
});

const statisticData: IStatisticItem[] = [
  {
    id: 1,
    code: "totalEmployees",
    title: "Total Of Employees",
    icon: <EventAvailableIcon sx={{ color: "#AF5F5F" }} />,
    backgroundColor: "#EAD5D5",
    navigateTo: PATH.USERS,
  },
  {
    id: 2,
    code: "workingEmployees",
    title: "Working Employees",
    icon: <BusinessIcon sx={{ color: "#2ECC71" }} />,
    backgroundColor: "#D5F5E3",
  },
  {
    id: 3,
    code: "wfhEmployees",
    title: "Work From Home",
    icon: <HomeWorkIcon sx={{ color: "#87AFAF" }} />,
    backgroundColor: "#DFEAEA",
  },

  {
    id: 4,
    code: "offEmployees",
    title: "Off Employees",
    icon: <EventBusyIcon sx={{ color: "#EBC17A" }} />,
    backgroundColor: "#FAEEDD",
  },
];

const parseEmployeeData = (
  otherEmployees: IOtherEmployeesData[],
  daysOff: {
    [key: string]: IDaysOff;
  }
): IDepartmentDaysOff[] => {
  return otherEmployees.map((data) => ({
    id: data.id,
    status: data.status,
    userId: data.id,
    profile: {
      userId: data.id,
      fullName: data.full_name,
      avatarImgUrl: data.avatar_image_url,
    },
    spentDayOff: daysOff[data.id]?.spentDayOff ?? 0,
    totalDayOff: daysOff[data.id]?.totalDayOff ?? 0,
    year: daysOff[data.id]?.year ?? new Date().getFullYear(),
  }));
};

export const Dashboard = () => {
  const classes = useStyles();
  const dataProvider = useDataProvider();
  const dispatch = useDispatch();
  const { permissions } = usePermissions();
  const navigate = useNavigate();
  const theme = useTheme();
  const [departments, setDepartments] = useState<IDepartmentSelection[]>([]);
  const [users, setUsers] = useState<
    IDepartmentDaysOffMapping[] | IDepartmentData[]
  >([]);
  const [otherUsers, setOtherUsers] = useState<IUserDepartmentData[]>([]);
  const [departmentId, setDepartmentId] = useState<string | number>("");
  const [departmentValue, setDepartmentValue] = useState("All");

  const dashboardState = useSelector((state: RootState) => state.dashboard);
  const employeesState = useSelector((state: RootState) => state.employees);

  const getDepartments = useCallback(async () => {
    const departmentResponse: any = await dataProvider.send(PATH.DEPARTMENTS, {
      method: "GET",
    });

    setDepartments(departmentResponse?.data?.data);
  }, []);

  const getEmployees = useCallback(
    async (departmentId: string | number, departmentValue: string | number) => {
      const filter: Record<string, any> = {
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
      };
      const { data: daysOff }: { data: IDaysOff[] } = await dataProvider.send(
        PATH.DAYS_OFF,
        {
          method: "GET",
        }
      );

      if (departmentId) {
        if (!filter?.where) {
          filter.where = {};
        }

        filter.where.id = departmentId;
      }

      const newDaysOff = convertArrayToObject(daysOff, "userId");

      if (departmentValue !== "Others") {
        const userDepartments: { data: { data: IDepartmentData[] } } =
          await dataProvider.send(PATH.DEPARTMENTS, {
            method: "GET",
            query: { filter },
          });

        const userDepartmentsData: IDepartmentData[] =
          userDepartments?.data?.data;

        const mappedDataUser: IDepartmentDaysOffMapping[] | IDepartmentData[] =
          userDepartmentsData.map((user) => {
            if (!user.users?.length) {
              return user;
            }

            const updatedUsers = user.users.map((userData) => {
              return {
                ...userData,
                spentDayOff: newDaysOff[userData.profile.userId].spentDayOff ?? 0,
                totalDayOff: newDaysOff[userData.profile.userId].totalDayOff,
                year: newDaysOff[userData.profile.userId].year,
              };
            });

            return { ...user, users: updatedUsers };
          });

        setUsers(mappedDataUser);
      } else {
        setUsers([]);
      }

      if (!departmentId) {
        // Get other employees
        const { data: otherEmployees }: { data: IOtherEmployeesData[] } =
          await dataProvider.send(`${PATH.USERS_NOT_IN_DEPARTMENTS}`, {
            method: "GET",
          });

        const mapping: IUserDepartmentData[] = parseEmployeeData(
          otherEmployees,
          newDaysOff
        );
        setOtherUsers(mapping);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const handleChange = (event: SelectChangeEvent) => {
    const selectedDepartment = event.target.value;
    if (selectedDepartment === "All" || selectedDepartment === "Others") {
      setDepartmentId("");
    } else {
      setDepartmentId(selectedDepartment);
    }
    setDepartmentValue(selectedDepartment);
  };

  useEffect(() => {
    if (permissions.includes(ROLES.EMPLOYEE)) {
      navigate("/face");
      return;
    }

    getDepartments();
    getEmployees(departmentId, departmentValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [departmentId, departmentValue, navigate, permissions]);

  useEffect(() => {
    if (!permissions.includes(ROLES.EMPLOYEE)) {
      dispatch(doAction(SOCKET_ESTABLISH));
      dispatch(doAction(DASHBOARD_FETCH));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!users.length && !otherUsers.length) {
      return;
    }

    const displayedUsers = Array.from(
      new Set(
        users
          .filter((data) => data.users)
          .map((data) => data?.users?.map((user) => user.id))
          .filter((id): id is number[] => id !== undefined)
          .flat()
          .concat(otherUsers.map((user) => user.id))
      )
    );

    if (displayedUsers.length) {
      dispatch(employeesFetchStatus(displayedUsers));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users, otherUsers]);

  const GridView = () => {
    return (
      <Box width={"100%"}>
        {users?.map(
          (department: IDepartmentDaysOffMapping | IDepartmentData) => {
            if (
              department?.users?.length ||
              (departmentValue !== "All" && departmentValue !== "Others")
            ) {
              return (
                <Stack
                  flexDirection="column"
                  key={department?.id}
                  height={
                    department?.users?.length && department?.users?.length > 8
                      ? "85vh"
                      : "50vh"
                  }
                >
                  <Box className={classes.TitleDepartment}>
                    {department?.name}
                  </Box>
                  <Box width={"100%"} height={"100%"}>
                    <ReactWindowGrid
                      item={department?.users?.map(
                        (item: IUserDepartmentData | IDepartmentDaysOff) => {
                          return (
                            <ProfileCard
                              item={item}
                              employeesState={get(employeesState, item?.id)}
                              key={item?.id}
                            />
                          );
                        }
                      )}
                    />
                  </Box>
                </Stack>
              );
            }
          }
        )}
        {otherUsers?.length ? (
          (departmentValue === "All" || departmentValue === "Others") && (
            <Stack
              flexDirection="column"
              key={users.length}
              height={users?.length > 3 ? "85vh" : "50vh"}
            >
              <Box className={classes.TitleDepartment}>Others</Box>
              <Box width={"100%"} height={"100%"}>
                <ReactWindowGrid
                  item={otherUsers.map((user: IUserDepartmentData) => {
                    return (
                      <ProfileCard
                        item={user}
                        employeesState={get(employeesState, user?.id)}
                        key={user?.id}
                      />
                    );
                  })}
                />
              </Box>
            </Stack>
          )
        ) : (
          <></>
        )}
      </Box>
    );
  };

  const ListView = () => {
    return (
      <Box width={"100%"}>
        {users?.map((department: any) => {
          if (
            department?.users?.length > 0 ||
            (departmentValue !== "All" && departmentValue !== "Others")
          ) {
            return (
              <Stack
                flexDirection="column"
                key={department?.id}
                // height={department?.users?.length > 10 ? "100vh" : "50vh"}
                height={"auto"}
              >
                <Box className={classes.TitleDepartment}>
                  {department?.name}
                </Box>
                <Box width={"100%"} height={"100%"}>
                  <TableCustom
                    tableKey={department?.id}
                    tableHeader={TableHeader}
                    tableBody={tableBody(department?.users)}
                    count={department?.users?.length}
                    pagination={false}
                  />
                </Box>
              </Stack>
            );
          }
        })}
        {otherUsers?.length &&
          (departmentValue === "All" || departmentValue === "Others") && (
            <Stack
              flexDirection="column"
              key={otherUsers?.length}
              // height={otherUsers?.length > 3 ? "85vh" : "50vh"}
              height={"auto"}
            >
              <Box className={classes.TitleDepartment}>Others</Box>
              <Box width={"100%"} height={"100%"}>
                <TableCustom
                  tableHeader={TableHeader}
                  tableBody={otherUsers?.map((user) => renderTableBody(user))}
                  count={otherUsers?.length}
                  pagination={false}
                />
              </Box>
            </Stack>
          )}
      </Box>
    );
  };

  const renderTableBody = (user: any) => {
    const lastChecked = get(employeesState, user?.id)?.createdAt;
    return [
      user?.id,
      user?.profile?.fullName,
      <Box
        width="fit-content"
        height="auto"
        margin="auto"
        padding=" 2px 4px"
        borderRadius="4px"
        sx={{
          backgroundColor: get(EMPLOYEES_STATUS.COLOR, user?.status),
          fontSize: theme.spacing(3),
        }}
      >
        {get(EMPLOYEES_STATUS.NAME, user?.status)}
      </Box>,
      get(employeesState, user?.id)?.status,
      lastChecked ? dayjs(lastChecked).format("HH:mm:ss") : "No data",
      +user.spentDayOff,
      user.totalDayOff,
    ];
  };

  const tableBody = (users: any): string[][] => {
    return users?.map((user: any) => renderTableBody(user));
  };


  return (
    <Fragment>
      {permissions.includes(ROLES.EMPLOYEE) ? (
        <></>
      ) : (
        <Stack>
          <Grid container spacing={3}>
            {statisticData &&
              statisticData.map((items) => (
                <Grid item xs={12} md={6} lg={3} key={items.id}>
                  <Button
                    className={classes.ButtonCustom}
                    onClick={() =>
                      items.navigateTo && navigate(items.navigateTo)
                    }
                    disabled={!items.navigateTo}
                  >
                    <CardTitleDashboard
                      dataCount={dashboardState[items.code]}
                      title={items.title}
                      icon={items.icon}
                      backgroundColor={items.backgroundColor}
                    />
                  </Button>
                </Grid>
              ))}
          </Grid>
          <Paper className={classes.PaperCustom} elevation={1}>
            <ButtonGroupCustom
              extra={
                <Stack alignItems="flex-start">
                  <FormControl className={classes.FormControlCustom}>
                    <InputLabel id="demo-simple-select-helper-label">
                      Department
                    </InputLabel>
                    <Select
                      id="demo-simple-select-helper"
                      placeholder="Select Department..."
                      value={departmentValue}
                      label="Department"
                      onChange={handleChange}
                    >
                      <MenuItem value="All">All</MenuItem>
                      {departments?.map((items: any) => (
                        <MenuItem key={items?.id} value={items?.id}>
                          {items?.name}
                        </MenuItem>
                      ))}
                      <MenuItem value="Others">Others</MenuItem>
                    </Select>
                  </FormControl>
                </Stack>
              }
              gridChildren={<GridView />}
              listChildren={<ListView />}
            />
          </Paper>
        </Stack>
      )}
    </Fragment>
  );
};
