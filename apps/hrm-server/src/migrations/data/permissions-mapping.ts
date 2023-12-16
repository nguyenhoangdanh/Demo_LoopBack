import { AuthorizationEffect, FixedUserRoles } from '@mt-hrm/common';

const permissionsMapping: Array<{
  roleIdentifier: FixedUserRoles[];
  permissionCode?: string[];
  effect: AuthorizationEffect;
}> = [
  {
    roleIdentifier: [FixedUserRoles.OPERATOR, FixedUserRoles.MAINTAINER],
    effect: AuthorizationEffect.ALLOW,
    permissionCode: [
      'attendance.findAll',
      'attendance.findById',
      'attendance.count',

      'authentication.signUp',
      'authentication.resetPassword',

      'checkin.encodeImage',

      'department.findAll',
      'department.findById',
      'department.count',
      'department.create',
      'department.updateAll',
      'department.updateById',
      'department.replaceById',
      'department.deleteById',

      'issue.deleteById',
      'issue.count',
      'issue.replaceById',
      'issue.updateAll',

      'notion.getPage',
      'notion.getDatabase',
      'notion.filterDatabaseWithMonth',
      'notion.createMonthPage',
      'notion.createAttendanceRecord',
      'notion.createAttendancePage',

      'position.findAll',
      'position.findById',
      'position.count',
      'position.create',
      'position.updateAll',
      'position.updateById',
      'position.replaceById',
      'position.deleteById',

      'status.create',
      'status.updateAll',
      'status.updateById',
      'status.replaceById',
      'status.deleteById',

      'role.findAll',

      'tag.create',
      'tag.updateAll',
      'tag.updateById',
      'tag.replaceById',
      'tag.deleteById',

      'type.create',
      'type.updateAll',
      'type.updateById',
      'type.replaceById',
      'type.deleteById',

      'user.count',
      'user.create',
      'user.updateAll',
      'user.updateUser',
      'user.replaceById',
      'user.deleteById',
      'user.filterUsersNotInDepartments',

      'userdepartment.get',
      'userdepartment.link',
      'userdepartment.unlink',

      'userposition.get',
      'userposition.link',
      'userposition.unlink',

      'userprofile.create',
      'userprofile.patch',
      'userprofile.delete',

      'issue.findAll',

      'user.findAll',
    ],
  },
  {
    roleIdentifier: [
      FixedUserRoles.EMPLOYEE,
      FixedUserRoles.MANAGER,
      FixedUserRoles.OPERATOR,
      FixedUserRoles.MAINTAINER,
    ],
    effect: AuthorizationEffect.ALLOW,
    permissionCode: [
      'authentication.changePassword',

      'checkin.checkIn',
      'checkin.checkOut',

      'issue.updateIssue',
      'issue.findById',
      'issue.create',

      'metalink.upload',

      'userattendance.findByUserId',

      'status.find',
      'status.findById',
      'status.count',

      'tag.find',
      'tag.findById',
      'tag.count',

      'type.find',
      'type.findById',
      'type.count',

      'userprofile.find',

      'user.findById',
      'user.findHigherRoles',
    ],
  },
];

export default permissionsMapping;
