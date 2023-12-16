import {NotFound, useNotify, usePermissions} from "react-admin";
import {Button, Grid, Paper, Stack, TextField, Typography, useTheme} from "@mui/material";
import {IPreference, PATH, ROLES} from "@/common";
import {Fragment, useCallback, useEffect, useState} from "react";
import {useDataProvider} from "ra-core";
import {useNavigate, useParams} from "react-router-dom";

export const PreferenceEditPage = () => {
  const {permissions} = usePermissions();
  const {id} = useParams();
  const dataProvider = useDataProvider();
  const theme = useTheme();
  const navigate = useNavigate();
  const notify = useNotify();
  const [code, setCode] = useState<string>("");
  const [value, setValue] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [codeError, setCodeError] = useState<string>("");
  const [valueError, setValueError] = useState<string>("");
  const [descriptionError, setDescriptionError] = useState<string>("");

  const getPreference = useCallback(async () => {
    const restPreference = await dataProvider.send(`${PATH.PREFERENCE}/${id}`, {
      method: "GET"
    });
    const {data} = restPreference as { data: IPreference };
    setCode(data.code);
    setValue(data.value);
    setDescription(data.description);
  }, [dataProvider, id]);

  const handleUpdate = async () => {
    let isValidInput = true;

    if (code.trim() === "") {
      setCodeError("Code cannot be empty");
      isValidInput = false;
    } else {
      setCodeError("");
    }

    if (value.trim() === "") {
      setValueError("Value cannot be empty");
      isValidInput = false;
    } else {
      setValueError("");
    }

    if (description.trim() === "") {
      setDescriptionError("Description cannot be empty");
      isValidInput = false;
    } else {
      setDescriptionError("");
    }

    if (isValidInput) {
      const postPreference = {
        code,
        value,
        description
      };
      const resPreferenceUpdate = await dataProvider.send(
        `${PATH.PREFERENCE}/${id}`,
        {
          method: "PATCH",
          data: postPreference
        }
      );
      if (resPreferenceUpdate) {
        notify("Update preference success", {type: "success"});
        navigate(`/${PATH.PREFERENCE}`);
        return;
      }
      notify("Update preference failed", {type: "error"});
    }
  };

  useEffect(() => {
    getPreference();
  }, [getPreference]);

  return (
    <Fragment>
      {permissions.includes(ROLES.EMPLOYEE) ? (
        <NotFound/>
      ) : (
        <Paper sx={{marginTop: theme.spacing(5), marginRight: theme.spacing(2)}}>
          <Stack direction="column" padding={theme.spacing(3)}>
            <Grid container display="flex" justifyContent="space-between">
              <Grid item xs={6}>
                <Typography fontWeight={600}>
                  Edit Preference: {id}
                </Typography>
              </Grid>
            </Grid>
          </Stack>
          <Stack alignItems="center" margin={theme.spacing(3)}>
            <Grid container spacing={5} width="50%">
              <Grid item xs={12}>
                <TextField
                  label="Code"
                  value={code}
                  variant="outlined"
                  sx={{width: "100%"}}
                  onChange={(e) => setCode(e.target.value)}
                  error={!!codeError}
                  helperText={codeError}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="User value"
                  value={value}
                  variant="outlined"
                  sx={{width: "100%"}}
                  onChange={(e) => setValue(e.target.value)}
                  error={!!valueError}
                  helperText={valueError}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Description"
                  value={description}
                  variant="outlined"
                  sx={{width: "100%"}}
                  onChange={(e) => setDescription(e.target.value)}
                  error={!!descriptionError}
                  helperText={descriptionError}
                />
              </Grid>
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
                <Button color="error" onClick={() => navigate(`/${PATH.PREFERENCE}`)}>
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
