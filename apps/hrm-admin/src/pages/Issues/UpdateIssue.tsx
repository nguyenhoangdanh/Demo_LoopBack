import {
  BASE_URL,
  PATH,
  ROLES,
  IStatus,
  ITag,
  IType,
  IUser,
  IIssues,
  IssueStatus,
  IIssueUpdateForm,
  IssueDialogType,
} from "@/common";
import { LbProviderGetter } from "@/helpers";
import {
  Autocomplete,
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
import { MobileDateTimePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import isEmpty from "lodash/isEmpty";
import isEqual from "lodash/isEqual";
import { Fragment, useCallback, useEffect, useState } from "react";
import { Form, Loading, useNotify, usePermissions } from "react-admin";
import { useParams, useNavigate } from "react-router-dom";
import IssueDialog from "./Components/IssueDialog";

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
    status: {
      width: "50%",
      display: "flex",
      alignItems: "center",
      marginTop: theme.spacing(3),
    },
    btnResetPassword: {
      width: "200px",
    },
  };
});

export const UpdateIssue = () => {
  const notify = useNotify();
  const params = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const { permissions } = usePermissions();
  const classes = useStyles();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [canUpdate, setCanUpdate] = useState<boolean>(true);
  const [open, setOpen] = useState<boolean>(false);
  // ------
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [types, setTypes] = useState<IType[]>([]);
  const [selectedType, setSelectedType] = useState<IType | null>(null);
  const [status, setStatus] = useState<IStatus[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<IStatus | null>(null);
  const [tags, setTags] = useState<ITag[]>([]);
  const [selectedTags, setSelectedTags] = useState<ITag[]>([]);
  const [assignees, setAssignees] = useState<IUser[]>([]);
  const [selectedAssignees, setSelectedAssignees] = useState<IUser[]>([]);
  const [requestDate, setRequestDate] = useState<string>("");
  const [originalData, setOriginalData] = useState<IIssueUpdateForm>({
    title: "",
    description: "",
    selectedType: null,
    selectedStatus: null,
    selectedTags: [],
    selectedAssignees: [],
    requestDate: "",
  });
  const [dialogType, setDialogType] = useState<IssueDialogType>(
    IssueDialogType.BACK
  );
  //-------------------------------------------------------------

  const getIssue = useCallback(async () => {
    const issueData: any = await LbProviderGetter({
      baseUrl: BASE_URL,
    }).send(`${PATH.ISSUES}/${params["id"]}`, {
      method: "get",
      query: {
        filter: {
          include: [
            {
              relation: "tags",
            },
            {
              relation: "type",
            },
            {
              relation: "status",
            },
            {
              relation: "author",
              scope: {
                include: [{ relation: "profile" }],
              },
            },
            {
              relation: "assignees",
              scope: {
                include: [{ relation: "profile" }],
              },
            },
          ],
        },
      },
    });

    if (issueData) {
      updateInitIssue(issueData.data);
    }
  }, []);

  const updateInitIssue = useCallback(async (issueData: IIssues) => {
    if (issueData.title) {
      setTitle(issueData.title);
      originalData.title = issueData.title;
    }
    if (issueData.description) {
      setDescription(issueData.description);
      originalData.description = issueData.description;
    }
    if (issueData.type) {
      setSelectedType(issueData.type);
      originalData.selectedType = issueData.type;
    }
    if (issueData.status) {
      setSelectedStatus(issueData.status);
      originalData.selectedStatus = issueData.status;
      if (
        permissions.includes(ROLES.EMPLOYEE) &&
        (issueData.status?.code === IssueStatus.COMPLETED ||
          issueData.status?.code === IssueStatus.CANCELED)
      ) {
        setCanUpdate(false);
      }
    }
    if (issueData.assignees) {
      setSelectedAssignees(issueData.assignees);
      originalData.selectedAssignees = issueData.assignees;
    }
    if (issueData.tags) {
      setSelectedTags(issueData.tags);
      originalData.selectedTags = issueData.tags;
    }
    if (issueData.requestDate) {
      setRequestDate(issueData.requestDate);
      originalData.requestDate = issueData.requestDate;
    }

    setOriginalData(originalData);
  }, []);

  //-------------------------------------------------------------
  const getTypes = useCallback(async () => {
    const typesRes: any = await LbProviderGetter({
      baseUrl: BASE_URL,
    }).send(`${PATH.TYPES}`, {
      method: "get",
    });
    const typesData: IType[] = typesRes.data;
    setTypes(typesData);
  }, []);

  const getStatus = useCallback(async () => {
    const statusRes: any = await LbProviderGetter({
      baseUrl: BASE_URL,
    }).send(`${PATH.STATUS}`, {
      method: "get",
    });
    const statusData: IType[] = statusRes.data;
    if (permissions.includes(ROLES.EMPLOYEE)) {
      setStatus((_prev) => {
        const canceledStatus = statusData?.find(
          (status) => status.name === "Canceled"
        );
        return canceledStatus ? [canceledStatus] : [];
      });
    } else {
      setStatus(statusData);
    }
  }, []);

  const getTags = useCallback(async () => {
    const tagsRes: any = await LbProviderGetter({
      baseUrl: BASE_URL,
    }).send(`${PATH.TAGS}`, {
      method: "get",
    });
    const tagsData: ITag[] = tagsRes.data;
    setTags(tagsData);
    setIsLoading(false);
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

  const updateIssue = useCallback(async (reqIssue: any) => {
    const issueRes: any = await LbProviderGetter({
      baseUrl: BASE_URL,
    }).send(`${PATH.ISSUES}/${params.id}`, {
      method: "patch",
      data: reqIssue,
    });
    if (issueRes) {
      notify("Successful update!", { type: "success" });
      navigate(`/${PATH.ISSUES}`);
    }
  }, []);

  const handleBack = useCallback(() => {
    const currentData = {
      title,
      description,
      selectedType,
      selectedStatus,
      selectedTags,
      selectedAssignees,
      requestDate,
    };

    if (isEqual(originalData, currentData)) {
      return navigate(`/${PATH.ISSUES}`);
    }

    setDialogType(IssueDialogType.BACK);
    handleOpenDialog();
  }, [
    title,
    description,
    selectedType,
    selectedStatus,
    selectedTags,
    selectedAssignees,
    requestDate,
  ]);

  const handleUpdate = useCallback(async () => {
    const currentData = {
      title,
      description,
      selectedType,
      selectedStatus,
      selectedTags,
      selectedAssignees,
      requestDate,
    };

    const changedData: { [key: string]: any } = Object.entries(currentData)
      .filter(
        ([key, val]) => !isEqual(originalData[key], val) && key in originalData
      )
      .reduce((a, [key, val]) => ({ ...a, [key]: val }), {});

    const reqIssue = Object.entries(changedData).reduce((a, [key, val]) => {
      switch (key) {
        case "title":
          val = val.trim();
          break;
        case "description":
          val = val.trim();
          break;
        case "selectedType":
          key = "typeId";
          val = val?.id;
          break;
        case "selectedStatus":
          key = "statusId";
          val = val?.id;
          break;
        case "selectedTags":
          key = "tags";
          val = val.map((item: ITag) => item.id);
          break;
        case "selectedAssignees":
          key = "assignees";
          val = val.map((item: IUser) => item.id);
      }
      return { ...a, [key]: val };
    }, {});

    if (!isEmpty(reqIssue)) {
      return await updateIssue(reqIssue);
    }

    setDialogType(IssueDialogType.UPDATE);
    handleOpenDialog();
  }, [
    selectedType,
    selectedTags,
    selectedStatus,
    selectedAssignees,
    requestDate,
    title,
    description,
  ]);

  const handleChangeType = useCallback((_: any, value: IType | null) => {
    setSelectedType(value);
  }, []);

  const handleChangeStatus = useCallback((_: any, value: any) => {
    setSelectedStatus(value);
  }, []);
  const handleChangeAssignees = useCallback((_: any, value: any) => {
    setSelectedAssignees(value);
  }, []);

  const handleChangeTags = useCallback((_: any, value: any) => {
    setSelectedTags(value);
  }, []);
  const handleChangeRequestDate = useCallback(
    (value?: string) => {
      if (value) {
        setRequestDate(value);
      }
    },
    [requestDate]
  );

  const handleOpenDialog = useCallback(() => {
    setOpen(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setOpen(false);
  }, []);

  useEffect(() => {
    Promise.all([getIssue(), getUsers(), getTypes(), getStatus(), getTags()]);
  }, []);

  return (
    <Fragment>
      {isLoading ? (
        <Loading />
      ) : (
        <Paper
          sx={{
            marginTop: { xs: "0px", md: theme.spacing(3) },
            marginRight: { xs: "0px", md: theme.spacing(2) },
          }}
        >
          <Stack direction="column" padding={theme.spacing(3)}>
            <Grid container display="flex" justifyContent="space-evenly">
              <Grid item xs={6}>
                <Typography fontWeight={600}>
                  Update Issue ID: {params.id}
                </Typography>
              </Grid>
            </Grid>
            <Form sanitizeEmptyValues>
              <Stack
                alignItems="center"
                margin={{ xs: "0px", md: theme.spacing(3) }}
              >
                <TextField
                  value={title}
                  label="Title"
                  variant="outlined"
                  onChange={(e) => setTitle(e.target.value)}
                  className={classes.textField}
                />
                <TextField
                  value={description}
                  label="Description"
                  variant="outlined"
                  onChange={(e) => setDescription(e.target.value)}
                  className={classes.textField}
                />
                <Autocomplete
                  value={selectedType}
                  onChange={handleChangeType}
                  options={types}
                  className={classes.autoCompleteCustom}
                  getOptionLabel={(option) => option.name}
                  renderInput={(params: any) => (
                    <TextField {...params} variant="outlined" label="Type" />
                  )}
                />
                <Autocomplete
                  value={selectedStatus}
                  onChange={handleChangeStatus}
                  options={status}
                  className={classes.autoCompleteCustom}
                  getOptionLabel={(option) => option.name}
                  renderInput={(params: any) => (
                    <TextField {...params} variant="outlined" label="Status" />
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
                  className={classes.autoCompleteCustom}
                  renderInput={(params: any) => (
                    <TextField {...params} variant="outlined" label="Assign" />
                  )}
                />
                <Autocomplete
                  multiple
                  value={selectedTags}
                  onChange={handleChangeTags}
                  options={
                    tags.filter(
                      (tag) =>
                        !selectedTags.some((obj) => {
                          return tag.id === obj.id;
                        })
                    ) ?? []
                  }
                  getOptionLabel={(option) => {
                    return option?.name ?? "N/A";
                  }}
                  className={classes.autoCompleteCustom}
                  renderInput={(params: any) => (
                    <TextField {...params} variant="outlined" label="Tags" />
                  )}
                />
                <MobileDateTimePicker
                  value={dayjs(requestDate)}
                  defaultValue={requestDate ? dayjs(requestDate) : dayjs()}
                  className={classes.autoCompleteCustom}
                  label="Request Date"
                  onAccept={(value) =>
                    handleChangeRequestDate(value?.toISOString())
                  }
                />
              </Stack>
            </Form>
            <Box display="flex" justifyContent="center">
              <Grid
                container
                spacing={1}
                width={{ xs: "100%", md: "50%" }}
                paddingTop={theme.spacing(3)}
              >
                <Grid item xs={6}>
                  <Button
                    disabled={!canUpdate}
                    variant="contained"
                    color="primary"
                    disableElevation
                    onClick={handleUpdate}
                  >
                    Update
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button color="error" onClick={handleBack}>
                    Back
                  </Button>
                </Grid>

                <IssueDialog
                  open={open}
                  handleClose={handleCloseDialog}
                  dialogType={dialogType}
                />
              </Grid>
            </Box>
          </Stack>
        </Paper>
      )}
    </Fragment>
  );
};
