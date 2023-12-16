import { BaseTzEntity } from '@lb/infra';
import { model, property } from '@loopback/repository';

@model({
  settings: {
    postgresql: {
      schema: 'public',
      table: 'CronLock',
    },
    hiddenProperties: ['createdAt', 'modifiedAt'],
  },
})
export class CronLock extends BaseTzEntity {
  @property({
    type: 'boolean',
    postgresql: {
      columnName: 'locked',
      dataType: 'boolean',
    },
    default: false,
  })
  locked: boolean;

  @property({
    type: 'string',
    postgresql: {
      columnName: 'description',
      dataType: 'text',
    },
  })
  description?: string;

  @property({
    type: 'string',
    postgresql: {
      columnName: 'code',
      dataType: 'text',
    },
  })
  code: string;

  @property({
    type: 'string',
    postgresql: {
      columnName: 'cron_time',
      dataType: 'text',
    },
  })
  cronTime?: string;

  constructor(data?: Partial<CronLock>) {
    super(data);
  }
}
