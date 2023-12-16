import {
  Box,
  Collapse,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import React, { Fragment } from "react";
import { useNavigate } from "react-router-dom";
import { PATH, ROLES, SIDEBAR } from "../../common";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import Groups2Icon from "@mui/icons-material/Groups2";
import LineWeightIcon from "@mui/icons-material/LineWeight";
import PersonIcon from "@mui/icons-material/Person";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import HistoryIcon from "@mui/icons-material/History";
import ForwardToInboxIcon from "@mui/icons-material/ForwardToInbox";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { usePermissions } from "react-admin";
import { Accessibility } from "@mui/icons-material";

const ManagementList = [
  {
    id: 1,
    nameSideBar: SIDEBAR.DEPARTMENTS,
    navigator: `/${PATH.DEPARTMENTS}`,
    icon: <Groups2Icon />,
  },
  {
    id: 2,
    nameSideBar: SIDEBAR.POSITIONS,
    navigator: `/${PATH.POSITIONS}`,
    icon: <LineWeightIcon />,
  },
  {
    id: 3,
    nameSideBar: SIDEBAR.EMPLOYEES,
    navigator: `/${PATH.USERS}`,
    icon: <PersonIcon />,
  },
  {
    id: 4,
    nameSideBar: SIDEBAR.ROLES,
    navigator: `/${PATH.ROLES}`,
    icon: <Accessibility />,
  },
  {
    id: 5,
    nameSideBar: SIDEBAR.ISSUES,
    navigator: `/${PATH.ISSUES}`,
    icon: <Accessibility />,
  },
];

const AttendanceList = [
  // {
  //   id: 4,
  //   nameSideBar: SIDEBAR.CHECK_IN_OUT,
  //   navigator: `/${PATH.CHECK_IN_OUT}`,
  //   icon: <HowToRegIcon />,
  // },
  {
    id: 5,
    nameSideBar: SIDEBAR.HISTORY,
    navigator: `/${PATH.ATTENDANCE}`,
    icon: <HistoryIcon />,
  },
  // {
  //   id: 6,
  //   nameSideBar: SIDEBAR.REQUEST,
  //   navigator: `/${PATH.REQUEST}`,
  //   icon: <ForwardToInboxIcon />,
  // },
];

const CustomMenu = () => {
  const navigate = useNavigate();
  const { permissions } = usePermissions();

  const [selectedIndex, setSelectedIndex] = React.useState(0);

  const [open, setOpen] = React.useState<{
    management: boolean;
    attendance: boolean;
  }>({
    management: false,
    attendance: false,
  });

  const handleClick = (key: string) => {
    setOpen((prev: any) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleListItemClick = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
    item: number
  ) => {
    setSelectedIndex(item);
  };

  return (
    <Box sx={{ height: "100%", width: "240px" }}>
      <List component="nav" aria-label="main mailbox folders">
        <ListItemButton
          selected={selectedIndex === 0}
          onClick={(event) => {
            handleListItemClick(event, 0);
            navigate("/");
          }}
        >
          <ListItemIcon>
            <DashboardIcon />
          </ListItemIcon>
          <ListItemText primary={SIDEBAR.DASHBOARD} />
        </ListItemButton>
        {permissions.includes(ROLES.EMPLOYEE) ? (
          <></>
        ) : (
          <Fragment>
            <ListItemButton onClick={() => handleClick("management")}>
              <ListItemIcon>
                <ManageAccountsIcon />
              </ListItemIcon>
              <ListItemText primary={SIDEBAR.MANAGEMENT} />
              {open.management ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse in={open.management} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {ManagementList.map((item: any) => (
                  <ListItemButton
                    key={item.id}
                    sx={{ pl: 4 }}
                    selected={selectedIndex === item.id}
                    onClick={(event) => {
                      handleListItemClick(event, item.id);
                      navigate(item.navigator);
                    }}
                  >
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.nameSideBar} />
                  </ListItemButton>
                ))}
              </List>
            </Collapse>
          </Fragment>
        )}
        <ListItemButton onClick={() => handleClick("attendance")}>
          <ListItemIcon>
            <CalendarMonthIcon />
          </ListItemIcon>
          <ListItemText primary={SIDEBAR.ATTENDANCE} />
          {open.attendance ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={open.attendance} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {permissions.includes(ROLES.EMPLOYEE) && (
              <ListItemButton
                key={4}
                sx={{ pl: 4 }}
                selected={selectedIndex === 4}
                onClick={(event) => {
                  handleListItemClick(event, 4);
                  navigate(`/${PATH.CHECK_IN_OUT}`);
                }}
              >
                <ListItemIcon>
                  <HowToRegIcon />
                </ListItemIcon>
                <ListItemText primary={SIDEBAR.CHECK_IN_OUT} />
              </ListItemButton>
            )}

            {AttendanceList.map((item: any) => (
              <ListItemButton
                key={item.id}
                sx={{ pl: 4 }}
                selected={selectedIndex === item.id}
                onClick={(event) => {
                  handleListItemClick(event, item.id);
                  navigate(item.navigator);
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.nameSideBar} />
              </ListItemButton>
            ))}
          </List>
        </Collapse>
      </List>
    </Box>
  );
};

export default CustomMenu;
