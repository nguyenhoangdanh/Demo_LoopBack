import { MigrationTypeCode, MigrationTypeName } from '@mt-hrm/common';

const types: Array<{
  name: string;
  code: string;
  description?: string;
}> = [
  {
    name: MigrationTypeName.WORK_FROM_HOME,
    code: MigrationTypeCode.WORK_FROM_HOME,
  },
  {
    name: MigrationTypeName.HALF_DAY_OFF,
    code: MigrationTypeCode.HALF_DAY_OFF,
  },
  {
    name: MigrationTypeName.FULL_DAY_OFF,
    code: MigrationTypeCode.FULL_DAY_OFF,
  },
  {
    name: MigrationTypeName.OTHERS,
    code: MigrationTypeCode.OTHERS,
  },
];

export default types;
