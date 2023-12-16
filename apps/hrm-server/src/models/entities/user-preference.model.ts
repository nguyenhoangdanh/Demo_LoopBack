import { model, belongsTo, property } from '@loopback/repository';
import { User } from '@mt-hrm/models';
import { BaseTzEntity, NumberIdType, PrincipalMixin } from '@lb/infra';

// --------------------------------------------------------------------------------
@model({
  settings: {
    postgresql: {
      schema: 'public',
      table: 'UserPreference',
    },
    hiddenProperties: ['createdAt', 'modifiedAt'],
    indexes: {
      keys: { principalId: 1, userId: 1, effectYear: 1 },
      options: { unique: true },
    },
  },
})
export class UserPreference extends PrincipalMixin(
  BaseTzEntity,
  'Preference',
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

  @property({
    type: 'number',
    postgresql: {
      columnName: 'user_value',
      dataType: 'integer',
    },
  })
  userValue: number;

  @property({
    type: 'number',
    postgresql: {
      columnName: 'effect_year',
      dataType: 'smallint',
    },
  })
  effectYear: number;

  constructor(data?: Partial<UserPreference>) {
    super(data);
  }
}
