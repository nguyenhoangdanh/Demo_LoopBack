import { NumberIdType } from '@lb/infra';
import { model, property } from '@loopback/repository';

// ----------------------------------------------------------------------------------
@model()
export class UpsertAuthorizationPermission {
  @property({ type: 'string' })
  principalType: string;

  @property({ type: 'number' })
  principalId: NumberIdType;

  @property({
    type: 'object',
    require: true,
    jsonSchema: {
      type: 'object',
      required: ['grant', 'omit'],
      properties: {
        grant: { type: 'array', items: { type: 'number' } },
        omit: { type: 'array', items: { type: 'number' } },
      },
    },
  })
  permissions: { grant: number[]; omit: number[] };
}
