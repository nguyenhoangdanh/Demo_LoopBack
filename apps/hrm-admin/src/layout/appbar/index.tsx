import * as React from "react";
import { Box, CardMedia, Theme, Toolbar, useTheme } from "@mui/material";
import { makeStyles } from "@mui/styles";
import {
  AppBar,
  InspectorButton,
  Logout,
  MenuItemLink,
  RefreshIconButton,
  ToggleThemeButton,
  UserMenu,
  useGetOne,
} from "react-admin";
import MinimalTechLogo from "../../assets/image/minimaltech.svg";
import SettingsIcon from "@mui/icons-material/Settings";
import { BASE_URL, PATH } from "@/common";
import AvatarIcon from "@/assets/image/avatar-modification.svg";
const useStyles: any = makeStyles((theme: Theme) => ({
  appBar: {
    height: theme.spacing(12),
    display: "flex",
    justifyContent: "space-between",
    backgroundColor: theme.palette.common.black,
  },
  toolBar: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    minHeight: `${theme.spacing(6)} !important`,
    paddingLeft: "0px !important",
  },
}));

const menuItemStyles = {
  ".MuiListItemIcon-root": {
    marginRight: 3,
  },
};

interface ImageAvatarProps {
  src: string;
  alt: string;
}

const ImageAvatar: React.FC<ImageAvatarProps> = ({ src, alt }) => {
  const imgSource = src
    ? { src: `${BASE_URL}/static-assets/${src}` }
    : { image: `${AvatarIcon}` };

  return (
    <Box display="flex" alignItems="center" justifyContent="center">
      <CardMedia
        component="img"
        sx={{ width: "25px", height: "25px", borderRadius: "50%" }}
        alt={alt}
        {...imgSource}
      />
    </Box>
  );
};

export const CustomAppBar = () => {
  const classes = useStyles();
  const theme = useTheme();
  const id = React.useMemo<string | null>(() => localStorage.getItem("userId"), []);
  const { data: myProfile, isLoading: myProfileLoading } = useGetOne(
    PATH.USERS,
    {
      id: `${id}`,
      meta: {
        filter: {
          include: [
            "profile",
          ],
        },
      },
    },
    { enabled: Boolean(id) }
  );
  const icon = myProfile?.profile?.avatarImageUrl;

  return (
    <AppBar
      userMenu={
        <UserMenu icon={<ImageAvatar src={icon} alt="Avatar" />}>
          <MenuItemLink
            to={`/${PATH.MY_PROFILE}`}
            primaryText="My Profile"
            leftIcon={<SettingsIcon />}
            sx={menuItemStyles}
          />
          <Logout />
        </UserMenu>
      }
      className={classes.appBar}
      toolbar={
        <React.Fragment>
          <ToggleThemeButton />
          <RefreshIconButton />
        </React.Fragment>
      }
    >
      <Toolbar className={classes.toolBar}>
        <Box width="100%" display="flex" justifyContent="flex-start">
          <img
            src={MinimalTechLogo}
            style={{ width: theme.spacing(20), height: theme.spacing(8) }}
            alt="logo"
          />
        </Box>
      </Toolbar>
      <InspectorButton />
    </AppBar>
  );
};
