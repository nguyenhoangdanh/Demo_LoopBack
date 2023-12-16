import { SchemaObject } from '@loopback/rest';

export const CheckOutSchema: SchemaObject = {
  type: 'object',
  required: ['checkOutTime'],
  properties: {
    checkOutTime: { type: 'string' },
  },
};

export type CheckOutRequest = {
  checkOutTime: string;
};
