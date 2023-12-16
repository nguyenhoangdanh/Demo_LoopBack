import { BaseTzEntity } from '@lb/infra';
import { hasMany, model, property } from '@loopback/repository';
import { User, UserDepartment } from '@mt-hrm/models';

@model({
  settings: {
    postgresql: {
      schema: 'public',
      table: 'Department',
    },
    hiddenProperties: ['createdAt', 'modifiedAt'],
  },
})
export class Department extends BaseTzEntity {
  @property({
    type: 'string',
  })
  name: string;

  @property({
    type: 'string',
  })
  code: string;

  @hasMany(() => User, {
    through: {
      model: () => UserDepartment,
      keyFrom: 'principalId',
      keyTo: 'userId',
    },
  })
  users: User[];

  constructor(data?: Partial<Department>) {
    super(data);
  }
}
