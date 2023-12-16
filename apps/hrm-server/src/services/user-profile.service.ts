
import {UserProfile, UserProfileRequest} from '@mt-hrm/models';
import {UserProfileRepository, UserRoleRepository} from '@mt-hrm/repositories';
import {RoleService, UserService} from '@mt-hrm/services';
import {BaseService, UserRole, getError} from '@lb/infra';
import {inject} from '@loopback/core';
import {HttpErrors} from '@loopback/rest';
import _ from 'lodash';
import {NewUser} from '@mt-hrm/models/request';
import {DataObject} from '@loopback/repository';

export class UserProfileService extends BaseService {
  constructor(
    @inject('repositories.UserProfileRepository')
    private userProfileRepository: UserProfileRepository,
    @inject('services.UserService')
    private userService: UserService,
    @inject('repositories.UserRoleRepository')
    private userRoleRepository: UserRoleRepository,
    @inject('services.RoleService')
    private roleService: RoleService,
  ) {
    super({ scope: UserProfileService.name });
  }

  // ---------------------------------------------------------------------------------------------
  getRepository() {
    return this.userProfileRepository;
  }

  // ---------------------------------------------------------------------------------------------
  async create(userProfile: UserProfileRequest): Promise<UserProfile> {
    this.logger.info(
      `[Create] Starting to create new userProfile with info: ${userProfile}`,
    );
    const { credential, roleIds, username, id, ...rest } = userProfile;

    let userId;
    if (username && credential && roleIds) {
      const newNewUser = new NewUser({
        credential,
        roleIds,
      });
      this.logger.info(
        `[Create] Starting to create account new userProfile with info: ${JSON.stringify(
          newNewUser,
        )}`,
      );
      const signUpRes = await this.userService.signUp(newNewUser);
      if (!signUpRes?.user) {
        throw new HttpErrors[500]('Create user for userProfile fail');
      }
      const { user: userSaved } = signUpRes;
      userId = userSaved.id;
    }
    const newUserProfile = new UserProfile({
      ...rest,
      userId,
    });
    const savedUserProfile = await this.userProfileRepository.create(
      newUserProfile,
      {
        relationData: { username },
      },
    );
    this.logger.info(
      `[Create] Create new userProfile success with id: ${savedUserProfile.id}`,
    );
    return savedUserProfile;
  }

  // ---------------------------------------------------------------------------------------------
  async updateById(
    id: number,
    req: UserProfileRequest,
  ): Promise<UserProfile | undefined> {
    const {roleIds, userId, username, credential, ...userProfile} = req;
    const found = await this.userProfileRepository.findById(id);
    if (!found) {
      throw new HttpErrors[404]('Not found user information');
    }
    await this.userProfileRepository.updateById(id, { ...userProfile });
    if (userId && roleIds) {
      const mappings = await this.userRoleRepository.find({
        where: { userId },
      });
      if (mappings) {
        const currentRoleIds = mappings?.map((it: UserRole) => it.principalId);
        await this.roleService.updateUserRoles(userId, roleIds, currentRoleIds);
      } else {
        await this.roleService.addRolesToUser(userId, roleIds);
      }
    }
    const updatedUserProfile = await this.userProfileRepository.findById(id, {
      include: [
        { relation: 'user', scope: { include: [{ relation: 'roles' }] } },
      ],
    });

    return updatedUserProfile;
  }
  async getUserImgs(): Promise<UserProfile[]> {
    return await this.userProfileRepository.find({
      fields: {
        faceImgUrl: true,
      },
      where: {
        faceImgUrl: { neq: null as any },
      },
    });
  }
}
