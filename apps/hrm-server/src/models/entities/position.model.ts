import { BaseTzEntity } from '@lb/infra';
import { hasMany, model, property } from '@loopback/repository';
import { User, UserPosition } from '@mt-hrm/models';

@model({
  settings: {
    postgresql: {
      schema: 'public',
      table: 'Position',
    },
    hiddenProperties: ['createdAt', 'modifiedAt'],
  },
})
export class Position extends BaseTzEntity {
  @property({
    type: 'string',
  })
  title: string;

  @property({
    type: 'string',
  })
  code: string;

  @hasMany(() => User, {
    through: {
      model: () => UserPosition,
      keyFrom: 'principalId',
      keyTo: 'userId',
    },
  })
  users: User[];

  constructor(data?: Partial<Position>) {
    super(data);
  }
}
