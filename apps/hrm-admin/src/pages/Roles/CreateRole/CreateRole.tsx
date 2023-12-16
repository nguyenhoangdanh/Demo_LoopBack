import { EMPLOYEES_STATUS, PATH, ROLES } from "@/common";
import {
  Button,
  Grid,
  Paper,
  TextField,
  Typography,
  Stack,
  useTheme,
  Box,
  ButtonGroup,
  Theme,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { get } from "lodash";
import { Fragment, useState } from "react";
import { NotFound, useCreate, useNotify, usePermissions } from "react-admin";
import { useNavigate } from "react-router";

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

export const CreateRole = () => {
  const [name, setName] = useState<string>("");
  const [identifier, setIdentifier] = useState<string>("");
  const [description, setDescription] = useState<string>();
  const [priority, setPriority] = useState<number>();
  const classes = useStyles();
  const [activeStatus, setActiveStatus] = useState<string>(
    EMPLOYEES_STATUS.ACTIVATED
  );
  const [create] = useCreate();
  const notify = useNotify();
  const navigate = useNavigate();
  const theme = useTheme();
  const { permissions } = usePermissions();

  const handleCreate = () => {
    const postRole = {
      name,
      identifier,
      description,
      priority,
      status: activeStatus,
    };

    if (!description) {
      delete postRole.description;
    }

    create(
      PATH.ROLES,
      { data: postRole },
      {
        onSuccess: () => {
          notify("Successful create!", { type: "success" });
          navigate(`/${PATH.ROLES}`);
        },
        onError: () => {
          notify("Create failed !", { type: "error" });
        },
      }
    );
  };

  return (
    <Fragment>
      {permissions.includes(ROLES.EMPLOYEE) ? (
        <NotFound />
      ) : (
        <Paper
          sx={{ margin: `${theme.spacing(5)} ${theme.spacing(3.75)}` }}
          elevation={3}
        >
          <Stack width="100%" direction="column" padding={theme.spacing(6.25)}>
            <Typography fontSize={25} fontWeight={600}>
              Create Role
            </Typography>
            <Stack display="flex" alignItems="center">
              <Grid container spacing={5} width="50%">
                <Grid item xs={12}>
                  <TextField
                    label="Name (E.g. Admin)"
                    variant="outlined"
                    sx={{ width: "100%" }}
                    onChange={(e) => setName(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Identifier (E.g. 998-admin)"
                    variant="outlined"
                    sx={{ width: "100%" }}
                    onChange={(e) => setIdentifier(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Description"
                    variant="outlined"
                    sx={{ width: "100%" }}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Priority  (E.g. 998)"
                    variant="outlined"
                    sx={{ width: "100%" }}
                    onChange={(e) => setPriority(Number(e.target.value))}
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
                      sx={{ width: "100%" }}
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
                marginTop={theme.spacing(5)}
                width="50%"
              >
                <Grid item xs={6} paddingTop={"0px !important"}>
                  <Button onClick={handleCreate}>Create</Button>
                </Grid>
                <Grid item xs={6} paddingTop={"0px !important"}>
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
