import { IdType, Role } from '@lb/infra';
import { User, UserIdentifier } from '../entities';

// -------------------------------------------------------------------
export type GetUserResponse = {
  total: number;
  data: User[];
};

// -------------------------------------------------------------------
export type SignInResponse = {
  userId: IdType;
  roles: {
    identifier: string;
    name: string;
    priority: number;
  }[];
  rules?: string[];
};

// -------------------------------------------------------------------
export type SignUpResponse = {
  user?: User | null;
  identifiers?: UserIdentifier[];
  roles?: Role[];
};
// -------------------------------------------------------------------
export type ChangeProfileResponse = {
  statusCode: number;
  message: string;
};