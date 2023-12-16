import { TzCrudRepository } from '@lb/infra';
import { inject } from '@loopback/core';
import { ApplicationKeys } from '@mt-hrm/common';
import { PostgresDataSource } from '@mt-hrm/datasources';
import { UserPreference } from '@mt-hrm/models';

export class UserPreferenceRepository extends TzCrudRepository<UserPreference> {
  constructor(
    @inject(`datasources.${ApplicationKeys.DS_POSTGRES}`)
    dataSource: PostgresDataSource,
  ) {
    super(UserPreference, dataSource);
  }
}
