
import {inject, Getter} from '@loopback/core';
import {BelongsToAccessor, Where, repository} from '@loopback/repository';
import {PostgresDataSource} from '@mt-hrm/datasources';
import {User, UserIdentifier} from '@mt-hrm/models';
import {ApplicationKeys, UserIdentifierSchemes} from '@mt-hrm/common';
import {UserRepository} from '@mt-hrm/repositories';
import {IdType, TzCrudRepository} from '@lb/infra';
import isEmpty from 'lodash/isEmpty';

export class UserIdentifierRepository extends TzCrudRepository<UserIdentifier> {
  public readonly user: BelongsToAccessor<User, IdType>;

  constructor(
    @inject(`datasources.${ApplicationKeys.DS_POSTGRES}`)
    dataSource: PostgresDataSource,
    @repository.getter('UserRepository')
    protected userRepositoryGetter: Getter<UserRepository>,
  ) {
    super(UserIdentifier, dataSource);
    this.user = this.createBelongsToAccessorFor('user', userRepositoryGetter);
    this.registerInclusionResolver('user', this.user.inclusionResolver);
  }

  async findUser(opts: { scheme?: UserIdentifierSchemes; identifier: string }) {
    const { scheme, identifier } = opts;

    if (!identifier || isEmpty(identifier)) {
      return null;
    }

    const where: any = { identifier };
    if (scheme) {
      where.scheme = scheme;
    }

    const userIdentifier = await this.findOne({ where });
    if (!userIdentifier) {
      return null;
    }

    const userRepository = await this.userRepositoryGetter();
    const user = await userRepository.findById(userIdentifier.userId);
    return user;
  }
}
