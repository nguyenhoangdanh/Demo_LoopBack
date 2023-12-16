import { ApplicationKeys } from '@mt-hrm/common';
import { PostgresDataSource } from '@mt-hrm/datasources';
import { CronLock } from '@mt-hrm/models';
import { TzCrudRepository } from '@lb/infra';
import { inject } from '@loopback/core';

// ----------------------------------------------------------------------------
export class CronLockRepository extends TzCrudRepository<CronLock> {
  constructor(
    @inject(`datasources.${ApplicationKeys.DS_POSTGRES}`)
    dataSource: PostgresDataSource,
  ) {
    super(CronLock, dataSource);
  }
}
