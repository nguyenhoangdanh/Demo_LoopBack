import { SchemaObject } from '@loopback/rest';

export const NotionMonthFilterSchema: SchemaObject = {
  type: 'object',
  required: ['databaseId'],
  properties: {
    databaseId: { type: 'string' },
    month: { type: 'string' },
  },
  example: {
    databaseId: '63a65e7fa2454555ab6be0a74d4019ec',
    month: '2023-05',
  },
};

export type NotionMonthFilterRequest = {
  databaseId: string;
  month?: string;
};

// ------------------------------------------------------------------------------
export const NotionMonthAddSchema: SchemaObject = {
  type: 'object',
  required: ['parentDatabaseId', 'newMonth'],
  properties: {
    parentDatabaseId: { type: 'string' },
    newMonth: { type: 'string' },
  },
  example: {
    parentDatabaseId: '63a65e7fa2454555ab6be0a74d4019ec',
    newMonth: '2023-07',
  },
};

export type NotionMonthAddRequest = {
  parentDatabaseId: string;
  newMonth: string;
};

// ------------------------------------------------------------------------------
export const NotionAttendanceCreateSchema: SchemaObject = {
  type: 'object',
  required: ['parentPageId'],
  properties: {
    parentPageId: { type: 'string' },
    month: { type: 'string' },
  },
  example: {
    parentPageId: '10a8d13687054976b997a1131b51b8a7',
    month: '2023-07',
  },
};

export type NotionAttendanceCreateRequest = {
  parentPageId: string;
  month?: string;
};

// ------------------------------------------------------------------------------
export const NotionAttendanceAddSchema: SchemaObject = {
  type: 'object',
  required: ['parentDatabaseId', 'employeeId', 'checkInAt', 'date'],
  properties: {
    parentDatabaseId: { type: 'string' },
    employeeId: { type: 'integer' },
    checkInAt: { type: 'string' },
    date: { type: 'string' },
    checkInAddress: { type: 'string' },
    checkInLocation: { type: 'string' },
  },
  example: {
    parentDatabaseId: 'e50fe1ae-57d6-4b8b-8ad2-1cbb48e8896c',
    employeeId: 5,
    checkInAt: '10:31:41',
    date: '2023-06-20',
    checkInAddress: 'District 2, Ho Chi Minh City',
    checkInLocation: '10.772391 | 106.697848',
  },
};

export type NotionAttendanceAddRequest = {
  parentDatabaseId: string;
  employeeId: number;
  checkInAt: string;
  date: string;
  checkInAddress?: string;
  checkInLocation?: string;
};
