import { model, belongsTo } from '@loopback/repository';
import { User } from '@mt-hrm/models';
import { BaseTzEntity, NumberIdType, PrincipalMixin } from '@lb/infra';

// --------------------------------------------------------------------------------
@model({
  settings: {
    postgresql: {
      schema: 'public',
      table: 'UserDepartment',
    },
    hiddenProperties: ['createdAt', 'modifiedAt'],
    indexes: {
      INDEX_UNIQUE_USER_DEPARTMENT: {
        keys: { userId: 1, principalId: 1 },
        options: { unique: true },
      },
    },
  },
})
export class UserDepartment extends PrincipalMixin(
  BaseTzEntity,
  'Department',
  'number',
) {
  @belongsTo(
    () => User,
    { keyFrom: 'userId' },
    {
      postgresql: {
        columnName: 'user_id',
      },
    },
  )
  userId: NumberIdType;

  constructor(data?: Partial<UserDepartment>) {
    super(data);
  }
}
