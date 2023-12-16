import { inject, Getter } from '@loopback/core';
import { repository, BelongsToAccessor } from '@loopback/repository';
import { User, UserPosition } from '@mt-hrm/models';
import { ApplicationKeys } from '@mt-hrm/common';
import { IdType } from '@lb/infra';
import { PostgresDataSource } from '@mt-hrm/datasources';
import { UserRepository } from '@mt-hrm/repositories';
import { TzCrudRepository } from '@lb/infra';

export class UserPositionRepository extends TzCrudRepository<UserPosition> {
  public readonly user: BelongsToAccessor<User, IdType>;

  constructor(
    @repository.getter('UserRepository')
    protected userRepositoryGetter: Getter<UserRepository>,
    @inject(`datasources.${ApplicationKeys.DS_POSTGRES}`)
    dataSource: PostgresDataSource,
  ) {
    super(UserPosition, dataSource);
    this.user = this.createBelongsToAccessorFor('user', userRepositoryGetter);
    this.registerInclusionResolver('user', this.user.inclusionResolver);
  }
}
