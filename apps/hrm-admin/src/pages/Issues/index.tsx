import AvatarIcon from "@/assets/image/avatar-modification.svg";
import { BASE_URL, IStatus, IssueStatus, PATH, ROLES } from "@/common";
import { ActionsField, PostPagination } from "@/components/common";
import FieldWrapper from "@/components/common/FieldWrapper";
import { LbProviderGetter } from "@/helpers";
import { formatTimeToYMD } from "@/utilities";
import TagIcon from "@mui/icons-material/Tag";
import {
  Box,
  Button,
  CardMedia,
  Grid,
  Stack,
  Theme,
  useTheme,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { Fragment, useCallback, useEffect, useState } from "react";
import {
  CreateButton,
  DatagridConfigurable,
  ExportButton,
  FunctionField,
  List,
  SelectColumnsButton,
  TextField,
  TopToolbar,
  usePermissions,
} from "react-admin";
import Assignees from "./Assignee/Assignee";
import MultiTags from "./Components/MultiTags";
import Selection from "./Components/Selection";
import SingleTag from "./Components/SingleTag";
import DayOffEmployee from "./DayOffEmployee/DayOffEmployee";
import FilterIssuesSidebar from "./FilterSidebar";
import { CreateTag } from "./Tags/ManageTag";

export interface IWhere {
  authorId?: string;
  typeId?: number;
  statusId?: number;
  and: [
    {
      or: {
        id: number | null;
      }[];
    }
  ];
}

const useStyles = makeStyles((theme: Theme) => {
  return {
    columnBtn: {
      [theme.breakpoints.up("md")]: {
        width: "124%",
      },
    },
  };
});

export default function ListIssues() {
  const classes = useStyles();
  const theme = useTheme();
  const { permissions } = usePermissions();
  const id = localStorage.getItem("userId");
  const initWhere = permissions?.includes(ROLES.EMPLOYEE)
    ? ({
        authorId: id,
      } as IWhere)
    : ({} as IWhere);
  const [where, setWhere] = useState<IWhere>(initWhere);
  const [openTag, setOpenTag] = useState(false);
  const [status, setStatus] = useState<IStatus[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleDrawerOpen = useCallback(() => {
    setIsDrawerOpen(true);
  }, []);

  const handleDrawerClose = useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  const toggleOpenTag = useCallback((option: { mode: boolean }) => {
    setOpenTag(option.mode);
  }, []);

  const getStatus = useCallback(async () => {
    const statusRes: any = await LbProviderGetter({ baseUrl: BASE_URL }).send(
      `${PATH.STATUS}`,
      {
        method: "get",
      }
    );

    setStatus(statusRes.data);
  }, []);

  useEffect(() => {
    getStatus();
  }, []);

  return (
    <Fragment>
      <Box>
        <List
          aside={
            !permissions.includes(ROLES.EMPLOYEE) ? (
              <FilterIssuesSidebar
                setWhere={setWhere}
                isDrawerOpen={isDrawerOpen}
                closeDrawer={handleDrawerClose}
              />
            ) : undefined
          }
          filter={{
            someField: true,
            ...where,
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
          }}
          actions={
            <Grid
              container
              alignItems="center"
              sx={{
                width: "100%",
              }}
            >
              <Grid container item xs={2}>
                <DayOffEmployee />
              </Grid>
              <Grid
                container
                item
                xs={10}
                alignItems="center"
                justifyContent="flex-end"
              >
                <TopToolbar
                  sx={{
                    alignItems: "center",
                  }}
                >
                  <Button
                    onClick={() => toggleOpenTag({ mode: true })}
                    color="warning"
                    sx={{
                      height: "27px !important",
                      padding: "4px 10px !important",
                      fontSize: "13px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <TagIcon sx={{ width: "1.2rem", height: "1.2rem" }} />
                    Tag
                  </Button>
                  {!permissions.includes(ROLES.EMPLOYEE) && (
                    <Button
                      sx={{
                        height: "27px !important",
                        padding: "4px 10px !important",
                        fontSize: "13px",
                      }}
                      onClick={handleDrawerOpen}
                    >
                      Filter
                    </Button>
                  )}
                  <SelectColumnsButton className={classes.columnBtn} />
                  <CreateButton />
                  <ExportButton />
                  <CreateTag
                    onClose={() => toggleOpenTag({ mode: false })}
                    open={openTag}
                  />
                </TopToolbar>
              </Grid>
            </Grid>
          }
          sort={{ field: "id", order: "ASC" }}
          sx={{ padding: theme.spacing(1.25) }}
          pagination={<PostPagination />}
          perPage={100}
          empty={false}
        >
          <DatagridConfigurable
            size="small"
            sx={{ "& .column-actions": { textAlign: "center" } }}
            bulkActionButtons={false}
          >
            <FunctionField
              label="Author"
              render={(record: any) => {
                const faceImgUrl = record?.author?.profile?.faceImgUrl;
                const imgSource = faceImgUrl
                  ? { src: `${BASE_URL}/static-assets/${faceImgUrl}` }
                  : { image: `${AvatarIcon}` };

                return (
                  <Stack flexDirection="row" alignItems="center">
                    <CardMedia
                      component="img"
                      sx={{
                        width: "1rem",
                        height: "1rem",
                        borderRadius: "50%",
                        marginRight: "1rem",
                      }}
                      alt="image avatar"
                      {...imgSource}
                    />
                    <Box>{record?.author?.profile?.fullName}</Box>
                  </Stack>
                );
              }}
            />
            <TextField source="title" />
            <TextField source="description" />
            <FunctionField
              source="type.name"
              label="Type"
              sortable={false}
              render={(record: any) => SingleTag(record?.type?.name)}
            />
            <FunctionField
              source="status.name"
              label="Status"
              sortable={false}
              render={(record: any) =>
                record.statusId ? (
                  <Selection
                    record={record}
                    selectionValues={
                      permissions.includes(ROLES.EMPLOYEE) &&
                      (record?.status?.code === IssueStatus.COMPLETED ||
                        record?.status?.code === IssueStatus.CANCELED)
                        ? []
                        : status
                    }
                  />
                ) : null
              }
            />
            <FunctionField
              source="assignees"
              sortable={false}
              render={(record: any) => Assignees(record?.assignees)}
            />
            <FunctionField
              label="Request Date"
              source="requestDate"
              render={(record: any) =>
                `${
                  record.requestDate ? formatTimeToYMD(record.requestDate) : ""
                }`
              }
            />
            <FunctionField
              source="tags"
              sortable={false}
              render={(record: any) => MultiTags(record?.tags)}
            />
            <FieldWrapper label="Actions" source="actions" sortable={false}>
              <FunctionField
                render={(record: Record<string, any>) => {
                  return (
                    <ActionsField
                      id={record.id}
                      actions={
                        !permissions.includes(ROLES.EMPLOYEE)
                          ? new Set(["edit", "delete"])
                          : new Set(["edit"])
                      }
                      resource={PATH.ISSUES}
                    />
                  );
                }}
              />
            </FieldWrapper>
          </DatagridConfigurable>
        </List>
      </Box>
    </Fragment>
  );
}
