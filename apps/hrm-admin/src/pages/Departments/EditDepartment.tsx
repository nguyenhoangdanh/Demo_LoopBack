import { PATH, ROLES } from "@/common";
import {
  Box,
  Button,
  Grid,
  Paper,
  Stack,
  TextField,
  Theme,
  Typography,
  useTheme,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
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
    TextField: {
      width: "50%",
      marginTop: theme.spacing(3),
    },
  };
});

export const EditDepartment = () => {
  const [update] = useUpdate();
  const notify = useNotify();
  const params = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const classes = useStyles();
  const { permissions } = usePermissions();

  const [formValue, setFormValue] = useState<{
    name?: string;
    code?: string;
  }>({
    name: "",
    code: "",
  });

  const { data, isLoading } = useGetOne(PATH.DEPARTMENTS, { id: params.id });

  const handleUpdate = useCallback(() => {
    const diffUser = {
      ...formValue,
    };

    update(PATH.DEPARTMENTS, { id: params.id, data: diffUser }).then((rs) => {
      notify("Successful update!", { type: "success" });
      navigate(`/${PATH.DEPARTMENTS}`);
    });
  }, [formValue]);

  useEffect(() => {
    if (!data) {
      return;
    }
    setFormValue((prev: any) => {
      if (data) {
        return {
          ...prev,
          name: data.name,
          code: data.code,
        };
      }
    });

    return () => {};
  }, [data]);

  return (
    <Fragment>
      {permissions.includes(ROLES.EMPLOYEE) ? (
        <NotFound />
      ) : (
        <Paper
          sx={{ marginTop: theme.spacing(3), marginRight: theme.spacing(2) }}
        >
          <Stack direction="column" padding={theme.spacing(3)}>
            <Typography fontWeight={600}>
              Department Edit ID: {params.id}
            </Typography>
            <Form onSubmit={handleUpdate} sanitizeEmptyValues>
              <Stack alignItems="center" margin={theme.spacing(3)}>
                <TextField
                  value={formValue?.name}
                  label="Name"
                  variant="outlined"
                  onChange={(e) =>
                    setFormValue((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  className={classes.TextField}
                />
                <TextField
                  value={formValue?.code}
                  label="Code"
                  variant="outlined"
                  onChange={(e) =>
                    setFormValue((prev) => ({
                      ...prev,
                      code: e.target.value,
                    }))
                  }
                  className={classes.TextField}
                />
              </Stack>
            </Form>
            <Box display="flex" justifyContent="center">
              <Grid container spacing={3} width="50%">
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
                    onClick={() => navigate(`/${PATH.DEPARTMENTS}`)}
                  >
                    Back
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Stack>
        </Paper>
      )}
    </Fragment>
  );
};
