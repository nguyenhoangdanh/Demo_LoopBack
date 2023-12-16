import { ApplicationKeys } from '@mt-hrm/common';
import { PostgresDataSource } from '@mt-hrm/datasources';
import { Issue, Type } from '@mt-hrm/models';
import { IdType, TzCrudRepository } from '@lb/infra';
import { Getter, inject } from '@loopback/core';
import { HasManyRepositoryFactory, repository } from '@loopback/repository';
import { IssueRepository } from '@mt-hrm/repositories';

export class TypeRepository extends TzCrudRepository<Type> {
  public readonly issues: HasManyRepositoryFactory<Issue, IdType>;
  constructor(
    @inject(`datasources.${ApplicationKeys.DS_POSTGRES}`)
    dataSource: PostgresDataSource,
    @repository.getter('IssueRepository')
    protected issueRepositoryGetter: Getter<IssueRepository>,
  ) {
    super(Type, dataSource);

    this.issues = this.createHasManyRepositoryFactoryFor(
      'issues',
      issueRepositoryGetter,
    );
    this.registerInclusionResolver('issues', this.issues.inclusionResolver);
  }
}
