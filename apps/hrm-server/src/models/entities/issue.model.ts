import { BaseTzEntity, NumberIdType } from '@lb/infra';
import {
  belongsTo,
  hasMany,
  hasOne,
  model,
  property,
} from '@loopback/repository';
import { User } from './user.model';
import { IssueAssignee } from './issue-assignee.model';
import { Tag } from './tag.model';
import { IssueTag } from './issue-tag.model';
import { Type } from './type.model';
import { Status } from './status.model';

@model({
  settings: {
    postgresql: {
      schema: 'public',
      table: 'Issue',
    },
  },
})
export class Issue extends BaseTzEntity {
  @property({
    type: 'string',
    postgresql: {
      columnName: 'title',
      dataType: 'text',
    },
  })
  title?: string;

  @property({
    type: 'string',
    postgresql: {
      columnName: 'description',
      dataType: 'text',
    },
  })
  description?: string;

  @property({
    type: 'date',
    postgresql: {
      columnName: 'request_date',
      dataType: 'timestamptz',
    },
  })
  requestDate?: Date;

  @hasMany(() => Tag, {
    through: {
      model: () => IssueTag,
      keyFrom: 'principalId',
      keyTo: 'tagId',
    },
  })
  tags?: Tag[];

  @hasMany(() => User, {
    through: {
      model: () => IssueAssignee,
      keyFrom: 'principalId',
      keyTo: 'assigneeId',
    },
  })
  assignees?: User[];

  @belongsTo(() => User, { keyFrom: 'authorId' }, { name: 'author_id' })
  authorId: NumberIdType;

  @belongsTo(() => Type, { keyFrom: 'typeId' }, { name: 'type_id' })
  typeId: NumberIdType;

  @belongsTo(() => Status, { keyFrom: 'statusId' }, { name: 'status_id' })
  statusId: NumberIdType;

  constructor(data?: Partial<Issue>) {
    super(data);
  }
}
