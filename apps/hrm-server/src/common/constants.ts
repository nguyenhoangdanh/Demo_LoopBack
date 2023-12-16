import { IMessage } from './types';

export class AccountTypes {
  static readonly SYSTEM = 'SYSTEM';
  static readonly LINKED = 'LINKED';
  static readonly TYPE_SET = new Set([this.SYSTEM, this.LINKED]);

  static isValid(orgType: string): boolean {
    return this.TYPE_SET.has(orgType);
  }
}

export class AttendanceAction {
  static readonly CHECK_IN = 'CHECK_IN';
  static readonly CHECK_OUT = 'CHECK_OUT';
}

export class AuthenticationProviders {
  static readonly MT_HRM = 'mt-hrm';
  static readonly TYPE_SET = new Set([this.MT_HRM]);

  static isValid(orgType: string): boolean {
    return this.TYPE_SET.has(orgType);
  }
}

export class UserIdentifierSchemes {
  // Only support username for now
  static readonly USERNAME = 'username';
  static readonly SCHEME_SET = new Set([this.USERNAME]);

  static isValid(scheme: string): boolean {
    return this.SCHEME_SET.has(scheme);
  }
}

export class UserCredentialSchemes {
  // Only support basic (username, password) for now
  static readonly BASIC = 'basic';
  static readonly SCHEME_SET = new Set([this.BASIC]);

  static isValid(scheme: string): boolean {
    return this.SCHEME_SET.has(scheme);
  }
}

export class FixedUserRoles {
  static readonly SUPER_ADMIN = '999-super-admin';
  static readonly ADMIN = '998-admin';
  static readonly OPERATOR = '997-operator';
  static readonly MAINTAINER = '996-maintainer';
  static readonly MANAGER = '995-manager';
  static readonly EMPLOYEE = '100-employee';
  static readonly ALWAYS_ALLOW_ROLES = new Set([
    FixedUserRoles.SUPER_ADMIN,
    FixedUserRoles.ADMIN,
  ]);
}

export class AuthorizationEffect {
  static readonly ALLOW = 'allow';
  static readonly DENY = 'deny';
}

export class ApplicationKeys {
  static readonly DS_POSTGRES = 'postgres';
}

export class Authentication {
  static readonly ACCESS_TOKEN_SECRET = 'Minital.Technology.199.A';
  static readonly ACCESS_TOKEN_EXPIRES_IN = 86400;
  static readonly REFRESH_TOKEN_SECRET = 'Minimal.Technology.199.R';
  static readonly REFRESH_TOKEN_EXPIRES_IN = 86400;

  // Jwt
  static readonly TYPE_BASIC = 'Basic';
  static readonly TYPE_BEARER = 'Bearer';

  // Strategy
  static readonly STRATEGY_BASIC = 'basic';
  static readonly STRATEGY_JWT = 'jwt';
}

export class Messages {
  static readonly PREFIX = 'application.message';
  static readonly SCOPE_ERROR = `${this.PREFIX}.error`;
  static readonly SCOPE_NOTIFICATION = `${this.PREFIX}.notification`;

  static readonly Errors: Record<string, string> = {
    MISSING_AUTHORIZATION_HEADER: 'missing_authorization_header',
    INVALID_JWT_TYPE: 'invalid_jwt_type',
    INVALID_JWT: 'invalid_jwt',
    INVALID_SIGN_IN_CREDENTIAL: 'invalid_signin_credential',
  };

  static readonly Notifications: Record<string, IMessage> = {};

  static readonly ErrorKeys = Object.keys(this.Errors);
  static readonly NotificationKeys = Object.keys(this.Notifications);
}

export class FileNames {
  static readonly ENCODE: string = 'encode-img.py';
  static readonly FACE_RECOG: string = 'face-recog.py';
}

export class RestPaths {
  static readonly AUTH: string = '/auth';
  // static readonly AUTH1: string = '/auth1';

  static readonly USER: string = '/users';
  static readonly DEPARTMENT: string = '/departments';
  static readonly POSITION: string = '/positions';
  static readonly CHECKIN: string = '/check-in';
  static readonly NOTION: string = '/notion';
  static readonly META_LINK: string = '/meta-link';
  static readonly ATTENDANCE: string = '/attendances';
  static readonly PERMISSION: string = '/permissions';
  static readonly PERMISSION_MAPPING: string = '/permission-mappings';
  static readonly ROLE: string = '/roles';
  static readonly STREAM: string = '/stream';
  static readonly ISSUE: string = '/issues';
  static readonly TAG: string = '/tags';
  static readonly TYPE: string = '/types';
  static readonly STATUS: string = '/status';
  static readonly CONFIG: string = '/configurations';
  static readonly PREFERENCE: string = '/preferences';
}

export class DefaultPassword {
  static readonly PREFIX = 'MT_';
}

export class MigrationUser {
  static readonly SuperAdmin = 'superadmin.mt';
  static readonly Admin = 'admin.mt';
  static readonly Operator = 'operator.mt';
  static readonly Maintainer = 'maintainer.mt';
  static readonly Employee = 'employee.mt';
  static readonly MigrationList = [
    this.SuperAdmin,
    this.Admin,
    this.Operator,
    this.Maintainer,
    this.Employee,
  ];
  static readonly DefaultPassword = 'minimaltech';
}

export class MigrationTypeName {
  static readonly WORK_FROM_HOME = 'Work From Home';
  static readonly HALF_DAY_OFF = 'Half Day Off';
  static readonly FULL_DAY_OFF = 'Full Day Off';
  static readonly OTHERS = 'Others';
}

export class MigrationTypeCode {
  static readonly WORK_FROM_HOME = '100-work-from-home';
  static readonly HALF_DAY_OFF = '200-half-day-off';
  static readonly FULL_DAY_OFF = '201-full-day-off';
  static readonly OTHERS = '99-others';
}

export class MigrationStatusName {
  static readonly CLOSE = 'Close';
  static readonly CANCELED = 'Canceled';
  static readonly COMPLETED = 'Completed';
  static readonly REVIEW = 'Review';
  static readonly IN_PROGRESS = 'In Progress';
  static readonly NEXT_UP = 'Next Up';
}

export class MigrationStatusCode {
  static readonly CLOSE = '402-close';
  static readonly CANCELED = '401-canceled';
  static readonly COMPLETED = '400-completed';
  static readonly REVIEW = '300-review';
  static readonly IN_PROGRESS = '200-in-progress';
  static readonly NEXT_UP = '100-next-up';
}

//-------------------------------------
export const AcceptedStatusName = [MigrationStatusName.COMPLETED];

export const AcceptedStatusCode = [MigrationStatusCode.COMPLETED];

export const RejectedStatusName = [MigrationStatusName.CANCELED];

export const RejectedStatusCode = [MigrationStatusCode.CANCELED];

export const AcceptedStatus = AcceptedStatusName.map((name, index) => ({
  acceptedStatusName: name,
  acceptedStatusCode: AcceptedStatusCode[index],
}));

export const RejectedStatus = RejectedStatusName.map((name, index) => ({
  rejectedStatusName: name,
  rejectedStatusCode: RejectedStatusCode[index],
}));

//--------------------------------------
export class PYTHON_CMD {
  static readonly EXECUTION = 'python3';
}

export class TIMEZONE {
  static readonly VN = 'Asia/Ho_Chi_Minh';
}

export class CronCode {
  static readonly ENCODE = 'encode';
  static readonly CHECK_OUT = 'check-out';
  static readonly DELETE_IMAGES = 'delete-images';
  static readonly NOTION_SYNC = 'notion-sync';
  static readonly CRON_LIST = new Set([
    CronCode.ENCODE,
    CronCode.CHECK_OUT,
    CronCode.DELETE_IMAGES,
  ]);
}

export class DefaultCronTime {
  static readonly FETCH_TIME = '0 17 * * *'; // 00:00:00 GMT+7
  static readonly DEFAULT = '30 16 * * *'; // 23:30:00 GMT+7
}

export class NotificationTypes {
  static readonly MESSAGE = 'message';
  static readonly TYPE_SET = new Set([this.MESSAGE]);

  static isValid(orgType: string): boolean {
    return this.TYPE_SET.has(orgType);
  }
}

// ---------------------------------------------------------------------
export class PreferenceDefaultValues {
  static readonly PREFERENCE_FULL_DAYSOFF_VALUE = 12;
  static readonly PREFERENCE_HALF_DAYOFF_VALUE = 24;
  static readonly PREFERENCE_WORK_FROM_VALUE = 5;
  static readonly PREFERENCE_PARKING_FEE_VALUE = 150000;
}

export class PreferenceCodes {
  static readonly PREFERENCE_FULL_DAYSOFF_CODE = '01-full-days-off';
  static readonly PREFERENCE_HALF_DAYOFF_CODE = '02-half-day-off';
  static readonly PREFERENCE_WORK_FROM_HOME_CODE = '03-work-from-home';
  static readonly PREFERENCE_PARKING_FEE_CODE = '04-parking-fee';
}

export class PreferenceDescriptions {
  static readonly PREFERENCE_FULL_DAYSOFF_DESCRIPTION =
    'Total days off an employee can have in one year';
  static readonly PREFERENCE_HALF_DAYOFF_DESCRIPTION =
    'Total half days off an employee can have in one year';
  static readonly PREFERENCE_WORK_FROM_HOME_DESCRIPTION =
    'Total work from days an employee can request in one year';
  static readonly PREFERENCE_PARKINFG_FEE_DESCRIPTION =
    'Parking fee an employee recieve per month';
}

export const InitailPreferencesCode = [
  PreferenceCodes.PREFERENCE_FULL_DAYSOFF_CODE,
  PreferenceCodes.PREFERENCE_HALF_DAYOFF_CODE,
  PreferenceCodes.PREFERENCE_WORK_FROM_HOME_CODE,
];

export class EmployeeStatus {
  static readonly ACTIVATED = '100_ACTIVATED';
}

export class ReturnError {
  static readonly INVALID_INPUT = {
    statusCode: 400,
    message: 'Invalid input',
  };
}

export class Pagination {
  static readonly DAYS_OFF_LIMIT = 100;
}
