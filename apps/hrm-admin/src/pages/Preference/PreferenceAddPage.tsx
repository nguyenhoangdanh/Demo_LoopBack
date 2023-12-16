import {Fragment, useState} from "react";
import {NotFound, useCreate, useNotify, usePermissions,} from "react-admin";
import {PATH, ROLES} from "@/common";
import {useNavigate} from "react-router";
import {Button, Grid, Paper, Stack, TextField, Typography, useTheme,} from "@mui/material";

export const PreferenceAddPage = () => {
    const [code, setCode] = useState<string>("");
    const [value, setValue] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [codeError, setCodeError] = useState<string>("");
    const [valueError, setValueError] = useState<string>("");
    const [descriptionError, setDescriptionError] = useState<string>("");
    const [create] = useCreate();
    const notify = useNotify();
    const navigate = useNavigate();
    const { permissions } = usePermissions();
    const theme = useTheme();

    const handleCreate = () => {
        let isValid = true;

        if (code.trim() === "") {
            setCodeError("Code cannot be empty");
            isValid = false;
        } else {
            setCodeError("");
        }

        if (value.trim()=== "") {
            setValueError("Value cannot be empty");
            isValid = false;
        } else {
            setValueError("");
        }

        if (description.trim() === "") {
            setDescriptionError("Description cannot be empty");
            isValid = false;
        } else {
            setDescriptionError("");
        }

        if (isValid) {
            const postPreference = {
                code,
                value,
                description,
            };

            create(
              PATH.PREFERENCE,
              { data: postPreference },
              {
                  onSuccess: () => {
                      notify("Successful create!", { type: "success" });
                      navigate(`/${PATH.PREFERENCE}`);
                  },
                  onError: () => {
                      notify("Create failed !", { type: "error" });
                  },
              }
            ).then((r) => {});
        }
    };

    return (
      <Fragment>
          {permissions.includes(ROLES.EMPLOYEE) ? (
            <NotFound />
          ) : (
            <Paper
              sx={{ marginTop: theme.spacing(5), marginRight: theme.spacing(2) }}
            >
                <Stack direction="column" padding={theme.spacing(3)}>
                    <Grid container display="flex" justifyContent="space-between">
                        <Grid item xs={6}>
                            <Typography fontWeight={600}>Create Preference</Typography>
                        </Grid>
                    </Grid>
                </Stack>
                <Stack alignItems="center" margin={theme.spacing(3)}>
                    <Grid container spacing={5} width="50%">
                        <Grid item xs={12}>
                            <TextField
                              label="Name"
                              variant="outlined"
                              sx={{ width: "100%" }}
                              onChange={(e) => setCode(e.target.value)}
                              error={!!codeError}
                              helperText={codeError}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                              label="Value"
                              variant="outlined"
                              sx={{ width: "100%" }}
                              onChange={(e) => setValue(e.target.value)}
                              error={!!valueError}
                              helperText={valueError}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                              label="Description"
                              variant="outlined"
                              sx={{ width: "100%" }}
                              onChange={(e) => setDescription(e.target.value)}
                              error={!!descriptionError}
                              helperText={descriptionError}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <Button onClick={handleCreate}>Create</Button>
                        </Grid>
                        <Grid item xs={6}>
                            <Button
                              color="error"
                              onClick={() => navigate(`/${PATH.PREFERENCE}`)}
                            >
                                Back
                            </Button>
                        </Grid>
                    </Grid>
                </Stack>
            </Paper>
          )}
      </Fragment>
    );
};

