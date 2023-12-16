import { inject, Getter } from '@loopback/core';
import { repository, BelongsToAccessor } from '@loopback/repository';
import { User, UserDepartment } from '@mt-hrm/models';
import { ApplicationKeys } from '@mt-hrm/common';
import { IdType } from '@lb/infra';
import { PostgresDataSource } from '@mt-hrm/datasources';
import { UserRepository } from '@mt-hrm/repositories';
import { TzCrudRepository } from '@lb/infra';

export class UserDepartmentRepository extends TzCrudRepository<UserDepartment> {
  constructor(
    @inject(`datasources.${ApplicationKeys.DS_POSTGRES}`)
    dataSource: PostgresDataSource,
  ) {
    super(UserDepartment, dataSource);
  }
}
