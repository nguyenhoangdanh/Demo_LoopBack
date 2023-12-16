import { model, property, belongsTo } from '@loopback/repository';
import { User } from '@mt-hrm/models';
import { BaseTzEntity, NumberIdType } from '@lb/infra';
import { AuthenticationProviders, UserCredentialSchemes } from '@mt-hrm/common';

@model({
  settings: {
    postgresql: {
      schema: 'public',
      table: 'UserCredential',
    },
    hiddenProperties: ['createdAt', 'modifiedAt', 'credential'],
  },
})
export class UserCredential extends BaseTzEntity {
  @property({
    type: 'string',
    default: UserCredentialSchemes.BASIC,
  })
  scheme: string;

  @property({
    type: 'string',
    default: AuthenticationProviders.MT_HRM,
  })
  provider: string;

  @property({
    type: 'string',
    hidden: true,
  })
  credential: string;

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

  constructor(data?: Partial<UserCredential>) {
    super(data);
  }
}

export interface UserCredentialRelations {}

export type UserCredentialWithRelations = UserCredential &
  UserCredentialRelations;
