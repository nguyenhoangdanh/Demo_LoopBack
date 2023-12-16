import { ApplicationKeys } from '@mt-hrm/common';
import { PostgresDataSource } from '@mt-hrm/datasources';
import { User, Preference, UserPreference } from '@mt-hrm/models';
import { IdType, TzCrudRepository } from '@lb/infra';
import { Getter, inject } from '@loopback/core';
import {
  HasManyThroughRepositoryFactory,
  repository,
} from '@loopback/repository';
import { UserRepository, UserPreferenceRepository } from '@mt-hrm/repositories';

export class PreferenceRepository extends TzCrudRepository<Preference> {
  public readonly users: HasManyThroughRepositoryFactory<
    User,
    IdType,
    UserPreference,
    IdType
  >;
  constructor(
    @inject(`datasources.${ApplicationKeys.DS_POSTGRES}`)
    dataSource: PostgresDataSource,
    @repository.getter('UserRepository')
    protected userRepositoryGetter: Getter<UserRepository>,
    @repository.getter('UserPreferenceRepository')
    protected userPreferenceRepositoryGetter: Getter<UserPreferenceRepository>,
  ) {
    super(Preference, dataSource);

    this.users = this.createHasManyThroughRepositoryFactoryFor(
      'users',
      userRepositoryGetter,
      userPreferenceRepositoryGetter,
    );

    this.registerInclusionResolver('users', this.users.inclusionResolver);
  }
}
