import { Getter, inject } from '@loopback/core';
import {
  HasManyThroughRepositoryFactory,
  repository,
} from '@loopback/repository';

import { ApplicationKeys } from '@mt-hrm/common';
import { PostgresDataSource } from '@mt-hrm/datasources';
import { Department, User, UserDepartment } from '@mt-hrm/models';
import { UserRepository, UserDepartmentRepository } from '@mt-hrm/repositories';
import { IdType, TzCrudRepository } from '@lb/infra';

// ----------------------------------------------------------------------------
export class DepartmentRepository extends TzCrudRepository<Department> {
  public readonly users: HasManyThroughRepositoryFactory<
    User,
    IdType,
    UserDepartment,
    IdType
  >;

  constructor(
    @inject(`datasources.${ApplicationKeys.DS_POSTGRES}`)
    dataSource: PostgresDataSource,
    @repository.getter('UserRepository')
    protected userRepositoryGetter: Getter<UserRepository>,
    @repository.getter('UserDepartmentRepository')
    protected userDepartmentRepositoryGetter: Getter<UserDepartmentRepository>,
  ) {
    super(Department, dataSource);

    this.users = this.createHasManyThroughRepositoryFactoryFor(
      'users',
      userRepositoryGetter,
      userDepartmentRepositoryGetter,
    );
    this.registerInclusionResolver('users', this.users.inclusionResolver);
  }
}
