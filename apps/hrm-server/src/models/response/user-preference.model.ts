import { SchemaObject } from '@loopback/rest';

export type UserPreferencesResponse = {
  id: number;
  principalType: string;
  userValue: number;
  effectYear: number;
};

export const UserPreferencesSchema: SchemaObject = {
  type: 'array',
  items: {
    type: 'object',
    required: ['principalType', 'effectYear', 'userValue'],
    properties: {
      principalType: {
        type: 'string',
      },
      effectYear: {
        type: 'number',
      },
      userValue: {
        type: 'number',
      },
    },
  },
  examples: [
    {
      principalType: 'full-days-off',
      effectYear: 2024,
      userValue: 15,
    },
    {
      principalType: 'parking-fee',
      effectYear: 2024,
      userValue: 1500000,
    },
  ],
};
