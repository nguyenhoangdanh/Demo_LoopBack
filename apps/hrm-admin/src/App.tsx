import { Admin, Resource, CustomRoutes } from "react-admin";
import { authProvider } from "./helpers";
import { Route } from "react-router";
import { MyProfile } from "./layout/appbar/profile/index";
import { MyLayout } from "./layout";
import { getDataProvider } from "./provider";
import { BASE_URL, PATH } from "./common";
import {
  ListEmployees,
  DetailUser,
  EditUser,
  CreateUser,
  AttendanceList,
  DetailAttendance,
  WebcamFace,
  Dashboard,
  CreateDepartment,
  ListPosition,
  DetailDepartment,
  EditDepartment,
  CreatePosition,
  DetailPosition,
  EditPosition,
  ListDepartments,
} from "./pages";
import InsertEmoticonIcon from "@mui/icons-material/InsertEmoticon";
import HistoryIcon from "@mui/icons-material/History";
import { LoginPage } from "./layout/KYC/login";
import { Theme } from "./assets/theme";
import ListRoles from "./pages/Roles";
import { CreateRole } from "./pages/Roles/CreateRole/CreateRole";
import { EditRole } from "./pages/Roles/EditRole/EditRole";
import ListIssues from "./pages/Issues";
import { UpdateIssue } from "./pages/Issues/UpdateIssue";
import { CreateIssue } from "./pages/Issues/CreateIssue";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import {PreferenceAddPage, PreferenceEditPage, PreferenceListPage} from "@/pages/Preference";
export const App = () => {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Admin
        dataProvider={getDataProvider({ baseUrl: BASE_URL })}
        authProvider={authProvider}
        loginPage={LoginPage}
        dashboard={Dashboard}
        requireAuth
        layout={MyLayout}
        theme={Theme.LIGHT}
        darkTheme={Theme.DARK}
      >
        <CustomRoutes>
          <Route
            key={PATH.MY_PROFILE}
            path={`/${PATH.MY_PROFILE}`}
            element={<MyProfile />}
          />
        </CustomRoutes>
        <Resource name={PATH.CHECK_IN_OUT} list={WebcamFace} />
        <Resource
          name={PATH.DEPARTMENTS}
          list={ListDepartments}
          create={CreateDepartment}
          show={DetailDepartment}
          edit={EditDepartment}
        />
        <Resource
          name={PATH.POSITIONS}
          list={ListPosition}
          create={CreatePosition}
          show={DetailPosition}
          edit={EditPosition}
        />
        <Resource
          name={PATH.ROLES}
          edit={EditRole}
          create={CreateRole}
          list={ListRoles}
        />
        <Resource
          name={PATH.ISSUES}
          edit={UpdateIssue}
          create={CreateIssue}
          list={ListIssues}
        />
        <Resource
          name={PATH.USERS}
          list={ListEmployees}
          show={DetailUser}
          edit={EditUser}
          create={CreateUser}
          icon={InsertEmoticonIcon}
        />
        <Resource
          name={PATH.ATTENDANCE}
          list={AttendanceList}
          show={DetailAttendance}
          icon={HistoryIcon}
        />
        <Resource
          name={PATH.PREFERENCE}
          list={PreferenceListPage}
          create={PreferenceAddPage}
          edit={PreferenceEditPage}
        />
      </Admin>
    </LocalizationProvider>
  );
};
