import { BaseTzEntity } from '@lb/infra';
import { hasMany, model, property } from '@loopback/repository';
import { Issue } from './issue.model';

@model({
  settings: {
    postgresql: {
      schema: 'public',
      table: 'Type',
    },
    hiddenProperties: ['createdAt', 'modifiedAt'],
  },
})
export class Type extends BaseTzEntity {
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

  @hasMany(() => Issue, { keyTo: 'typeId' })
  issues: Issue[];

  constructor(data?: Partial<Type>) {
    super(data);
  }
}
