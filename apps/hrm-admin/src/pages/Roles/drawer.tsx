import { Drawer } from "@mui/material";
import ListPermission from "./Permission.tsx/PermissionsSelection";

export default function SetDrawer(opts: any) {
  const { roleId, isDrawerOpen, handleDrawerClose, roleName } = opts ?? {};

  return (
    <Drawer anchor={"right"} open={isDrawerOpen} onClose={handleDrawerClose}>
      <ListPermission
        roleId={roleId}
        name={roleName}
        close={handleDrawerClose}
      />
    </Drawer>
  );
}
