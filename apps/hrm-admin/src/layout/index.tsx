import { Layout, LayoutProps } from "react-admin";
import { CustomAppBar } from "./appbar";
import { CustomSidebar } from "./sidebar";
import CustomMenu from "./menu/CustomMenu";
import AppMenu from "./menu/AppMenu";
import { useTheme } from "@mui/material";

export const MyLayout = (props: LayoutProps) => {
  const theme = useTheme();
  return (
    <Layout
      {...props}
      appBar={CustomAppBar}
      sidebar={CustomSidebar}
      // menu={CustomMenu}
      menu={AppMenu}
      sx={{
        ".RaLayout-appFrame": {
          marginTop: theme.spacing(13),
        },
      }}
    />
  );
};
