import { MigrationStatusName, MigrationStatusCode } from '@mt-hrm/common';

const status: Array<{
  name: string;
  code: string;
  description?: string;
}> = [
  {
    name: MigrationStatusName.CLOSE,
    code: MigrationStatusCode.CLOSE,
  },
  {
    name: MigrationStatusName.CANCELED,
    code: MigrationStatusCode.CANCELED,
  },
  {
    name: MigrationStatusName.COMPLETED,
    code: MigrationStatusCode.COMPLETED,
  },
  {
    name: MigrationStatusName.REVIEW,
    code: MigrationStatusCode.REVIEW,
  },
  {
    name: MigrationStatusName.IN_PROGRESS,
    code: MigrationStatusCode.IN_PROGRESS,
  },
  {
    name: MigrationStatusName.NEXT_UP,
    code: MigrationStatusCode.NEXT_UP,
  },
];

export default status;
