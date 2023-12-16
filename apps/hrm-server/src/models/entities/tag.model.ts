import { BaseTzEntity } from '@lb/infra';
import { hasMany, model, property } from '@loopback/repository';
import { Issue } from './issue.model';
import { IssueTag } from './issue-tag.model';

@model({
  settings: {
    postgresql: {
      schema: 'public',
      table: 'Tag',
    },
    hiddenProperties: ['createdAt', 'modifiedAt'],
  },
})
export class Tag extends BaseTzEntity {
  @property({
    type: 'string',
  })
  name: string;

  @property({
    type: 'string',
  })
  code: string;

  @property({
    type: 'string',
  })
  description: string;

  @hasMany(() => Issue, {
    through: {
      model: () => IssueTag,
      keyFrom: 'tagId',
      keyTo: 'principalId',
    },
  })
  issues: Issue[];

  constructor(data?: Partial<Tag>) {
    super(data);
  }
}
