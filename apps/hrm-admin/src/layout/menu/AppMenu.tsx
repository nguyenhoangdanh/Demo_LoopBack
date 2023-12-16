import * as React from "react";
import { useCallback, useState } from "react";
import Box from "@mui/material/Box";
import {
  useTranslate,
  DashboardMenuItem,
  MenuItemLink,
  MenuProps,
  useSidebarState,
  useLocales,
  usePermissions,
} from "react-admin";
import SubMenu from "./SubMenu";
import PersonIcon from "@mui/icons-material/Person";
import EditCalendarIcon from "@mui/icons-material/EditCalendar";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import Groups2Icon from "@mui/icons-material/Groups2";
import LineWeightIcon from "@mui/icons-material/LineWeight";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import HistoryIcon from "@mui/icons-material/History";
import { PATH, ROLES, SIDEBAR } from "@/common";
import { Accessibility, ListAltOutlined } from "@mui/icons-material";
import { useTheme } from "@mui/material";

type MenuName = "menuManagement" | "menuAttendance" | "menuIssue";

const Menu = ({ dense = false }: MenuProps) => {
  const [state, setState] = useState({
    menuManagement: false,
    menuAttendance: false,
    menuIssue: false,
  });
  const translate = useTranslate();
  const [open] = useSidebarState();
  const { permissions } = usePermissions();
  const theme = useTheme();

  const handleToggle = useCallback((menu: MenuName) => {
    setState((state) => ({ ...state, [menu]: !state[menu] }));
  }, []);

  const location = useLocales();

  const isActive = location;

  const activeStyles = {
    background: "#F2F2F2",
    color: "#277fff",
  };

  const defaultStyles = {
    background: "transparent",
    color: "inherit",
  };
  const activeStyless: React.CSSProperties = {
    // "&.RaMenuItemLink-active": {
    background: "#F2F2F2",
    color: "#277fff",
    // },
  };
  const menuItemStyles = {
    ".MuiListItemIcon-root": {
      marginRight: 4,
    },
    fontWeight: "bold",
  };

  const subMenuItemStyles = {
    ...menuItemStyles,
    fontWeight: 400,
    marginLeft: 2,
  };

  const styles = isActive ? activeStyles : defaultStyles;

  return (
    <Box
      sx={{
        width: open ? 200 : 50,
        marginTop: 1,
        marginBottom: 1,
        transition: (theme) =>
          theme.transitions.create("width", {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        ".MuiMenuItem-root": {
          ".MuiTypography-root": {
            fontWeight: "bold",
          },
        },
        ".RaMenuItemLink-active": {
          background: theme.palette.grey[100],
        },
      }}
    >
      {!permissions.includes(ROLES.EMPLOYEE) && (
        <DashboardMenuItem
          primaryText={SIDEBAR.DASHBOARD}
          sx={menuItemStyles}
        />
      )}
      {!permissions.includes(ROLES.EMPLOYEE) && (
        <SubMenu
          handleToggle={() => handleToggle("menuManagement")}
          icon={<ManageAccountsIcon />}
          isOpen={state.menuManagement}
          name={SIDEBAR.MANAGEMENT}
          dense={dense}
        >
          <MenuItemLink
            to={`/${PATH.DEPARTMENTS}`}
            leftIcon={<Groups2Icon />}
            dense={dense}
            primaryText={SIDEBAR.DEPARTMENTS}
            sx={subMenuItemStyles}
          />
          <MenuItemLink
            to={`/${PATH.POSITIONS}`}
            state={{ _scrollToTop: true }}
            primaryText={SIDEBAR.POSITIONS}
            leftIcon={<LineWeightIcon />}
            dense={dense}
            sx={subMenuItemStyles}
          />
          <MenuItemLink
            to={`/${PATH.USERS}`}
            state={{ _scrollToTop: true }}
            primaryText={SIDEBAR.EMPLOYEES}
            leftIcon={<PersonIcon />}
            dense={dense}
            sx={subMenuItemStyles}
          />
          <MenuItemLink
            to={`/${PATH.ROLES}`}
            state={{ _scrollToTop: true }}
            primaryText={SIDEBAR.ROLES}
            leftIcon={<Accessibility />}
            dense={dense}
            sx={subMenuItemStyles}
          />
          <MenuItemLink
            to={`/${PATH.PREFERENCE}`}
            state={{ _scrollToTop: true }}
            primaryText={SIDEBAR.PREFERENCE}
            leftIcon={<EditCalendarIcon />}
            dense={dense}
            sx={subMenuItemStyles}
          />
        </SubMenu>
      )}
      <SubMenu
        handleToggle={() => handleToggle("menuAttendance")}
        icon={<CalendarMonthIcon />}
        isOpen={state.menuAttendance}
        name={SIDEBAR.ATTENDANCE}
        dense={dense}
      >
        {permissions.includes(ROLES.EMPLOYEE) && (
          <MenuItemLink
            to={`/${PATH.CHECK_IN_OUT}`}
            state={{ _scrollToTop: true }}
            primaryText={SIDEBAR.CHECK_IN_OUT}
            leftIcon={<HowToRegIcon />}
            dense={dense}
            sx={subMenuItemStyles}
          />
        )}
        <MenuItemLink
          to={`/${PATH.ATTENDANCE}`}
          state={{ _scrollToTop: true }}
          primaryText={SIDEBAR.HISTORY}
          leftIcon={<HistoryIcon />}
          dense={dense}
          sx={subMenuItemStyles}
        />
      </SubMenu>
      <MenuItemLink
        to={`/${PATH.ISSUES}`}
        state={{ _scrollToTop: true }}
        primaryText={SIDEBAR.ISSUES}
        leftIcon={<ListAltOutlined />}
        dense={dense}
        sx={menuItemStyles}
      />
    </Box>
  );
};

export default Menu;
