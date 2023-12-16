import { PostgresDataSource, TzCrudRepository } from '@lb/infra';
import { inject } from '@loopback/core';
import { ApplicationKeys } from '@mt-hrm/common';
import { IssueAssignee } from '@mt-hrm/models/entities/issue-assignee.model';

export class IssueAssigneeRepository extends TzCrudRepository<IssueAssignee> {
  constructor(
    @inject(`datasources.${ApplicationKeys.DS_POSTGRES}`)
    dataSource: PostgresDataSource,
  ) {
    super(IssueAssignee, dataSource);
  }
}
