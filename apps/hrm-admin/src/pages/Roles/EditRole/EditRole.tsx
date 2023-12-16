import {
  BASE_URL,
  EMPLOYEES_STATUS,
  IDepartmentSelection,
  IPositionRes,
  IRole,
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
  useGetOne,
  useNotify,
  usePermissions,
  useUpdate,
} from "react-admin";
import { useParams, useNavigate } from "react-router-dom";

const useStyles: any = makeStyles((theme: Theme) => {
  return {
    textField: {
      width: "50%",
      marginTop: theme.spacing(3),
    },
    status: {
      width: "100%",
      display: "flex",
      alignItems: "center",
      flexDirection: "column",
    },
    btnResetPassword: {
      width: "200px",
    },
  };
});

export const EditRole = () => {
  const [update] = useUpdate();
  const notify = useNotify();
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const classes = useStyles();
  const [activeStatus, setActiveStatus] = useState<string>();
  const { permissions } = usePermissions();
  const [positions, setPositions] = useState<IPositionRes[]>([]);
  const [positionArr, setPositionArr] = useState<IPositionRes[]>([]);
  const [roles, setRoles] = useState([]);
  const [openResetPassword, setOpenResetPassword] = useState(false);
  const [name, setName] = useState<string>("");
  const [identifier, setIdentifier] = useState<string>("");
  const [description, setDescription] = useState<string>();
  const [priority, setPriority] = useState<string>("");

  const fetchRoleInfo = useCallback(async () => {
    const resRole = await LbProviderGetter({ baseUrl: BASE_URL }).send(
      `${PATH.ROLES}/${id}`,
      {
        method: "get",
      }
    );
    const { data } = resRole as { data: IRole };
    setName(data.name);
    setIdentifier(data.identifier);
    setDescription(data.description);
    setPriority(data.priority.toString());
    setActiveStatus(data.status);
  }, []);

  const handleUpdate = useCallback(async () => {
    const postRole = {
      name,
      identifier,
      description,
      priority: Number(priority),
      status: activeStatus,
    };

    if (!description) {
      delete postRole.description;
    }

    const resRoleUpdate = await LbProviderGetter({ baseUrl: BASE_URL }).send(
      `${PATH.ROLES}/${id}`,
      {
        method: "patch",
        data: postRole,
      }
    );
    if (resRoleUpdate) {
      navigate(`/${PATH.ROLES}`);
    }
  }, [name, identifier, description, priority, activeStatus]);

  useEffect(() => {
    fetchRoleInfo();
  }, []);

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
                <Typography fontWeight={600}>Edit Role: {id}</Typography>
              </Grid>
            </Grid>

            <Stack alignItems="center" margin={theme.spacing(3)}>
              <Grid container spacing={5} width="50%">
                <Grid item xs={12}>
                  <TextField
                    label="Name (E.g. Admin)"
                    value={name}
                    variant="outlined"
                    sx={{ width: "100%" }}
                    onChange={(e) => setName(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Identifier (E.g. 998-admin)"
                    value={identifier}
                    variant="outlined"
                    sx={{ width: "100%" }}
                    onChange={(e) => setIdentifier(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Description"
                    value={description ?? ""}
                    variant="outlined"
                    sx={{ width: "100%" }}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Priority (E.g. 998)"
                    value={priority}
                    variant="outlined"
                    sx={{ width: "100%" }}
                    onChange={(e) => setPriority(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Box className={classes.status}>
                    <Box
                      sx={{
                        marginRight: theme.spacing(5),
                        marginBottom: theme.spacing(3),
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
                </Grid>
              </Grid>
              <Grid
                container
                spacing={5}
                width="50%"
                paddingTop={theme.spacing(3)}
              >
                <Grid item xs={6}>
                  <Button
                    variant="contained"
                    color="primary"
                    disableElevation
                    onClick={handleUpdate}
                  >
                    Update
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    color="error"
                    onClick={() => navigate(`/${PATH.ROLES}`)}
                  >
                    Back
                  </Button>
                </Grid>
              </Grid>
            </Stack>
          </Stack>
        </Paper>
      )}
    </Fragment>
  );
};
