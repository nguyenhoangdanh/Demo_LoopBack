import { BaseTzEntity, NumberIdType } from '@lb/infra';
import { belongsTo, model, property } from '@loopback/repository';
import { NotionPage, User } from '@mt-hrm/models';

@model({
  settings: {
    postgresql: {
      schema: 'public',
      table: 'Attendance',
    },
  },
})
export class Attendance extends BaseTzEntity {
  @property({
    type: 'date',
    postgresql: {
      columnName: 'check_out_time',
      dataType: 'timestamptz',
    },
  })
  checkOutTime?: Date;

  @property({
    type: 'object',
    required: true,
    postgresql: {
      columnName: 'coordinates',
      dataType: 'json',
    },
  })
  coordinates: object;

  @property({
    type: 'string',
    postgresql: {
      columnName: 'address',
      dataType: 'text',
    },
  })
  address?: string;

  @property({
    type: 'string',
    postgresql: {
      columnName: 'notion_record_id',
      dataType: 'text',
    },
  })
  notionRecordId?: string | null;

  @belongsTo(() => User, { keyFrom: 'userId' }, { name: 'user_id' })
  userId: NumberIdType;

  @belongsTo(
    () => NotionPage,
    { keyFrom: 'notionPageId' },
    { name: 'notion_page_id' },
  )
  notionPageId: NumberIdType;

  constructor(data?: Partial<Attendance>) {
    super(data);
  }
}
