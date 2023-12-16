import {
  BASE_URL,
  EMPLOYEES_STATUS,
  IDepartmentSelection,
  IPositionRes,
  IPreferences,
  IRoleSelection,
  PATH,
  ROLES,
} from "@/common";
import { ResetPassword } from "@/components/common/ResetPassword";
import { LbProviderGetter } from "@/helpers";
import { formatTimeToYMD } from "@/utilities";
import {
  Autocomplete,
  Box,
  Button,
  ButtonGroup,
  Grid,
  Paper,
  Stack,
  TextField,
  Theme,
  Typography,
  useTheme,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import get from "lodash/get";
import { Fragment, useCallback, useEffect, useState } from "react";
import {
  Form,
  NotFound,
  useCreate,
  useDataProvider,
  useDelete,
  useDeleteMany,
  useGetOne,
  useNotify,
  usePermissions,
  useUpdate,
  useUpdateMany,
} from "react-admin";
import { useParams, useNavigate } from "react-router-dom";

const useStyles: any = makeStyles((theme: Theme) => {
  return {
    textField: {
      width: "50%",
      marginTop: theme.spacing(3),
    },
    status: {
      width: "50%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      marginTop: theme.spacing(3),
    },
    btnResetPassword: {
      width: "200px",
    },
  };
});

export const EditUser = () => {
  const [update] = useUpdate();
  const [create] = useCreate();
  const [deleteOne] = useDelete();
  const [updateMany] = useUpdateMany();
  const [deleteMany] = useDeleteMany();
  const notify = useNotify();
  const params = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const classes = useStyles();
  const dataProvider = useDataProvider();
  const [activeStatus, setActiveStatus] = useState<string>(
    EMPLOYEES_STATUS.UNKNOWN,
  );
  const { permissions } = usePermissions();
  const [departments, setDepartments] = useState<IDepartmentSelection[]>([]);
  const [departmentsArr, setDepartmentsArr] = useState<IDepartmentSelection[]>(
    [],
  );
  const [preferences, setPreferences] = useState<IPreferences[]>([]);
  const [preferenceArr, setPreferenceArr] = useState<IPreferences[]>([]);
  const [positions, setPositions] = useState<IPositionRes[]>([]);
  const [positionArr, setPositionArr] = useState<IPositionRes[]>([]);
  const [roles, setRoles] = useState<IRoleSelection[]>([]);
  const [roleArr, setRoleArr] = useState<IRoleSelection[]>([]);
  const [openResetPassword, setOpenResetPassword] = useState(false);

  const [currentPreferenceArr, setCurrentPreferenceArr] = useState<
    IPreferences[]
  >([]);

  //-------------------------------------------------------------
  const { data: users } = useGetOne(PATH.USERS, {
    id: `${params.id}`,
    meta: {
      filter: {
        include: [
          "profile",
          "roles",
          "departments",
          "positions",
          "preferences",
        ],
      },
    },
  });

  const toggleResetPassword = useCallback((option: { mode: boolean }) => {
    setOpenResetPassword(option.mode);
  }, []);

  //-------------------------------------------------------------
  const getDepartments = useCallback(async () => {
    const userDepartments: any = await LbProviderGetter({
      baseUrl: BASE_URL,
    }).send(`${PATH.DEPARTMENTS}`, {
      method: "get",
    });
    setDepartments(userDepartments.data.data);
  }, []);

  const getUserDepartments = useCallback(() => {
    if (users !== undefined && users.departments !== undefined) {
      setDepartmentsArr(users?.departments);
    }
  }, [users]);

  //-------------------------------------------------------------
  const getPositions = useCallback(async () => {
    const userPositions: any = await LbProviderGetter({
      baseUrl: BASE_URL,
    }).send(`${PATH.POSITIONS}`, {
      method: "get",
    });
    setPositions(userPositions.data.data);
  }, []);

  const getUserPositions = useCallback(() => {
    if (users !== undefined && users.positions !== undefined) {
      setPositionArr(users?.positions);
    }
  }, [users]);

  //-------------------------------------------------------------
  const getRoles = useCallback(async () => {
    const userRoles: any = await LbProviderGetter({
      baseUrl: BASE_URL,
    }).send(`${PATH.ROLES}`, {
      method: "get",
    });
    setRoles(userRoles.data.data);
  }, []);

  const getUserRoles = useCallback(() => {
    if (users !== undefined && users.roles !== undefined) {
      setRoleArr(users?.roles);
    }
  }, [users]);
  //-------------------------------------------------------------
  const getPreferences = useCallback(async () => {
    const userPreferences: any = await LbProviderGetter({
      baseUrl: BASE_URL,
    }).send(`${PATH.PREFERENCE}`, {
      method: "get",
    });
    setPreferences(userPreferences.data);
  }, []);

  const getUserPreferences = useCallback(() => {
    if (users !== undefined && users.preferences !== undefined) {
      setPreferenceArr(users?.preferences);
      setCurrentPreferenceArr(users?.preferences);
    }
  }, [users]);

  //-------------------------------------------------------------
  const [formUser, setFormUser] = useState<{
    status?: string;
    userType?: string;
  }>({
    status: "",
    userType: "",
  });

  const [formProfile, setFormProfile] = useState<{
    fullName?: string;
    faceImgUrl?: string;
  }>({
    fullName: "",
    faceImgUrl: "",
  });

  const handleUpdate = useCallback(() => {
    console.log("departments", departmentsArr);
    console.log("roleArr", roleArr);
    console.log("preferenceArr", preferenceArr);

    const diffUser = {
      ...formUser,
      status: activeStatus,
      roles: roleArr.map((role: { identifier: string }) => role.identifier),
      departments: departmentsArr.map(
        (department: { id: number }) => department.id,
      ),
      positions: positionArr.map((position: { id: number }) => position.id),
    };

    const diffFormProfile = {
      ...formProfile,
    };

    //Logic to update preference of employee

    const currentPreferenceIds = currentPreferenceArr.map(
      (preference: { id: number }) => preference.id,
    );

    const afterPreferenceIds = preferenceArr.map(
      (preference: { id: number }) => preference.id,
    );

    let idsAdded: number[] = afterPreferenceIds;
    let idsRemoved: number[] = [];

    if (afterPreferenceIds.length) {
      for (const init of currentPreferenceIds) {
        for (const updated of afterPreferenceIds) {
          if (init === updated) {
            idsAdded.splice(idsAdded.indexOf(updated), 1);
            break;
          }
          if (!idsRemoved.includes(init)) {
            idsRemoved.push(init);
          }
        }
      }
    } else {
      idsRemoved = currentPreferenceIds;
    }

    console.log("idsAdded", idsAdded);
    console.log("idsRemoved", idsRemoved);

    if (idsAdded.length) {
      idsAdded.forEach(async (idAdded) => {
        await dataProvider.send(
          `${PATH.USERS}/${params.id}/${PATH.PREFERENCE}/${idAdded}`,
          {
            method: "POST",
          },
        );
      });

      console.log("----------------------------------");
      console.log("post was called");
    }

    if (idsRemoved.length) {
      idsRemoved.forEach(async (idRemoved) => {
        await dataProvider.send(
          `${PATH.USERS}/${params.id}/${PATH.PREFERENCE}/${idRemoved}`,
          {
            method: "DELETE",
          },
        );
      });

      console.log("----------------------------------");
      console.log("delete was called");
    }

    //-----------------------------------------------------

    update(PATH.USERS, { id: params.id, data: diffUser }).then((rs) => {
      notify("Successful update!", { type: "success" });
    });

    update(PATH.USERS, {
      id: `${params.id}/${PATH.PROFILE}`,
      data: diffFormProfile,
    }).then((rs) => {
      notify("Successful update!", { type: "success" });
    });
  }, [
    formUser,
    formProfile,
    activeStatus,
    positionArr,
    departmentsArr,
    roleArr,
    preferenceArr,
  ]);

  const handleChangeDepartments = useCallback((value: any) => {
    setDepartmentsArr(value);
  }, []);

  const handleChangePositions = useCallback((value: any) => {
    setPositionArr(value);
  }, []);

  const handleChangeRoles = useCallback((value: any) => {
    setRoleArr(value);
  }, []);

  const handleChangePreferences = useCallback((value: any) => {
    setPreferenceArr(value);
  }, []);

  useEffect(() => {
    getDepartments();
    getPositions();
    getRoles();
    getPreferences();
  }, []);

  useEffect(() => {
    setFormProfile((prev: any) => ({
      ...prev,
      fullName: users?.profile?.fullName ?? "",
      faceImgUrl: users?.profile?.faceImgUrl ?? "",
    }));

    setFormUser((prev: any) => ({
      ...prev,
      status: users?.status ?? "",
      userType: users?.userType ?? "",
    }));

    setActiveStatus(users?.status ?? "");
    getUserPositions();
    getUserDepartments();
    getUserRoles();
    getUserPreferences();
    return () => {};
  }, [users]);

  return (
    <Fragment>
      {permissions.includes(ROLES.EMPLOYEE) ? (
        <NotFound />
      ) : (
        <Paper
          sx={{ marginTop: theme.spacing(3), marginRight: theme.spacing(2) }}
        >
          <Stack direction="column" padding={theme.spacing(3)}>
            <Grid container display="flex" justifyContent="space-between">
              <Grid item xs={6}>
                <Typography fontWeight={600}>
                  Edit Employees ID: {params.id}
                </Typography>
              </Grid>
              <Grid item xs={6} display="flex" justifyContent="flex-end">
                <Button
                  onClick={() => toggleResetPassword({ mode: true })}
                  className={classes.btnResetPassword}
                  color="warning"
                >
                  Reset Password
                </Button>
              </Grid>
              <ResetPassword
                onClose={() => toggleResetPassword({ mode: false })}
                open={openResetPassword}
                userId={users?.profile?.userId}
              />
            </Grid>
            <Form onSubmit={handleUpdate} sanitizeEmptyValues>
              <Stack
                alignItems="center"
                margin={theme.spacing(3)}
                width={"100%"}
              >
                {users && (
                  <Fragment>
                    <TextField
                      value={formProfile?.fullName}
                      label="Name"
                      variant="outlined"
                      className={classes.textField}
                      onChange={(e) =>
                        setFormProfile((prev) => ({
                          ...prev,
                          fullName: e.target.value,
                        }))
                      }
                    />
                    <TextField
                      value={formProfile?.faceImgUrl}
                      label="Face Image Url"
                      variant="outlined"
                      disabled
                      className={classes.textField}
                      onChange={(e) =>
                        setFormProfile((prev) => ({
                          ...prev,
                          faceImgUrl: e.target.value,
                        }))
                      }
                    />
                  </Fragment>
                )}
                <TextField
                  value={formUser?.userType}
                  label="User Type"
                  variant="outlined"
                  className={classes.textField}
                  onChange={(e) =>
                    setFormUser((prev) => ({
                      ...prev,
                      userType: e.target.value,
                    }))
                  }
                />
                <TextField
                  value={formatTimeToYMD(users?.lastLoginAt)}
                  label="Last Login"
                  variant="outlined"
                  disabled
                  className={classes.textField}
                />
                <Autocomplete
                  multiple
                  value={departmentsArr ?? []}
                  onChange={(_, value) => handleChangeDepartments(value)}
                  options={departments}
                  sx={{ width: "50%", marginTop: theme.spacing(3) }}
                  getOptionLabel={(option) => {
                    return option?.name ?? null;
                  }}
                  renderInput={(params: any) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      label="Departments"
                    />
                  )}
                />
                <Autocomplete
                  multiple
                  value={positionArr ?? []}
                  onChange={(_, value) => handleChangePositions(value)}
                  options={positions}
                  getOptionLabel={(option) => {
                    return option?.title ?? null;
                  }}
                  sx={{ width: "50%", marginTop: theme.spacing(3) }}
                  renderInput={(params: any) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      label="Positions"
                    />
                  )}
                />
                <Autocomplete
                  multiple
                  value={roleArr ?? []}
                  onChange={(_, value) => handleChangeRoles(value)}
                  options={roles}
                  getOptionLabel={(option) => {
                    return option?.name ?? "N/A";
                  }}
                  sx={{ width: "50%", marginTop: theme.spacing(3) }}
                  renderInput={(params: any) => (
                    <TextField {...params} variant="outlined" label="Roles" />
                  )}
                />
                <Autocomplete
                  multiple
                  value={preferenceArr ?? []}
                  onChange={(_, value) => handleChangePreferences(value)}
                  options={preferences}
                  sx={{ width: "50%", marginTop: theme.spacing(3) }}
                  getOptionLabel={(option) => {
                    return option?.code ?? null;
                  }}
                  renderInput={(params: any) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      label="Preferences"
                    />
                  )}
                />
                <Box className={classes.status}>
                  <Box
                    sx={{
                      marginRight: theme.spacing(5),
                      marginBottom: theme.spacing(1),
                    }}
                  >
                    Status
                  </Box>
                  <ButtonGroup
                    variant="contained"
                    orientation="horizontal"
                    sx={{ width: "100%", boxShadow: "none" }}
                  >
                    {EMPLOYEES_STATUS.SCHEMES.map((item: string) => (
                      <Button
                        key={item}
                        color={activeStatus === item ? "primary" : "inherit"}
                        onClick={() => setActiveStatus(item)}
                        sx={{ width: "100%", fontSize: "10px" }}
                      >
                        {get(EMPLOYEES_STATUS.NAME, item)}
                      </Button>
                    ))}
                  </ButtonGroup>
                </Box>
                <Box
                  display="flex"
                  justifyContent="center"
                  width={"50%"}
                  marginTop={theme.spacing(5)}
                >
                  <Button
                    variant="contained"
                    color="primary"
                    disableElevation
                    onClick={handleUpdate}
                    sx={{ marginRight: theme.spacing(2) }}
                  >
                    Update
                  </Button>
                  <Button
                    color="error"
                    onClick={() => navigate(`/${PATH.USERS}`)}
                    sx={{ marginLeft: theme.spacing(2) }}
                  >
                    Back
                  </Button>
                </Box>
              </Stack>
            </Form>
          </Stack>
        </Paper>
      )}
    </Fragment>
  );
};
