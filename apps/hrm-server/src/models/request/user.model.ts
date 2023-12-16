import { Role } from '@lb/infra';
import { model, property } from '@loopback/repository';
import { SchemaObject } from '@loopback/rest';
import { Department, Position, UserProfile } from '../entities';

// -------------------------------------------------------------------
export type UserPairImgEncoded = {
  id: Number;
  // imgEncoded:
};

// -------------------------------------------------------------------
@model()
export class NewUser {
  @property({ type: 'string', require: true })
  username: string;

  @property({ type: 'string', require: true })
  fullName?: string;

  @property({ type: 'string', require: true })
  credential: string;

  @property({ type: 'string' })
  face_img_url?: string;

  @property({ type: 'array', itemType: 'string', require: true })
  role?: string[];

  @property({ type: 'number', require: false })
  roleId?: number;

  @property({ type: 'array', itemType: 'number' })
  roleIds?: number[];

  constructor(data: Partial<NewUser>) {
    Object.assign(this, data);
  }
}

// -------------------------------------------------------------------
export const SignInSchema: SchemaObject = {
  type: 'object',
  required: ['identifier', 'credential'],
  properties: {
    identifier: {
      type: 'object',
      required: ['scheme', 'value'],
      properties: {
        scheme: { type: 'string' },
        value: { type: 'string' },
      },
    },
    credential: {
      type: 'object',
      required: ['scheme', 'value'],
      properties: {
        scheme: { type: 'string' },
        value: { type: 'string' },
      },
    },
    provider: { type: 'string' },
  },
  example: {
    identifier: { scheme: 'username', value: 'test_username' },
    credential: { scheme: 'basic', value: 'test_password' },
  },
};

export type SignInRequest = {
  identifier: { value: string; scheme: string };
  credential: { value: string; scheme: string };
  provider?: string;
};

// -------------------------------------------------------------------
export const UpdateProfileSchema: SchemaObject = {
  type: 'object',
  properties: {
    faceImgUrl: { type: 'string' },
    fullName: { type: 'string' },
  },
  example: {
    faceImgUrl: 'bucket_name/img_name.jpg',
    fullName: 'Nguyen Van A',
  },
};

export type UpdateProfileRequest = {
  faceImgUrl?: string;
  fullName?: string;
};

// -------------------------------------------------------------------
export const UpdateUserSchema: SchemaObject = {
  type: 'object',
  properties: {
    fullname: { type: 'string' },
    departments: { type: 'array' },
    positions: { type: 'array' },
    roles: { type: 'array' },
    status: { type: 'string' },
  },
  example: {
    fullname: 'Nguyen Van A',
    departments: [1, 2],
    positions: [1, 2],
    roles: ['999-super-admin'],
    status: '100_ACTIVATED',
  },
};

export type UpdateUserRequest = {
  fullname?: string;
  departments?: number[];
  positions?: number[];
  roles?: string[];
  status?: string;
};

// ------------------------------Change Profile-------------------------------------
export const ChangeProfileSchema: SchemaObject = {
      type: 'object',
      properties: {       
        identifier: {type: 'string'},  
        fullName: {type: 'string'},      
      }
};
export type ChangeProfileRequest = {
  identifier: string; 
  fullName: string;
}


// --------------------------Change Avatar-----------------------------------------
export const ChangeAvatarSchema: SchemaObject = {
  type: 'object',
  required: ['avatarImageUrl'],
  properties: {       
    avatarImageUrl: {type: 'string'},       
  }
};
export type ChangeAvatarRequest = {
  avatarImageUrl: string; 
}
