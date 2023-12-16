import { AccountTypes, MigrationUser } from '@mt-hrm/common';
import { FixedUserRoles } from '@mt-hrm/common';

const users: Array<{
  username: string;
  credential: string;
  fullName: string;
  userType: AccountTypes;
  roleIdentifier: string;
}> = [
  {
    username: MigrationUser.SuperAdmin,
    credential: MigrationUser.DefaultPassword,
    fullName: 'Super Admin User',
    userType: AccountTypes.SYSTEM,
    roleIdentifier: FixedUserRoles.SUPER_ADMIN,
  },
  {
    username: MigrationUser.Admin,
    credential: MigrationUser.DefaultPassword,
    fullName: 'Admin User',
    userType: AccountTypes.SYSTEM,
    roleIdentifier: FixedUserRoles.ADMIN,
  },
  {
    username: MigrationUser.Operator,
    credential: MigrationUser.DefaultPassword,
    fullName: 'Operator User',
    userType: AccountTypes.SYSTEM,
    roleIdentifier: FixedUserRoles.OPERATOR,
  },
  {
    username: MigrationUser.Maintainer,
    credential: MigrationUser.DefaultPassword,
    fullName: 'Maintainer User',
    userType: AccountTypes.SYSTEM,
    roleIdentifier: FixedUserRoles.MAINTAINER,
  },
  {
    username: MigrationUser.Employee,
    credential: MigrationUser.DefaultPassword,
    fullName: 'Employee User',
    userType: AccountTypes.SYSTEM,
    roleIdentifier: FixedUserRoles.EMPLOYEE,
  },
];

export default users;
