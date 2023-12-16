import { ApplicationKeys } from '@mt-hrm/common';
import { PostgresDataSource } from '@mt-hrm/datasources';
import { User, UserProfile } from '@mt-hrm/models';
import { UserRepository } from '@mt-hrm/repositories';
import { IdType, TzCrudRepository } from '@lb/infra';
import { Getter, inject } from '@loopback/core';
import { BelongsToAccessor, repository } from '@loopback/repository';

export class UserProfileRepository extends TzCrudRepository<UserProfile> {
  public readonly user: BelongsToAccessor<User, IdType>;

  constructor(
    @inject(`datasources.${ApplicationKeys.DS_POSTGRES}`)
    dataSource: PostgresDataSource,
    @repository.getter('UserRepository')
    protected userRepositoryGetter: Getter<UserRepository>,
  ) {
    super(UserProfile, dataSource);

    this.user = this.createBelongsToAccessorFor('user', userRepositoryGetter);
    this.registerInclusionResolver('user', this.user.inclusionResolver);
  }
}
