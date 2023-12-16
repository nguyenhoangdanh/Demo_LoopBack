import { BaseTzEntity } from '@lb/infra';
import { hasMany, model, property } from '@loopback/repository';
import { UserPreference } from './user-preference.model';
import { User } from './user.model';

@model({
  settings: {
    postgresql: {
      schema: 'public',
      table: 'Preference',
    },
    hiddenProperties: ['createdAt', 'modifiedAt'],
  },
})
export class Preference extends BaseTzEntity {
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
      columnName: 'description',
      dataType: 'text',
    },
  })
  description: string;

  @property({
    type: 'number',
    postgresql: {
      columnName: 'value',
      dataType: 'integer',
    },
  })
  value: number;

  @hasMany(() => User, {
    through: {
      model: () => UserPreference,
      keyFrom: 'principalId',
      keyTo: 'userId',
    },
  })
  users: User[];

  constructor(data?: Partial<Preference>) {
    super(data);
  }
}
