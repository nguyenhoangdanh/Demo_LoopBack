import { model, property, belongsTo } from '@loopback/repository';
import { AuthenticationProviders, UserIdentifierSchemes } from '@mt-hrm/common';
import { User } from '@mt-hrm/models';
import { BaseTzEntity, NumberIdType } from '@lb/infra';

@model({
  settings: {
    postgresql: {
      schema: 'public',
      table: 'UserIdentifier',
    },
    hiddenProperties: ['createdAt', 'modifiedAt'],
  },
})
export class UserIdentifier extends BaseTzEntity {
  @property({
    type: 'string',
    require: true,
    default: UserIdentifierSchemes.USERNAME,
  })
  scheme: string;

  @property({
    type: 'string',
    default: AuthenticationProviders.MT_HRM,
  })
  provider?: string;

  @property({
    type: 'string',
    require: true,
  })
  identifier: string;

  @property({
    type: 'boolean',
    require: true,
    default: false,
  })
  verified: boolean;

  @property({
    type: 'object',
    postgresql: {
      columnName: 'details',
      dataType: 'jsonb',
    },
  })
  details?: object;


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

  constructor(data?: Partial<UserIdentifier>) {
    super(data);
  }
}
