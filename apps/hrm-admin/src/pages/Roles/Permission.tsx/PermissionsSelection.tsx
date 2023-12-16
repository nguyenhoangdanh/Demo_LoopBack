import { useCallback, useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import { LbProviderGetter } from "@/helpers";
import { BASE_URL, IPermission, ISubjectPermissions, PATH } from "@/common";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Stack,
  Theme,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { useNotify } from "react-admin";

const useStyles: any = makeStyles((theme: Theme) => {
  return {
    stackContainer: {
      [theme.breakpoints.down("sm")]: {
        width: "100%",
      },
      [theme.breakpoints.up("sm")]: {
        width: "500px",
      },
    },
    boxContainer: {
      fontSize: theme.spacing(3),
      fontWeight: 500,
      padding: `${theme.spacing(4)} ${theme.spacing(4)} 0 ${theme.spacing(4)}`,
    },
    stackBtnSave: {
      position: "sticky",
      bottom: "0",
      marginTop: "24px",
      display: "block",
      zIndex: 1,
    },
    boxBtnCancel: {
      [theme.breakpoints.down("sm")]: {
        display: "block",
        width: "auto",
        margin: `${theme.spacing(1)} ${theme.spacing(4)} ${theme.spacing(
          4
        )} ${theme.spacing(4)}`,
      },
      [theme.breakpoints.up("sm")]: {
        display: "none",
      },
    },
    boxChidren: {
      [theme.breakpoints.down("sm")]: {
        padding: `${theme.spacing(4)} ${theme.spacing(4)} 0 ${theme.spacing(
          4
        )}`,
      },
      [theme.breakpoints.up("sm")]: {
        padding: theme.spacing(4),
      },
    },
  };
});

export default function ListPermission(props: any) {
  const { name, close, roleId } = props ?? {};
  const param = { "*": roleId };
  const classes = useStyles();
  const notify = useNotify();
  const [listInitPermissionsBySubject, setListInitPermissionsBySubject] =
    useState<ISubjectPermissions>({});
  const [listPermissionsBySubject, setListPermissionsBySubject] =
    useState<ISubjectPermissions>({});

  const reqSavePermission = {
    principalType: "Role",
    principalId: Number(param["*"]),
    permissions: {
      grant: [] as number[],
      omit: [] as number[],
    },
  };

  const getInitPermission = useCallback(async () => {
    const permissionsRes = await LbProviderGetter({ baseUrl: BASE_URL }).send(
      `${PATH.PERMISSIONS}`,
      {
        method: "get",
        query: {},
      }
    );
    const roleRes = await LbProviderGetter({ baseUrl: BASE_URL }).send(
      `${PATH.ROLES}/${param["*"]}`,
      {
        method: "get",
        query: {
          filter: {
            include: [
              {
                relation: "permissions",
              },
            ],
          },
        },
      }
    );
    const permissionData = permissionsRes as { data: Array<IPermission> };
    const roleData = roleRes as { data: { permissions?: Array<IPermission> } };

    const filteredInitPermissions: ISubjectPermissions = {};
    const filteredPermissions: ISubjectPermissions = {};
    permissionData.data.forEach((item) => {
      if (!filteredInitPermissions[item.subject]) {
        filteredInitPermissions[item.subject] = [];
      }
      if (!filteredPermissions[item.subject]) {
        filteredPermissions[item.subject] = [];
      }

      let isChecked = roleData.data?.permissions?.some((e) => e.id === item.id);
      if (!isChecked) {
        isChecked = false;
      }

      filteredInitPermissions[item.subject].push({ ...item, isChecked });
      filteredPermissions[item.subject].push({ ...item, isChecked });
    });

    setListInitPermissionsBySubject(filteredInitPermissions);
    setListPermissionsBySubject(filteredPermissions);
  }, []);

  const handleChangeParent =
    (value: IPermission[], subject: string) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const isChecked = event.target.checked;
      setListPermissionsBySubject((prev) => {
        const updatedSubject = prev[`${subject}`].map((permission) => ({
          ...permission,
          isChecked: event.target.checked,
        }));

        return {
          ...prev,
          [`${subject}`]: updatedSubject,
        };
      });
    };

  const handleChangeChild =
    (value: IPermission, subject: string, index: number) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setListPermissionsBySubject((prevState) => {
        const updatedSubject = [...prevState[`${subject}`]];
        updatedSubject[index].isChecked = event.target.checked;

        return {
          ...prevState,
          [`${subject}`]: updatedSubject,
        };
      });
    };
  const comparePermissions = () => {
    const createIds: number[] = [];
    const deleteIds: number[] = [];

    Object.keys(listPermissionsBySubject).forEach((subject) => {
      listPermissionsBySubject[subject].forEach((permission, index) => {
        if (
          listInitPermissionsBySubject[`${subject}`][index].isChecked !==
          permission.isChecked
        ) {
          if (permission.isChecked) {
            createIds.push(permission.id);
          }
          if (!permission.isChecked) {
            deleteIds.push(permission.id);
          }
        }
      });
    });

    reqSavePermission.permissions.grant = createIds;
    reqSavePermission.permissions.omit = deleteIds;
  };
  const handleSave = async () => {
    comparePermissions();
    const saveRes = await LbProviderGetter({ baseUrl: BASE_URL }).send(
      `${PATH.PERMISSIONMAPPINGS}`,
      {
        method: "post",
        data: reqSavePermission,
      }
    );
    if (saveRes) {
      notify("Successful update!", { type: "success" });
    }
    await getInitPermission();
  };
  useEffect(() => {
    getInitPermission();
  }, []);

  const children = (
    <Box className={classes.boxChidren}>
      <Stack height={"100%"}>
        {Object.entries(listPermissionsBySubject).map(([key1, value]) => {
          return (
            <Accordion key={key1}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                  width: "100%",
                  justifyContent: "space-between",
                  margin: "unset",
                }}
                aria-controls="panel1a-content"
                id="panel1a-header"
              >
                <FormControlLabel
                  label={key1}
                  control={
                    <Checkbox
                      checked={listPermissionsBySubject[`${key1}`].every(
                        (value) => value.isChecked
                      )}
                      indeterminate={
                        listPermissionsBySubject[`${key1}`].some(
                          (value) => value.isChecked
                        ) &&
                        listPermissionsBySubject[`${key1}`].every(
                          (value) => value.isChecked
                        )
                      }
                      onChange={handleChangeParent(value, key1)}
                    />
                  }
                />
              </AccordionSummary>

              <AccordionDetails>
                <Box sx={{ display: "flex", flexDirection: "column", ml: 3 }}>
                  {Object.entries(value).map(([key2, value], index) => {
                    return (
                      <FormControlLabel
                        key={key2}
                        label={value.name}
                        control={
                          <Checkbox
                            checked={
                              listPermissionsBySubject[`${key1}`][index]
                                .isChecked
                            }
                            onChange={handleChangeChild(value, key1, index)}
                          />
                        }
                      />
                    );
                  })}
                </Box>
              </AccordionDetails>
            </Accordion>
          );
        })}
        {Object.entries(listPermissionsBySubject).length ? (
          <Stack className={classes.stackBtnSave}>
            <Button variant="contained" color="primary" onClick={handleSave}>
              Save
            </Button>
          </Stack>
        ) : (
          <></>
        )}
      </Stack>
    </Box>
  );
  return (
    <Stack className={classes.stackContainer}>
      <Box className={classes.boxContainer}>{name}</Box>
      {children}
      <Button
        className={classes.boxBtnCancel}
        variant="contained"
        color="inherit"
        onClick={close}
      >
        Cancel
      </Button>
    </Stack>
  );
}
