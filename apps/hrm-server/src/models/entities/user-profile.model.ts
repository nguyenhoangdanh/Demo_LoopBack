import { BaseTextSearchTzEntity, NumberIdType } from '@lb/infra';
import { belongsTo, model, property } from '@loopback/repository';
import { User } from '@mt-hrm/models';

@model({
  settings: {
    postgresql: {
      schema: 'public',
      table: 'UserProfile',
    },
  },
})
export class UserProfile extends BaseTextSearchTzEntity {
  @property({
    type: 'string',
    postgresql: {
      columnName: 'full_name',
      dataType: 'text',
    },
  })
  fullName?: string;

  @property({
    type: 'string',
    postgresql: {
      columnName: 'face_image_url',
      dataType: 'text',
    },
  })
  faceImgUrl?: string;

  @property({
    type: 'string',
    postgresql: {
      columnName: 'avatar_image_url',
      dataType: 'text',
    },
  })
  avatarImageUrl?: string;

  @belongsTo(() => User, {keyFrom: 'userId'}, {name: 'user_id'})
  userId: NumberIdType;

  constructor(data?: Partial<UserProfile>) {
    super(data);
  }
}

export interface UserProfileRelations {}

export type UserProfileWithRelations = UserProfile & UserProfileRelations;

export class UserProfileRequest extends UserProfile {
  @property({
    type: 'array',
    itemType: 'number',
  })
  roleIds?: NumberIdType[];

  @property({
    type: 'string',
  })
  username?: string;

  @property({
    type: 'string', 
  })
  credential?: string;

  constructor(data: Partial<UserProfileRequest>) {
    super(data);
  }
}
