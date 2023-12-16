import { IdType, PostgresDataSource, TzCrudRepository } from '@lb/infra';
import { Getter, inject } from '@loopback/core';
import {
  HasManyThroughRepositoryFactory,
  repository,
} from '@loopback/repository';
import { ApplicationKeys } from '@mt-hrm/common';
import { Issue, IssueTag, Tag } from '@mt-hrm/models';
import { IssueTagRepository } from './issue-tag.repository';
import { IssueRepository } from './issue.repository';

export class TagRepository extends TzCrudRepository<Tag> {
  public readonly issues: HasManyThroughRepositoryFactory<
    Issue,
    IdType,
    IssueTag,
    IdType
  >;
  constructor(
    @inject(`datasources.${ApplicationKeys.DS_POSTGRES}`)
    dataSource: PostgresDataSource,
    @repository.getter('IssueRepository')
    protected issueRepositoryGetter: Getter<IssueRepository>,
    @repository.getter('IssueTagRepository')
    protected issueTagRepositoryGetter: Getter<IssueTagRepository>,
  ) {
    super(Tag, dataSource);

    this.issues = this.createHasManyThroughRepositoryFactoryFor(
      'issues',
      issueRepositoryGetter,
      issueTagRepositoryGetter,
    );
    this.registerInclusionResolver('issues', this.issues.inclusionResolver);
  }
}
