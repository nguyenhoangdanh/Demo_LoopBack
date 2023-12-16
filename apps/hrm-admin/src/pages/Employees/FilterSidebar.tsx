import {
  FilterList,
  FilterListItem,
  useListFilterContext,
  usePermissions,
} from "react-admin";
import { Button, Card, CardContent, Drawer, Stack } from "@mui/material";
import {
  AccountBoxOutlined,
  EventAvailableOutlined,
  MapsHomeWorkOutlined,
} from "@mui/icons-material";
import { useCallback, useEffect, useState } from "react";
import { BASE_URL, IDepartmentData, IPositionRes, PATH, ROLES } from "@/common";
import { LbProviderGetter } from "@/helpers";
import { IStatusDisplayedUser } from "@/common";
import {
  getCheckedOutEmployees,
  getOffEmployees,
  getWfhEmployees,
  getWorkingEmployees,
} from "@/api";
import _ from "lodash";
import dayjs from "dayjs";
import { makeStyles } from "@mui/styles";

type Filters = {
  [key: string]: (IDepartmentData | IPositionRes | IStatusDisplayedUser)[];
};

type Value = {
  [key: string]: IDepartmentData | IPositionRes | IStatusDisplayedUser;
};

interface FilterSidebarProps {
  setWhere: React.Dispatch<React.SetStateAction<any>>;
  isDrawerOpen: boolean;
  closeDrawer: () => void;
}

const useStyles: any = makeStyles(() => {
  return {
    stackContainer: {
      height: "100%",
    },
    cardContainer: {
      height: "100%",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      overflowY: "auto",
    },
    clearButton: {
      width: "84%",
    },
  };
});

const FilterEmployeesSidebar: React.FC<FilterSidebarProps> = ({
  setWhere,
  isDrawerOpen,
  closeDrawer,
}) => {
  const { permissions } = usePermissions();
  const [departments, setDepartments] = useState<IDepartmentData[]>([]);
  const [positions, setPositions] = useState<IPositionRes[]>([]);

  const classes = useStyles();

  const { setFilters } = useListFilterContext();

  const getPrincipals = useCallback(async (path: string) => {
    const response: any = await LbProviderGetter({
      baseUrl: BASE_URL,
    }).send(path, { method: "get", query: {} });
    const principals = response.data.data;
    switch (path) {
      case PATH.DEPARTMENTS:
        setDepartments(principals);
        break;

      case PATH.POSITIONS:
        setPositions(principals);
        break;

      default:
        break;
    }
  }, []);

  const isSelected = (
    filterName: string,
    value: Value,
    filters: Filters
  ): boolean => {
    const filterValues = filters[filterName] || [];
    return filterValues.some((filter: any) =>
      _.isEqual(filter, value[filterName])
    );
  };

  const toggleFilter = (
    filterName: string,
    value: Value,
    filters: Filters
  ): Filters => {
    const filterValues = filters[filterName] || [];
    const updatedFilter = filterValues.some((filter: any) =>
      _.isEqual(filter, value[filterName])
    )
      ? filterValues.filter((v) => !_.isEqual(v, value[filterName]))
      : [...filterValues, value[filterName]];
    switch (filterName) {
      case "departments":
        const departmentsArray = updatedFilter as IDepartmentData[];
        handleSelectDepartments(departmentsArray);
        break;
      case "positions":
        const positionsArray = updatedFilter as IPositionRes[];
        handleSelectPositions(positionsArray);
        break;
      case "workingStatus":
        const workingStatusArray = updatedFilter as IStatusDisplayedUser[];
        handleSelectWorkingStatus(workingStatusArray);
        break;
      default:
        break;
    }

    return {
      ...filters,
      [filterName]: updatedFilter,
    };
  };

  const getPrincipalByIds = async (principalIds: number[], path: string) => {
    const userIds: { id: number | null }[] = [];
    const response: any = await LbProviderGetter({
      baseUrl: BASE_URL,
    }).send(path, {
      method: "get",
      query: {
        filter: {
          include: ["users"],
          where: { id: { inq: principalIds } },
        },
      },
    });
    const principals = response.data.data;
    for (const principal of principals) {
      const listUserId =
        principal?.users?.map((user: any) => ({ id: user?.id })) ?? [];
      userIds.push(...listUserId);
    }

    return { userIds };
  };

  const handleSelectDepartments = async (options: IDepartmentData[]) => {
    const departmentIds = options.map((department) => department.id);

    // Get userIds by selected departments
    const { userIds } = await getPrincipalByIds(
      departmentIds,
      PATH.DEPARTMENTS
    );

    // Condition if selected departments but no value response
    const conditions =
      options.length && !userIds.length ? [{ id: null }] : userIds;
    setWhere((prev: any) => ({
      and: [
        {
          or: conditions, // For Departments
        },
        {
          or: prev.and[1].or ?? [], // For Positions
        },
        {
          or: prev.and[2].or ?? [], // For Working Status
        },
      ],
    }));
  };

  const handleSelectPositions = async (options: IPositionRes[]) => {
    const positionIds = options.map((position) => position.id);

    // Get userIds by selected positions
    const { userIds } = await getPrincipalByIds(positionIds, PATH.POSITIONS);

    // Condition if selected positions but no value response
    const conditions =
      options.length && !userIds.length ? [{ id: null }] : userIds;
    setWhere((prev: any) => ({
      and: [
        {
          or: prev.and[0].or ?? [], // For Departments
        },
        {
          or: conditions, // For Positions
        },
        {
          or: prev.and[2].or ?? [], // For Working Status
        },
      ],
    }));
  };

  const handleSelectWorkingStatus = async (options: IStatusDisplayedUser[]) => {
    const setOfUserIds = new Set<number>();
    for (const option of options) {
      switch (option) {
        case IStatusDisplayedUser.NO_DATA:
          // Get all attendance today
          const getTodayAttendances = (await LbProviderGetter({
            baseUrl: BASE_URL,
          }).send(`${PATH.ATTENDANCE}`, {
            method: "get",
            query: {
              filter: {
                fields: ["userId"],
                where: {
                  createdAt: {
                    between: [
                      dayjs(new Date()).startOf("day").toString(),
                      dayjs(new Date()).endOf("day").toString(),
                    ],
                  },
                },
              },
            },
          })) as { data: { data: { userId: number }[] } };
          const todayAttendances = Array.from(
            new Set(
              getTodayAttendances.data.data.map(
                (attendance) => attendance.userId
              )
            )
          );

          // Get all userIds
          const getAllUserIds = (await LbProviderGetter({
            baseUrl: BASE_URL,
          }).send(`${PATH.USERS}`, {
            method: "get",
            query: {
              filter: {
                fields: ["id"],
              },
            },
          })) as { data: { data: { id: number }[] } };
          const allUserIds = getAllUserIds.data.data.map((user) => user.id);

          // Get all userIds who have not attendance
          const noDataUserIds = _.difference(allUserIds, todayAttendances);

          noDataUserIds.forEach((id: number) => setOfUserIds.add(id));
          break;
        case IStatusDisplayedUser.OFF:
          const offUserIds = await getOffEmployees();
          offUserIds.forEach((id: number) => setOfUserIds.add(id));
          break;
        case IStatusDisplayedUser.CHECKED_IN:
          const checkedInUserIds = await getWorkingEmployees();
          checkedInUserIds.forEach((id: number) => setOfUserIds.add(id));
          break;
        case IStatusDisplayedUser.CHECKED_OUT:
          const checkedOutUserIds = await getCheckedOutEmployees();
          checkedOutUserIds.forEach((id: number) => setOfUserIds.add(id));
          break;
        case IStatusDisplayedUser.WORK_FROM_HOME:
          const wfhUserIds = await getWfhEmployees();
          wfhUserIds.forEach((id: number) => setOfUserIds.add(id));
          break;
        default:
          break;
      }
    }

    const arrayOfUserIds = Array.from(setOfUserIds, (value) => ({ id: value }));
    const conditions =
      options.length && !arrayOfUserIds.length
        ? [{ id: null }]
        : arrayOfUserIds;

    setWhere((prev: any) => ({
      and: [
        {
          or: prev.and[0].or ?? [], // For Departments
        },
        {
          or: prev.and[1].or ?? [], // For Positions
        },
        {
          or: conditions, // For Working Status
        },
      ],
    }));
  };

  const resetFilter = () => {
    setFilters({}, null, false);
    // Reset filter
    setWhere({
      and: [
        {
          or: [],
        },
        {
          or: [],
        },
        {
          or: [],
        },
      ],
    });
  };

  useEffect(() => {
    if (!permissions.includes(ROLES.EMPLOYEE)) {
      getPrincipals(PATH.DEPARTMENTS);
      getPrincipals(PATH.POSITIONS);
      resetFilter();
    }
  }, []);

  return (
    <Drawer anchor="right" open={isDrawerOpen} onClose={closeDrawer}>
      <Stack className={classes.stackContainer}>
        <Card className={classes.cardContainer}>
          <CardContent>
            {departments.length > 0 && (
              <FilterList label="Departments" icon={<MapsHomeWorkOutlined />}>
                {departments.map((department) => (
                  <FilterListItem
                    key={department.id}
                    label={department.name}
                    value={{ departments: department }}
                    isSelected={(value, filters) =>
                      isSelected("departments", value, filters)
                    }
                    toggleFilter={(value, filters) =>
                      toggleFilter("departments", value, filters)
                    }
                  />
                ))}
              </FilterList>
            )}
            {positions.length > 0 && (
              <FilterList label="Positions" icon={<AccountBoxOutlined />}>
                {positions.map((position) => (
                  <FilterListItem
                    key={position.id}
                    label={position.title}
                    value={{ positions: position }}
                    isSelected={(value, filters) =>
                      isSelected("positions", value, filters)
                    }
                    toggleFilter={(value, filters) =>
                      toggleFilter("positions", value, filters)
                    }
                  />
                ))}
              </FilterList>
            )}
            <FilterList
              label="Working Status"
              icon={<EventAvailableOutlined />}
            >
              {Object.values(IStatusDisplayedUser).map((status) => (
                <FilterListItem
                  key={status}
                  label={status}
                  value={{ workingStatus: status }}
                  isSelected={(value, filters) =>
                    isSelected("workingStatus", value, filters)
                  }
                  toggleFilter={(value, filters) =>
                    toggleFilter("workingStatus", value, filters)
                  }
                />
              ))}
            </FilterList>
          </CardContent>
          <Button
            sx={{ m: 3 }}
            className={classes.clearButton}
            color="primary"
            onClick={resetFilter}
          >
            Clear All
          </Button>
        </Card>
      </Stack>
    </Drawer>
  );
};

export default FilterEmployeesSidebar;
