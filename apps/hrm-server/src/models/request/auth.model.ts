import { SchemaObject } from '@loopback/rest';

export const SignUpSchema: SchemaObject = {
  type: 'object',
  required: ['username', 'password', 'fullname', 'faceImgUrl'],
  properties: {
    username: { type: 'string' },
    password: { type: 'string' },
    fullname: { type: 'string' },
    faceImgUrl: { type: 'string' },
  },
  example: {
    username: 'new_username',
    password: 'new_password',
    fullname: 'Nguyen Van A',
    faceImgFile: 'image file',
  },
};

export type SignUpRequest = {
  username: string;
  password: string;
  fullname: string;
  faceImgUrl: string;
  role: number;
};

export const ChangePasswordSchema: SchemaObject = {
  type: 'object',
  required: ['currentPassword', 'newPassword'],
  properties: {
    currentPassword: { type: 'string' },
    newPassword: { type: 'string' },
    scheme: { type: 'string' },
  },
};

export const ResetPasswordSchema: SchemaObject = {
  type: 'object',
  required: ['userId'],
  properties: {
    userId: { type: 'number' },
    newPassword: { type: 'string' },
    scheme: { type: 'string' },
  },
};
