
import {FixedUserRoles, RestPaths, UserIdentifierSchemes} from '@mt-hrm/common';
import {User, UserIdentifier, UserProfile} from '@mt-hrm/models';
import {
  UserIdentifierRepository,
  UserProfileRepository,
  UserRepository,
} from '@mt-hrm/repositories';

import {
  Authentication,
  defineRelationCrudController,
  EntityRelations,
  getError,
} from '@lb/infra';
import { authenticate } from '@loopback/authentication';
import { inject } from '@loopback/core';
import {
  HttpErrors,
  api,
  getModelSchemaRef,
  param,
  patch,
  requestBody,
} from '@loopback/rest';
import {
  ChangeAvatarSchema,
  ChangeProfileRequest,
  ChangeProfileSchema,
  UpdateProfileRequest,
  UpdateProfileSchema,
} from '@mt-hrm/models/request';
import { authorize } from '@loopback/authorization';

const BaseController = defineRelationCrudController<User, UserProfile, any>({
  association: {
    source: User.name,
    relationName: 'profile',
    relationType: EntityRelations.HAS_ONE,
    target: UserProfile.name,
  },
  schema: {
    target: getModelSchemaRef(UserProfile, {
      exclude: ['id', 'createdAt', 'modifiedAt', 'userId'],
    }),
  },
  options: { controlTarget: true },
});

@authorize({ allowedRoles: [FixedUserRoles.SUPER_ADMIN, FixedUserRoles.ADMIN] })

@authenticate(Authentication.STRATEGY_JWT)
@api({ basePath: RestPaths.USER })
export class UserProfileController extends BaseController {
  constructor(
    @inject('repositories.UserRepository')
    private userRepository: UserRepository,
    @inject('repositories.UserProfileRepository')
    private userProfileRepository: UserProfileRepository,
    @inject('repositories.UserIdentifierRepository')
    private userIdentifierRepository: UserIdentifierRepository,
  ) {
    super(userRepository, userProfileRepository);
  }
  @authorize.skip()
  @patch('{id}/profile', {
    responses: {
      '200': {
        description: `Patch target model for profile relation`,
        content: { 'application/json': { schema: UserProfile } },
      },
    },
  })
  async patch(
    @param.path.number('id') id: number,
    @requestBody({
      required: true,
      content: {
        'application/json': { schema: UpdateProfileSchema },
      },
    })
    request: UpdateProfileRequest,
  ): Promise<UserProfile> {
    const { fullName, faceImgUrl } = request;
    return this.userProfileRepository.updateWithReturn(id, {
      fullName,
      faceImgUrl,
    });
  }
  @patch('/{id}/change-profile', {
    responses: {
      '204': {
        description: `Patch target model for profile relation`,
        content: {'application/json': {}},
      },
    },
  })
  async changeUser(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {schema: ChangeProfileSchema},
      },
    })
    request: ChangeProfileRequest,
  ): Promise<any> {
    const {identifier, fullName} = request;
    const isExistedUsername = await this.userIdentifierRepository.findOne({
      where: {
        scheme: UserIdentifierSchemes.USERNAME,
        identifier,
      },
    });
    const isExistedFullname = await this.userProfileRepository.findOne({
      where: {
        fullName,
      },
    });
    if (isExistedUsername && isExistedFullname) {
      throw getError({
        statusCode: 400,
        message: 'Username exists on system',
      });
    }
    return await Promise.all([
      this.userIdentifierRepository.updateById(id, {identifier}),
      this.userProfileRepository.updateById(id, {fullName}),
    ]);
  }

  @patch('/{id}/update-avatar', {
    responses: {
      '200': {
        description: `Patch target model for profile relation`,
        content: {'application/json': {}},
      },
    },
  })
  async changeAvatar(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {schema: ChangeAvatarSchema},
      },
    })
    payload: {
      avatarImageUrl: string;
    },
  ): Promise<UserProfile> {
    const data: any = await this.userRepository
      .profile(id)
      .patch({avatarImageUrl: payload.avatarImageUrl});
    return data;
  }
}
