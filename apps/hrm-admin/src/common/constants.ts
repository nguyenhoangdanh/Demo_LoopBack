import { IStatusDisplayedUser } from "./types";

export const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

  // import.meta.env.VITE_API_BASE_URL ?? "http://[::1]:3000";
// export const BASE_URL =
//   import.meta.env.VITE_API_BASE_URL ?? "http://192.168.0.84:3000";


export const SOCKET_URL = "http://[::1]:3000";

export const NotANumber = "N/A";

export enum EView {
  GRID = "grid",
  LIST = "list",
}

export enum DATE_TIME {
  DATE_1 = "YYYY-MM-DD",
  DATE_2 = "YYYYMMDD",
  TIME_1 = "HH:mm:ss",
  TIME_2 = "HHmmssSSS",
  TIME_3 = "h:mm:ss a",
  MONTH_1 = "YYYYMM",
}

export enum ConfigurationDataTypes {
  NA = "N/A",
}

export const FACE_IPEG = "face.jpeg";

export class EMPLOYEES_STATUS {
  static readonly UNKNOWN = "000_UNKNOWN";
  static readonly ACTIVATED = "100_ACTIVATED";
  static readonly DEACTIVATED = "101_DEACTIVATED";
  static readonly BLOCKED = "102_BLOCKED";
  static readonly ARCHIVE = "104_ARCHIVE";

  static readonly SCHEMES = [
    this.UNKNOWN,
    this.ACTIVATED,
    this.DEACTIVATED,
    this.BLOCKED,
    this.ARCHIVE,
  ];

  static readonly COLOR = {
    [this.UNKNOWN]: "#AAAAAA",
    [this.ACTIVATED]: "#87AFAF",
    [this.DEACTIVATED]: "#924653",
    [this.BLOCKED]: "#AF5F5F",
    [this.ARCHIVE]: "#6789CA",
  };

  static readonly NAME = {
    [this.UNKNOWN]: "Unknown",
    [this.ACTIVATED]: "Activated",
    [this.DEACTIVATED]: "Deactivated",
    [this.BLOCKED]: "Blocked",
    [this.ARCHIVE]: "Archive",
  };
}

export class WORKING_STATUS {
  static readonly workingStatus: IStatusDisplayedUser;

  static readonly COLOR = {
    [IStatusDisplayedUser.NO_DATA]: "#AAAAAA",
    [IStatusDisplayedUser.CHECKED_IN]: "#87AFAF",
    [IStatusDisplayedUser.CHECKED_OUT]: "#EBC17A",
    [IStatusDisplayedUser.OFF]: "#924653",
    [IStatusDisplayedUser.WORK_FROM_HOME]: "#6789CA",
  };
}

export class ISSUES_STATUS {
  static readonly CLOSE = "Close";
  static readonly CANCELED = "Canceled";
  static readonly COMPLETED = "Completed";
  static readonly REVIEW = "Review";
  static readonly IN_PROGRESS = "In Progress";
  static readonly NEXT_UP = "Next Up";

  static readonly COLOR = {
    [this.CLOSE]: { default: "#594743", hover: "#4F3E39" },
    [this.CANCELED]: { default: "#EBC17A", hover: "#D6B26E" },
    [this.COMPLETED]: { default: "#87AFAF", hover: "#789E9E" },
    [this.REVIEW]: { default: "#924653", hover: "#823D47" },
    [this.IN_PROGRESS]: { default: "#6789CA", hover: "#5C7CB1" },
    [this.NEXT_UP]: { default: "#AAAAAA", hover: "#959595" },
  };
}

export const SIDEBAR = {
  DASHBOARD: "Dashboard",
  MANAGEMENT: "Management",
  DEPARTMENTS: "Departments",
  POSITIONS: "Positions",
  EMPLOYEES: "Employees",
  ROLES: "Roles",
  ISSUES: "Issues",
  ATTENDANCE: "Attendance",
  CHECK_IN_OUT: "Check In/Out",
  HISTORY: "History",
  REQUEST: "Request",
  PREFERENCE: "Preference",
};

export const PATH = {
  META_LINK: "meta-link",
  DASHBOARD: "",
  DEPARTMENTS: "departments",
  POSITIONS: "positions",
  USERS: "users",
  USERS_NOT_IN_DEPARTMENTS: "users/not-in-departments",
  EMPLOYEE: "employee",
  ROLES: "roles",
  ISSUES: "issues",
  TAGS: "tags",
  TYPES: "types",
  STATUS: "status",
  CHECK_IN_OUT: "face",
  ATTENDANCE: "attendances",
  PERMISSIONS: "permissions",
  PROFILE: "profile",
  MY_PROFILE: "my-profile",
  LOGIN: "login",
  AUTH: "auth",
  PERMISSIONMAPPINGS: "/permission-mappings",
  SIGN_IN: "sign-in",
  SIGN_UP: "sign-up",
  CHANGE_PASSWORD: "change-password",
  RESET_PASSWORD: "reset-password",
  UPLOAD: "upload",
  WHO_AM_I: "who-am-i",
  CHANGE_USER: "change-profile",
  CHANGE_AVATAR: "change-avatar",
  UPDATE_AVATAR: "update-avatar",
  AVATAR: "avatar",
  REQUEST: "request",
  PREFERENCE: "preferences",
  CONFIG: "configurations",
  DAYS_OFF: "users/days-off",
  GET_LIST_PREFERENCES: "preferences",
  UP_DATA_PREFERENCES: "preferences",
};

export class ROLES {
  static readonly SUPER_ADMIN = "999-super-admin";
  static readonly ADMIN = "998-admin";
  static readonly OPERATOR = "997-operator";
  static readonly MAINTAINER = "996-maintainer";
  static readonly MANAGER = "995-manager";
  static readonly EMPLOYEE = "100-employee";

  static readonly SCHEMES = [this.MAINTAINER, this.MANAGER, this.EMPLOYEE];

  static readonly OPTIONS = [
    { id: this.SUPER_ADMIN, name: "Super Admin" },
    { id: this.ADMIN, name: "Admin" },
    { id: this.OPERATOR, name: "Operator" },
    { id: this.MAINTAINER, name: "Maintainer" },
    { id: this.MAINTAINER, name: "Manager" },
    { id: this.EMPLOYEE, name: "Employee" },
  ];
}

export class IssueType {
  static readonly FULL_DAY_OFF = "201-full-day-off";
  static readonly HALF_DAY_OFF = "200-half-day-off";
  static readonly WORK_FROM_HOME = "100-work-from-home";
}

export class SagaConst {
  static readonly STREAM: string = "/stream";
  static readonly CONNECT: string = "connect";
  static readonly AUTHENTICATED: string = "authenticated";
  static readonly DASHBOARD: string = "observation-message";
}

export class MessageAction {
  static readonly CHECK_IN: string = "check-in";
  static readonly CHECK_OUT: string = "check-out";
  static readonly ISSUE: string = "issue";
}

export class IssueStatus {
  static readonly DEFAULT_STATUS_ID: number = 6;
  static readonly COMPLETED = "400-completed";
  static readonly CANCELED = "401-canceled";
}
