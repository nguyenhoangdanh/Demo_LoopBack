import { BASE_URL, IType, IUser, IssueStatus, PATH, ROLES } from "@/common";
import { LbProviderGetter } from "@/helpers";
import {
  Button,
  Grid,
  Paper,
  TextField,
  Typography,
  Stack,
  useTheme,
  Autocomplete,
  Theme,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { MobileDateTimePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { Fragment, useCallback, useEffect, useState } from "react";
import { useNotify, usePermissions } from "react-admin";
import { useNavigate } from "react-router";

const useStyles: any = makeStyles((theme: Theme) => {
  return {
    textField: {
      [theme.breakpoints.down("md")]: {
        width: "100%",
      },
      [theme.breakpoints.up("md")]: {
        width: "50%",
      },
      marginTop: theme.spacing(3),
    },
    autoCompleteCustom: {
      [theme.breakpoints.down("md")]: {
        width: "100%",
      },
      [theme.breakpoints.up("md")]: {
        width: "50%",
      },
      marginTop: theme.spacing(3),
    },
  };
});

export const CreateIssue = () => {
  const { permissions } = usePermissions();
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [requestDate, setRequestDate] = useState<string>("");
  const [types, setTypes] = useState<IType[]>([]);
  const [selectedType, setSelectedType] = useState<IType | null>(null);
  const [assignees, setAssignees] = useState<IUser[]>([]);
  const [selectedAssignees, setSelectedAssignees] = useState<IUser[]>([]);
  const notify = useNotify();
  const navigate = useNavigate();
  const theme = useTheme();

  const createIssue = useCallback(async (postIssue: any) => {
    return await LbProviderGetter({
      baseUrl: BASE_URL,
    }).send(`${PATH.ISSUES}`, {
      method: "post",
      data: postIssue,
    });
  }, []);

  const handleCreate = async () => {
    if (title && requestDate) {
      const postIssue = {
        title,
        description,
        requestDate,
        typeId: selectedType?.id,
        statusId: IssueStatus.DEFAULT_STATUS_ID,
        assigneeIds: selectedAssignees.map((item) => item.id),
      };
      const createIssueRes = await createIssue(postIssue);
      if (createIssueRes) {
        notify("Successful create!", { type: "success" });
        navigate(`/${PATH.ISSUES}`);
      }
    } else {
      notify("Missing field!", { type: "error" });
    }
  };
  const handleChangeType = useCallback((_: any, value: IType | null) => {
    setSelectedType(value);
  }, []);
  const handleChangeRequestDate = useCallback((value?: string) => {
    if (value) {
      setRequestDate(value);
    }
  }, []);
  const handleChangeAssignees = useCallback((_: any, value: any) => {
    setSelectedAssignees(value);
  }, []);

  const getTypes = useCallback(async () => {
    const typesRes: any = await LbProviderGetter({
      baseUrl: BASE_URL,
    }).send(`${PATH.TYPES}`, {
      method: "get",
    });
    const typesData: IType[] = typesRes.data;
    setTypes(typesData);
  }, []);

  const getUsers = useCallback(async () => {
    const assigneesRes: any = permissions.includes(ROLES.EMPLOYEE)
      ? await LbProviderGetter({
          baseUrl: BASE_URL,
        }).send(`${PATH.USERS}/higher-roles`, {
          method: "get",
        })
      : await LbProviderGetter({
          baseUrl: BASE_URL,
        }).send(`${PATH.USERS}`, {
          method: "get",
          query: {
            filter: {
              include: [
                {
                  relation: "profile",
                },
                {
                  relation: "roles",
                },
              ],
            },
          },
        });

    setAssignees(assigneesRes?.data?.data);
  }, []);

  useEffect(() => {
    Promise.all([getTypes(), getUsers()]);
  }, []);

  return (
    <Fragment>
      <Paper
        sx={{ margin: `${theme.spacing(5)} ${theme.spacing(3.75)}` }}
        elevation={3}
      >
        <Stack width="100%" direction="column" padding={theme.spacing(6.25)}>
          <Typography fontSize={25} fontWeight={600}>
            Create Issue
          </Typography>
          <Stack alignItems="center">
            <TextField
              error={title ? false : true}
              label="Title"
              helperText={title ? "" : "Title must not empty."}
              variant="outlined"
              sx={{ width: "50%", marginTop: theme.spacing(3) }}
              onChange={(e) => setTitle(e.target.value)}
            />

            <TextField
              label="Description"
              variant="outlined"
              sx={{ width: "50%", marginTop: theme.spacing(3) }}
              onChange={(e) => setDescription(e.target.value)}
            />
            <Autocomplete
              value={selectedType}
              onChange={handleChangeType}
              options={types}
              sx={{ width: "50%", marginTop: theme.spacing(3) }}
              getOptionLabel={(option) => {
                return option?.name ?? null;
              }}
              renderInput={(params: any) => (
                <TextField {...params} variant="outlined" label="Type" />
              )}
            />
            <Autocomplete
              multiple
              value={selectedAssignees}
              onChange={handleChangeAssignees}
              options={
                assignees.filter(
                  (assignee) =>
                    !selectedAssignees.some((obj) => {
                      return assignee.id === obj.id;
                    })
                ) ?? []
              }
              getOptionLabel={(option) => {
                return option?.profile?.fullName ?? "N/A";
              }}
              sx={{ width: "50%", marginTop: theme.spacing(3) }}
              renderInput={(params: any) => (
                <TextField {...params} variant="outlined" label="Assign" />
              )}
            />
            <MobileDateTimePicker
              slotProps={{
                textField: {
                  helperText: requestDate ? "" : "Request date is required!",
                },
              }}
              value={dayjs(requestDate)}
              sx={{ width: "50%", marginTop: theme.spacing(3) }}
              label="Request Date"
              onAccept={(value) =>
                handleChangeRequestDate(value?.toISOString())
              }
            />

            <Grid
              container
              spacing={5}
              marginTop={theme.spacing(5)}
              width="50%"
            >
              <Grid item xs={6} paddingTop={"0px !important"}>
                <Button
                  disabled={title === "" || requestDate === ""}
                  onClick={handleCreate}
                >
                  Create
                </Button>
              </Grid>
              <Grid item xs={6} paddingTop={"0px !important"}>
                <Button
                  color="error"
                  onClick={() => navigate(`/${PATH.ISSUES}`)}
                >
                  Back
                </Button>
              </Grid>
            </Grid>
          </Stack>
        </Stack>
      </Paper>
    </Fragment>
  );
};
