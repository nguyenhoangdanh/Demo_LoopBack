import { ApplicationKeys } from '@mt-hrm/common';
import { MigrationProcess, createViewPolicy } from '@lb/infra';

const seedPaths = [
  '001-seed-users',
  '002-seed-permissions',
  '003-seed-positions_departments',
  '004-seed-cron_locks',
  '005-seed-types',
  '006-seed-status',
  '007-seed-preferences',
  '008-seed-user-preferences',
];

export const getMigrateProcesses = async () => {
  const rs: Array<MigrationProcess> = [];

  rs.push(
    createViewPolicy({
      datasourceKey: `datasources.${ApplicationKeys.DS_POSTGRES}`,
    }),
  );

  for (const seedPath of seedPaths) {
    const process = (await import(`./${seedPath}`))?.default;

    if (!process) {
      continue;
    }

    rs.push(process);
  }

  return rs;
};
