import { MtHrmApplication } from '@mt-hrm/hrm-application';
import {
  Attendance,
  Department,
  Position,
  Migration,
  User,
  UserCredential,
  UserIdentifier,
  UserProfile,
  UserDepartment,
  UserPosition,
  NotionPage,
  CronLock,
  Issue,
  IssueAssignee,
  IssueTag,
  Tag,
  Type,
  Status,
  Preference,
  UserPreference,
} from '@mt-hrm/models';
import {
  applicationLogger,
  migration,
  Permission,
  PermissionMapping,
  Role,
  UserRole,
} from '@lb/infra';
import { getMigrateProcesses } from '@mt-hrm/migrations/migration-processes';

const models = [
  Migration.name,
  User.name,
  UserIdentifier.name,
  UserCredential.name,
  UserProfile.name,
  UserDepartment.name,
  UserPosition.name,
  Role.name,
  Permission.name,
  PermissionMapping.name,
  UserRole.name,
  NotionPage.name,
  Attendance.name,
  Department.name,
  Position.name,
  CronLock.name,
  Issue.name,
  IssueAssignee.name,
  IssueTag.name,
  Tag.name,
  Type.name,
  Status.name,
  Preference.name,
  UserPreference.name,
];

export async function migrate(args: string[]) {
  const existingSchema = args.includes('--rebuild') ? 'drop' : 'alter';

  const app = new MtHrmApplication();

  await app.boot();
  await app.migrateSchema({ existingSchema, models });

  //Migration by file
  const migrateProcesses = await getMigrateProcesses();
  migrateProcesses?.forEach(el => {
    const { name } = el;
    applicationLogger.info('Migration processes: %o', name);
  });

  await migration(app, migrateProcesses);
}

migrate(process.argv)
  .then(() => {
    process.exit(0);
  })
  .catch(err => {
    console.error('Cannot migrate database schema', err);
    process.exit(1);
  });
