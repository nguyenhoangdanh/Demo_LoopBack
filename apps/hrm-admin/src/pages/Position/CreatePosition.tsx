import { PATH, ROLES } from "@/common";
import {
  Button,
  Grid,
  Paper,
  TextField,
  Typography,
  Stack,
  useTheme,
} from "@mui/material";
import { Fragment, useState } from "react";
import { NotFound, useCreate, useNotify, usePermissions } from "react-admin";
import { useNavigate } from "react-router";

export const CreatePosition = () => {
  const [title, setTitle] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const { permissions } = usePermissions();
  const [create] = useCreate();
  const notify = useNotify();
  const navigate = useNavigate();
  const theme = useTheme();

  const handleCreate = () => {
    const postPosition = {
      title,
      code,
    };

    create(
      PATH.POSITIONS,
      { data: postPosition },
      {
        onSuccess: () => {
          notify("Successful create!", { type: "success" });
          navigate(`/${PATH.POSITIONS}`);
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
              Create Position
            </Typography>
            <Stack display="flex" alignItems="center">
              <Grid container spacing={5} width="50%">
                <Grid item xs={12}>
                  <TextField
                    label="Title"
                    variant="outlined"
                    sx={{ width: "100%" }}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Code"
                    variant="outlined"
                    sx={{ width: "100%" }}
                    onChange={(e) => setCode(e.target.value)}
                  />
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
                    onClick={() => navigate(`/${PATH.POSITIONS}`)}
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
