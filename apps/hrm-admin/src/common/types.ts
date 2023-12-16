import {
  AdminProps,
  LegacyDataProvider,
  ResourceProps,
  number,
} from "react-admin";

export interface IApplication extends AdminProps {
  urls: {
    base: string;
    auth?: string;
  };
  resources: ResourceProps[];
  i18n?: Record<string | symbol, any>;

  [key: string | symbol]: any;
}

export type TRequestMethod =
  | "get"
  | "post"
  | "put"
  | "patch"
  | "delete"
  | "options";

export interface IRequestProps {
  headers?: { [key: string]: string | number };
  body?: any;
  query?: any;
}

export interface IParam {
  id?: string | number;
  method?: TRequestMethod;
  bodyType?: string;
  body?: any;
  data?: any;
  file?: any;
  query?: { [key: string]: string | number | object | null };
  meta?: any;
}

export type IDataProvider = LegacyDataProvider;

export interface IDataArticle {
  clickCount: number;
  createdAt: string;
  details: any;
  modifiedAt: string;
  id: number;
  jobId: string;
  publishAt: string;
  shareCount?: number;
  status: string;
  user?: any;
  userId: number;
}

export interface IDataUser {
  id: number;
  username: string;
  password: string;
  fullname: string;
  faceImgUrl: string;
  role: string;
}

export interface ILocation {
  latitude: number;
  longitude: number;
  timestamp: string;
}

export interface ICenterGoogle {
  lat: number;
  lng: number;
}

export interface ICheckIn {
  id: string;
  fullname: string;
  checkInTime: string;
  latitude?: number;
  longitude?: number;
  imgFace?: File;
  address: string;
}

export interface IIdentify {
  file: File | null;
  address: string;
  lat: number | undefined;
  lng: number | undefined;
}

export interface IIdentifyCb {
  callback: () => void;
}
export interface IPopupPassword {
  open: boolean;
  onClose: () => void;
}

export interface IPopupAvartar {
  open: boolean;
  onClose: () => void;
  // avatar: string | null;
  // setAvatar: string | null;
}


export interface IPopupResetPassword {
  open: boolean;
  onClose: () => void;
  userId: number;
}

export interface IRoleSelection {
  id: number;
  name: string;
  identifier: string;
  status: string;
  priority: number;
  description: any;
}

export interface IUserPositionData extends IUserDepartmentData {}

export interface IPositionRes {
  id: number;
  title: string;
  code: string;
  users?: IUserPositionData[];
}

export interface IPreferences {
  id: number;
  code: string;
  description: string;
  value: number;
}

export interface IDepartmentSelection {
  id: number;
  name: string;
  code: string;
  // TODO
  users: any;
}
export interface ITableCustom {
  tableKey?: number;
  tableHeader: string[];
  tableBody: string[][];
  count: number;
  pagination?: boolean;
}

export interface IUserAttendance {
  id: number;
  address: string;
  createdAt: string;
  checkOutTime: string;
  coordinates: ICoordinates;
}

export interface ICoordinates {
  lat: string;
  lng: string;
}
export interface IRole {
  description: string;
  id: number;
  identifier: string;
  name: string;
  priority: number;
  status: string;
}
export interface IPermission {
  action: string;
  code: string;
  details: string;
  id: number;
  name: string;
  pType: string;
  parentId: string;
  subject: string;
  isChecked?: boolean;
}

export interface ISubjectPermissions {
  [subject: string]: IPermission[];
}

export interface IUser {
  id: number;
  status: string;
  userType: string;
  lastLoginAt: string;
  profile: IUserProfile;
  roles?: IRole[];
}

export interface IUserProfile {
  id: number;
  fullName: string;
  createdAt: string;
  modifiedAt: string;
  faceImgUrl: string | null;
  userId: number;
}

export interface IStatus {
  id: number;
  name: string;
  code: string;
  description: string | null;
}

export interface ITag {
  id: number;
  name: string;
  code: string;
  description: string | null;
}

export interface IType {
  id: number;
  name: string;
  code: string;
  description: string | null;
}

export interface IIssues {
  id: number;
  title?: string;
  description?: string;
  requestDate?: string;
  authorId: number;
  statusId?: number;
  status?: IStatus;
  tags?: ITag[];
  type?: IType;
  assignees?: IUser[];
}

export interface IDepartmentData {
  id: number;
  name: string;
  code: string;
  users?: IUserDepartmentData[];
}

export interface IDaysOff {
  id: number;
  year: number;
  totalDayOff: number;
  spentDayOff: number;
  userId: number;
}

export interface IUserDepartmentData {
  id: number;
  status: string;
  profile: {
    userId: number;
    fullName: string;
    avatarImgUrl: string | null;
  };
}

export interface IIdentifier {
  id: number;
  scheme: string;
  provider: string;
  identifier: string;
  verified: Boolean;
  details: unknown;
  userId: number;
}

export interface IDepartmentDaysOffMapping extends IDepartmentData {
  users: IDepartmentDaysOff[];
}
export interface IDepartmentDaysOff extends IUserDepartmentData, IDaysOff {}

export interface IDashboardState {
  totalEmployees: number;
  workingEmployees: number;
  wfhEmployees: number;
  offEmployees: number;
}

export interface IStatisticItem {
  id: number;
  code: keyof IDashboardState;
  title: string;
  icon: JSX.Element;
  backgroundColor: string;
  navigateTo?: string;
}

export enum IStatusDisplayedUser {
  CHECKED_IN = "Checked in",
  CHECKED_OUT = "Checked out",
  OFF = "Day off",
  WORK_FROM_HOME = "Work from home",
  NO_DATA = "No data",
}

export interface IDisplayedUsers {
  [key: number]: { status: IStatusDisplayedUser; createdAt?: string };
}

export interface IOtherEmployeesData {
  id: number;
  status: string;
  full_name: string;
  avatar_image_url: string | null;
}

export interface IIssueUpdateForm {
  [key: string]: any;
  title: string;
  description: string;
  selectedType: IType | null;
  selectedStatus: IStatus | null;
  selectedTags: ITag[];
  selectedAssignees: IUser[];
  requestDate: string;
}

export enum IssueDialogType {
  BACK,
  UPDATE,
}

export interface IPreference {
  id: number;
  code: string;
  description: string;
  value: string;
}
