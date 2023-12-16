import { inject, Getter } from '@loopback/core';
import { repository, BelongsToAccessor } from '@loopback/repository';
import { User, UserCredential } from '@mt-hrm/models';
import { ApplicationKeys } from '@mt-hrm/common';
import { IdType, TzCrudRepository } from '@lb/infra';
import { PostgresDataSource } from '@mt-hrm/datasources';
import { UserRepository } from '@mt-hrm/repositories';

export class UserCredentialRepository extends TzCrudRepository<UserCredential> {
  public readonly user: BelongsToAccessor<User, IdType>;

  constructor(
    @inject(`datasources.${ApplicationKeys.DS_POSTGRES}`)
    dataSource: PostgresDataSource,
    @repository.getter('UserRepository')
    protected userRepositoryGetter: Getter<UserRepository>,
  ) {
    super(UserCredential, dataSource);

    this.user = this.createBelongsToAccessorFor('user', userRepositoryGetter);
    this.registerInclusionResolver('user', this.user.inclusionResolver);
  }
}
