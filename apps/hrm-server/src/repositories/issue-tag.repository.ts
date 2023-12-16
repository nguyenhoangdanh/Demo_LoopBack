import { PostgresDataSource, TzCrudRepository } from '@lb/infra';
import { inject } from '@loopback/core';
import { ApplicationKeys } from '@mt-hrm/common';
import { IssueTag } from '@mt-hrm/models';

export class IssueTagRepository extends TzCrudRepository<IssueTag> {
  constructor(
    @inject(`datasources.${ApplicationKeys.DS_POSTGRES}`)
    dataSource: PostgresDataSource,
  ) {
    super(IssueTag, dataSource);
  }
}
