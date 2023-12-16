import { BaseTzEntity, NumberIdType, PrincipalMixin } from '@lb/infra';
import { belongsTo, model } from '@loopback/repository';
import { User } from './user.model';

@model({
  settings: {
    postgresql: {
      schema: 'public',
      table: 'IssueAssignee',
    },
    hiddenProperties: ['createdAt', 'modifiedAt'],
  },
})
export class IssueAssignee extends PrincipalMixin(
  BaseTzEntity,
  'Issue',
  'number',
) {
  @belongsTo(
    () => User,
    { keyFrom: 'assigneeId' },
    {
      postgresql: {
        columnName: 'assignee_id',
      },
    },
  )
  assigneeId: NumberIdType;

  constructor(data?: Partial<IssueAssignee>) {
    super(data);
  }
}
