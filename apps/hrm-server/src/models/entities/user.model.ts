import { Role, UserRole, defineUser } from '@lb/infra';
import { hasMany, hasOne, model } from '@loopback/repository';
import {
  Attendance,
  Department,
  Position,
  UserCredential,
  UserIdentifier,
  UserProfile,
  UserDepartment,
  UserPosition,
  UserPreference,
} from '@mt-hrm/models';
import { Issue } from './issue.model';
import { IssueAssignee } from './issue-assignee.model';
import { Preference } from './preference.model';

const BaseUser = defineUser();

@model({
  settings: {
    postgresql: {
      schema: 'public',
      table: 'User',
    },
    hiddenProperties: [
      'createdAt',
      'modifiedAt',
      'realm',
      'parentId',
      'activatedAt',
    ],
  },
})
export class User extends BaseUser {
  @hasOne(() => UserProfile, { keyTo: 'userId' })
  profile: UserProfile;

  @hasMany(() => UserIdentifier, { keyTo: 'userId' })
  identifiers: UserIdentifier[];

  @hasMany(() => UserCredential, { keyTo: 'userId' })
  credentials: UserCredential[];

  @hasMany(() => Attendance, { keyTo: 'userId' })
  attendances: Attendance[];

  @hasMany(() => Position, {
    through: {
      model: () => UserPosition,
      keyFrom: 'userId',
      keyTo: 'principalId',
    },
  })
  positions: Position[];

  @hasMany(() => Department, {
    through: {
      model: () => UserDepartment,
      keyFrom: 'userId',
      keyTo: 'principalId',
    },
  })
  departments: Department[];

  @hasMany(() => Role, {
    through: {
      model: () => UserRole,
      keyFrom: 'userId',
      keyTo: 'principalId',
    },
  })
  roles: Role[];

  @hasMany(() => Issue, {
    through: {
      model: () => IssueAssignee,
      keyFrom: 'assigneeId',
      keyTo: 'principalId',
    },
  })
  issuesAssigned: Issue[];

  @hasMany(() => Issue, { keyTo: 'authorId' })
  issues: Issue[];

  @hasMany(() => Preference, {
    through: {
      model: () => UserPreference,
      keyFrom: 'userId',
      keyTo: 'principalId',
    },
  })
  preferences: Preference[];

  constructor(data?: Partial<User>) {
    super(data);
  }
}
