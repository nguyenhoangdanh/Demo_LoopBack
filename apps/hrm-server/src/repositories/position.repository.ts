import { Getter, inject } from '@loopback/core';
import { HasManyRepositoryFactory, repository } from '@loopback/repository';

import { ApplicationKeys } from '@mt-hrm/common';
import { PostgresDataSource } from '@mt-hrm/datasources';
import { Position, User } from '@mt-hrm/models';
import { UserPositionRepository, UserRepository } from '@mt-hrm/repositories';
import { IdType, TzCrudRepository } from '@lb/infra';

// ----------------------------------------------------------------------------
export class PositionRepository extends TzCrudRepository<Position> {
  public readonly users: HasManyRepositoryFactory<User, IdType>;

  constructor(
    @inject(`datasources.${ApplicationKeys.DS_POSTGRES}`)
    dataSource: PostgresDataSource,
    @repository.getter('UserRepository')
    protected userRepositoryGetter: Getter<UserRepository>,
    @repository.getter('UserPositionRepository')
    protected userPositionRepositoryGetter: Getter<UserPositionRepository>,
  ) {
    super(Position, dataSource);

    this.users = this.createHasManyThroughRepositoryFactoryFor(
      'users',
      userRepositoryGetter,
      userPositionRepositoryGetter,
    );
    this.registerInclusionResolver('users', this.users.inclusionResolver);
  }
}
