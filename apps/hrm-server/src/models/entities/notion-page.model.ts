import { BaseTzEntity } from '@lb/infra';
import { hasMany, model, property } from '@loopback/repository';
import { Attendance } from '@mt-hrm/models';

@model({
  settings: {
    postgresql: {
      schema: 'public',
      table: 'NotionPage',
    },
  },
  hiddenProperties: ['modifiedAt'],
})
export class NotionPage extends BaseTzEntity {
  @property({
    type: 'string',
    postgresql: {
      columnName: 'month_page_id',
      dataType: 'text',
    },
  })
  pageId: string;

  @property({
    type: 'string',
    postgresql: {
      columnName: 'attendance_database_id',
      dataType: 'text',
    },
  })
  databaseId: string;

  @hasMany(() => Attendance, { keyTo: 'notionPageId' })
  attendances: Attendance[];

  constructor(data?: Partial<NotionPage>) {
    super(data);
  }
}
