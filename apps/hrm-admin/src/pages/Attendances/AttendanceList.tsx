import { BASE_URL, IUserAttendance, PATH, ROLES } from "@/common";
import { NotFoundData, PostPagination } from "@/components/common";
import FieldWrapper from "@/components/common/FieldWrapper";
import { TableCustom } from "@/components/common/TableCustom";
import { LbProviderGetter } from "@/helpers";
import {
  Autocomplete,
  Box,
  Grid,
  Stack,
  TextField as TextFieldMUI,
  Theme,
  useTheme,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { MobileDateTimePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { Fragment, useCallback, useEffect, useState } from "react";
import {
  DatagridConfigurable,
  ExportButton,
  FunctionField,
  List,
  SelectColumnsButton,
  ShowButton,
  TextField,
  TopToolbar,
  usePermissions,
} from "react-admin";
import { formatTimeToYMD } from "../../utilities/date";

const useStyles = makeStyles((theme: Theme) => {
  return {
    columnBtn: {
      [theme.breakpoints.up("md")]: {
        width: "124%",
      },
    },
  };
});

export const AttendanceList = () => {
  const theme = useTheme();
  const classes = useStyles();
  const { permissions } = usePermissions();
  const id = localStorage.getItem("userId");
  const [attendances, setAttendances] = useState<IUserAttendance[]>([]);
  const [startDate, setStartDate] = useState<string>(
    dayjs().startOf("month").toISOString()
  );
  const [endDate, setEndDate] = useState<string>(dayjs().toISOString());
  const [where, setWhere] = useState({
    and: [
      {
        or: [],
      },
      {
        createdAt: {
          between: [startDate, endDate],
        },
      },
    ],
  });
  const [fullNameArr, setFullNameArr] = useState<
    { id: number; fullName: string }[]
  >([]);

  const handleChangeRequestDate = useCallback(
    (value?: string, flag?: string) => {
      if (value && flag) {
        flag === "start" ? setStartDate(value) : setEndDate(value);
      }
    },
    []
  );

  const getUserAttendances = useCallback(async () => {
    const userAttendances: any = await LbProviderGetter({
      baseUrl: BASE_URL,
    }).send(`${PATH.USERS}/${Number(id)}/${PATH.ATTENDANCE}`, {
      method: "get",
    });
    setAttendances(userAttendances.data.data);
  }, [id]);

  const getFullName = useCallback(async () => {
    const userFullNameResponse: any = await LbProviderGetter({
      baseUrl: BASE_URL,
    }).send(`${PATH.USERS}`, {
      method: "get",
      query: {
        filter: {
          include: [
            {
              relation: "profile",
            },
          ],
        },
      },
    });
    const arr: any = userFullNameResponse?.data?.data?.map(
      (item: { profile: { userId: number; fullName: string } }) => ({
        id: item?.profile?.userId,
        fullName: item?.profile?.fullName,
      })
    );
    setFullNameArr(arr);
  }, []);

  useEffect(() => {
    setWhere((prev) => ({
      and: [
        {
          or: prev.and[0].or ?? [],
        },
        {
          createdAt: {
            between: [startDate, endDate] as any,
          },
        },
      ],
    }));
  }, [startDate, endDate]);

  const handleChangeFullName = useCallback(
    (options: { id: number; fullName: string }[]) => {
      const userQueries =
        options?.map((option) => ({
          userId: option.id,
        })) ?? [];
      setWhere((prev) => ({
        and: [
          {
            or: userQueries as any,
          },
          {
            createdAt: {
              between: prev.and[1].createdAt?.between ?? [],
            },
          },
        ],
      }));
    },
    []
  );

  useEffect(() => {
    getUserAttendances();
    !permissions.includes(ROLES.EMPLOYEE) && getFullName();
  }, [getFullName, getUserAttendances]);

  return (
    <Fragment>
      {permissions.includes(ROLES.EMPLOYEE) ? (
        <Box paddingTop={theme.spacing(1.25)} paddingLeft={theme.spacing(1.25)}>
          {attendances?.length > 0 ? (
            <Stack>
              <TableCustom
                tableKey={1}
                count={attendances.length}
                tableHeader={[
                  "ID",
                  "Check In Time",
                  "Check Out Time",
                  "Location",
                  "Coordinates",
                ]}
                tableBody={attendances.map((item: any) => [
                  item.id,
                  formatTimeToYMD(item.createdAt),
                  formatTimeToYMD(item.checkOutTime),
                  item.address,
                  `${item.coordinates.lat},  ${item.coordinates.lng}`,
                ])}
              />
            </Stack>
          ) : (
            <Box>
              <NotFoundData />
            </Box>
          )}
        </Box>
      ) : (
        <Stack>
          <Grid
            container
            flexDirection="row"
            justifyContent="flex-start"
            alignItems="flex-end"
            spacing={3}
            marginTop={theme.spacing(3)}
          >
            <Grid item xs={12} md={3}>
              <MobileDateTimePicker
                ampm={false}
                value={startDate ? dayjs(startDate) : null}
                sx={{ width: { xs: "60%", md: "100%" } }}
                label="Start Date"
                onAccept={(value) =>
                  handleChangeRequestDate(value?.toISOString(), "start")
                }
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <MobileDateTimePicker
                ampm={false}
                value={endDate ? dayjs(endDate) : null}
                sx={{ width: { xs: "60%", md: "100%" } }}
                label="End Date"
                onAccept={(value) =>
                  handleChangeRequestDate(value?.toISOString(), "end")
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Autocomplete
                multiple
                options={fullNameArr ?? []}
                getOptionLabel={(option) => {
                  return option?.fullName ?? null;
                }}
                sx={{ width: { xs: "60%", md: "100%" } }}
                onChange={(_, value) => handleChangeFullName(value)}
                renderInput={(params) => (
                  <TextFieldMUI {...params} label="Full Name" />
                )}
              />
            </Grid>
          </Grid>
          <List
            actions={
              <TopToolbar>
                <SelectColumnsButton className={classes.columnBtn} />
                <ExportButton />
              </TopToolbar>
            }
            filter={{
              ...where,
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
            }}
            sort={{ field: "id", order: "DESC" }}
            sx={{ padding: theme.spacing(1.25) }}
            pagination={<PostPagination />}
            perPage={100}
          >
            <DatagridConfigurable
              sx={{ "& .column-actions": { textAlign: "center" } }}
              bulkActionButtons={false}
            >
              <TextField source="id" label="ID" />
              <FunctionField
                label="Name"
                render={(record: any) => record?.user?.profile?.fullName}
              />
              <FunctionField
                label="Check In Time"
                render={(record: any) =>
                  `${formatTimeToYMD(record?.createdAt)}`
                }
              />
              <FunctionField
                label="Check Out Time"
                render={(record: any) =>
                  `${formatTimeToYMD(record?.checkOutTime)}`
                }
              />
              <TextField source="address" label="Location" />
              <FieldWrapper label="Actions" source="actions" sortable={false}>
                <ShowButton color="success" />
              </FieldWrapper>
            </DatagridConfigurable>
          </List>
        </Stack>
      )}
    </Fragment>
  );
};
