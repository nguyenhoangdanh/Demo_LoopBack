import { IdType, PostgresDataSource, TzCrudRepository } from '@lb/infra';
import { Getter, inject } from '@loopback/core';
import {
  BelongsToAccessor,
  HasManyThroughRepositoryFactory,
  repository,
} from '@loopback/repository';
import { ApplicationKeys } from '@mt-hrm/common';
import { IssueTag, Status, Tag, Type, User } from '@mt-hrm/models';
import { IssueAssignee } from '@mt-hrm/models/entities/issue-assignee.model';
import { Issue } from '@mt-hrm/models/entities/issue.model';
import { UserRepository } from './user.repository';
import { IssueAssigneeRepository } from './issue-assignee.repository';
import { TypeRepository } from './type.repository';
import { StatusRepository } from './status.repository';
import { IssueTagRepository } from './issue-tag.repository';
import { TagRepository } from './tag.repository';

export class IssueRepository extends TzCrudRepository<Issue> {
  public readonly assignees: HasManyThroughRepositoryFactory<
    User,
    IdType,
    IssueAssignee,
    IdType
  >;
  public readonly tags: HasManyThroughRepositoryFactory<
    Tag,
    IdType,
    IssueTag,
    IdType
  >;
  public readonly author: BelongsToAccessor<User, IdType>;
  public readonly type: BelongsToAccessor<Type, IdType>;
  public readonly status: BelongsToAccessor<Status, IdType>;
  constructor(
    @inject(`datasources.${ApplicationKeys.DS_POSTGRES}`)
    dataSource: PostgresDataSource,
    @repository.getter('UserRepository')
    protected userRepositoryGetter: Getter<UserRepository>,
    @repository.getter('TypeRepository')
    protected typeRepositoryGetter: Getter<TypeRepository>,
    @repository.getter('StatusRepository')
    protected statusRepositoryGetter: Getter<StatusRepository>,
    @repository.getter('IssueAssigneeRepository')
    protected issueAssigneeRepositoryGetter: Getter<IssueAssigneeRepository>,
    @repository.getter('TagRepository')
    protected tagRepositoryGetter: Getter<TagRepository>,
    @repository.getter('IssueTagRepository')
    protected issueTagRepositoryGetter: Getter<IssueTagRepository>,
  ) {
    super(Issue, dataSource);

    this.author = this.createBelongsToAccessorFor(
      'author',
      userRepositoryGetter,
    );
    this.registerInclusionResolver('author', this.author.inclusionResolver);

    this.type = this.createBelongsToAccessorFor('type', typeRepositoryGetter);
    this.registerInclusionResolver('type', this.type.inclusionResolver);

    this.status = this.createBelongsToAccessorFor(
      'status',
      statusRepositoryGetter,
    );
    this.registerInclusionResolver('status', this.status.inclusionResolver);

    this.assignees = this.createHasManyThroughRepositoryFactoryFor(
      'assignees',
      userRepositoryGetter,
      issueAssigneeRepositoryGetter,
    );
    this.registerInclusionResolver(
      'assignees',
      this.assignees.inclusionResolver,
    );

    this.tags = this.createHasManyThroughRepositoryFactoryFor(
      'tags',
      tagRepositoryGetter,
      issueTagRepositoryGetter,
    );
    this.registerInclusionResolver('tags', this.tags.inclusionResolver);
  }
}
