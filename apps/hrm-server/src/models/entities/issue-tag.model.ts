import { BaseTzEntity, NumberIdType, PrincipalMixin } from '@lb/infra';
import { belongsTo, model } from '@loopback/repository';
import { Tag } from './tag.model';

@model({
  settings: {
    postgresql: {
      schema: 'public',
      table: 'IssueTag',
    },
    hiddenProperties: ['createdAt', 'modifiedAt'],
  },
})
export class IssueTag extends PrincipalMixin(BaseTzEntity, 'Issue', 'number') {
  @belongsTo(
    () => Tag,
    { keyFrom: 'id' },
    {
      postgresql: {
        columnName: 'tag_id',
      },
    },
  )
  tagId: NumberIdType;

  constructor(data?: Partial<IssueTag>) {
    super(data);
  }
}
