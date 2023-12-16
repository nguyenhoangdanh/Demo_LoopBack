import { inject } from '@loopback/core';
import { HttpErrors } from '@loopback/rest';

import {
  Authentication,
  AuthenticationProviders,
  DefaultPassword,
  EmployeeStatus,
  Messages,
  ReturnError,
  UserCredentialSchemes,
  UserIdentifierSchemes,
  InitailPreferencesCode,
  Pagination,
} from '@mt-hrm/common';
import {
  User,
  UserCredential,
  UserIdentifier,
  UserProfile,
  UserProfileRequest,
} from '@mt-hrm/models';
import { NewUser, SignInRequest } from '@mt-hrm/models/request';
import { DayOffResponse, SignUpResponse } from '@mt-hrm/models/response';
import {
  PreferenceRepository,
  UserIdentifierRepository,
  UserProfileRepository,
  UserRepository,
  UserRoleRepository,
} from '@mt-hrm/repositories';
import {
  JWTTokenService,
  RoleService,
  UserPreferenceService,
} from '@mt-hrm/services';
import {
  BaseService,
  getError,
  IdType,
  JWTTokenPayload,
  UserRole,
  UserStatuses,
} from '@lb/infra';
import { compare, genSalt, hash } from 'bcryptjs';
import isEmpty from 'lodash/isEmpty';

export class UserService extends BaseService {
  constructor(
    @inject('repositories.UserRepository')
    private userRepository: UserRepository,
    @inject('repositories.UserProfileRepository')
    private userProfileRepository: UserProfileRepository,
    @inject('repositories.UserIdentifierRepository')
    private userIdentifierRepository: UserIdentifierRepository,
    @inject('repositories.UserRoleRepository')
    private userRoleRepository: UserRoleRepository,
    @inject('repositories.PreferenceRepository')
    private preferenceRepository: PreferenceRepository,
    @inject('services.UserPreferenceService')
    private userPreferenceService: UserPreferenceService,
    @inject('services.RoleService')
    private roleService: RoleService,
    @inject('services.JWTTokenService')
    private jwtService: JWTTokenService,

    // @inject('repositories.UserProfileRepository')
    // private changeUserProfileRepository: ChangeUserProfileRepository,
  ) {
    super({ scope: UserService.name });
  }

  // ------------------------------------------------------------------------------
  getRepository() {
    return this.userRepository;
  }

  // ------------------------------------------------------------------------------
  isValidSignInCredential(signInRequest: SignInRequest): boolean {
    const { identifier, credential } = signInRequest;
    return (
      identifier &&
      credential &&
      !isEmpty(identifier.value) &&
      !isEmpty(identifier.scheme) &&
      UserIdentifierSchemes.isValid(identifier.scheme) &&
      !isEmpty(credential.value) &&
      !isEmpty(credential.scheme) &&
      UserCredentialSchemes.isValid(credential.scheme)
    );
  }

  // ------------------------------------------------------------------------------
  async verifyCredentials(signInRequest: SignInRequest): Promise<User> {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const _invalidCredential = new HttpErrors.BadRequest(
      Messages.Errors.INVALID_SIGN_IN_CREDENTIAL,
    );

    if (!this.isValidSignInCredential(signInRequest)) {
      this.logger.info('[verifyCredentials] Invalid signInRequest validation!');
      throw _invalidCredential;
    }

    const { identifier, credential } = signInRequest;

    this.logger.info(
      '[verifyCredentials] Validating user identifier...! Identifier: %j',
      identifier,
    );
    const userIdentifier = await this.userIdentifierRepository.findOne({
      where: {
        identifier: identifier.value,
        scheme: identifier.scheme,
      },
    });
    if (!userIdentifier) {
      this.logger.error(
        '[verifyCredentials] Invalid user identifier: %j',
        identifier,
      );
      throw _invalidCredential;
    }

    if (!userIdentifier.verified) {
      this.logger.error('[verifyCredentials] User identifier is not verified!');
      throw _invalidCredential;
    }

    const user = await this.userRepository.findById(userIdentifier.userId);
    if (!user) {
      this.logger.error(
        '[verifyCredentials] Not found any user with identifier: %j',
        identifier,
      );
      throw _invalidCredential;
    }

    const userCredential = await this.userRepository.findCredential({
      userId: user.id,
      scheme: credential.scheme,
    });
    if (!userCredential) {
      this.logger.error(
        '[verifyCredentials] Not found any credential for user: %s',
        user.id,
      );
      throw new HttpErrors.Unauthorized('Invalid Sign-In Credentials');
    }

    const isCredentialMatched = await compare(
      credential.value,
      userCredential.credential,
    );
    if (!isCredentialMatched) {
      this.logger.error(
        '[verifyCredentials] Credential is NOT MATCHED for user: %s',
        user.id,
      );
      throw _invalidCredential;
    }

    this.logger.info(
      '[verifyCredentials] Valid sign-in credential! Identifier: %j',
      identifier,
    );
    return user;
  }

  // ------------------------------------------------------------------------------
  async createUserIdentifiers(
    request: NewUser,
    userId: typeof User.prototype.id,
  ): Promise<UserIdentifier[]> {
    const { username } = request;
    const rs: UserIdentifier[] = [];

    const identifiers = [];
    if (!isEmpty(username)) {
      identifiers.push({
        identifier: username,
        scheme: UserIdentifierSchemes.USERNAME,
        verified: true,
      });
    }

    for (const el of identifiers) {
      this.logger.info(
        '[createUserIdentifiers] Creating User Identifier | Identifier: %s | Type: %s',
        el.identifier,
        el.scheme,
      );

      const userIdentifier = await this.userRepository
        .identifiers(userId)
        .create({
          ...el,
          provider: AuthenticationProviders.MT_HRM,
        });
      rs.push(userIdentifier);
    }

    return rs;
  }

  // ------------------------------------------------------------------------------
  async createUserCredentials(
    request: NewUser,
    userId: typeof User.prototype.id,
  ): Promise<UserCredential[]> {
    const rs: UserCredential[] = [];

    const { credential } = request;
    const salted = await genSalt();
    const hashed = await hash(credential, salted);

    const userCredential = await this.userRepository
      .credentials(userId)
      .create({
        scheme: UserCredentialSchemes.BASIC,
        credential: hashed,
      });
    rs.push(userCredential);

    return rs;
  }

  // ------------------------------------------------------------------------------
  async createUserProfile(
    request: NewUser,
    userId: typeof User.prototype.id,
  ): Promise<void> {
    this.logger.info('[createUserProfile] Creating new user profile...!');
    const userProfile = new UserProfile({
      fullName: request.fullName,
      faceImgUrl: request.face_img_url,
    });
    await this.userRepository.profile(userId).create(userProfile);
    this.logger.info('[createUserProfile] User profile created!');
  }

  // ------------------------------------------------------------------------------
  async isValidNewUserRequest(
    request: NewUser,
  ): Promise<{ message: string; result: boolean }> {
    const rs = { message: '', result: true };

    const { credential, username, fullName } = request;
    // Validate user information
    if (isEmpty(fullName)) {
      return {
        message: 'Invalid User Full name (not blank)!',
        result: false,
      };
    }

    // Validate user credential
    if (isEmpty(credential) || credential?.length < 8) {
      return {
        message:
          'Invalid User Credential (not blank and at least 8 characters)!',
        result: false,
      };
    }

    // Validate user credential - username
    if (username && !isEmpty(username)) {
      if (username.length < 8) {
        return {
          message:
            'Invalid Username (username not blank and at least 8 characters)!',
          result: false,
        };
      }

      const exitedUsername = await this.userIdentifierRepository.findOne({
        where: {
          scheme: UserIdentifierSchemes.USERNAME,
          identifier: username,
        },
      });

      if (exitedUsername) {
        return {
          message: 'Invalid Username (username existed)',
          result: false,
        };
      }
    } else {
      return {
        message:
          'Invalid User Credential (username cannot blank and at least 8 characters)!',
        result: false,
      };
    }

    return rs;
  }

  // ------------------------------------------------------------------------------
  async signUp(request: NewUser): Promise<SignUpResponse> {
    const rs: SignUpResponse = {
      user: null,
      identifiers: [],
      roles: [],
    };

    const validation = await this.isValidNewUserRequest(request);
    if (!validation.result) {
      throw getError({ message: validation.message });
    }

    this.logger.info('[signUp] Creating user...!');
    const user = await this.userRepository.create({
      status: UserStatuses.ACTIVATED,
    });
    rs.user = user;
    this.logger.info('[signUp] New user "%s" is created!', user.id);

    const userId = user?.id || 0;
    if (!userId) {
      throw getError({
        message: '[UserService][signUp] Cannot create user!',
        statusCode: 500,
      });
    }

    this.logger.info(
      '[signUp] Creating user identifiers | Username: %s | Email: %s | Phone Number: %s',
      request.username,
    );
    rs.identifiers = await this.createUserIdentifiers(request, userId);
    await this.createUserCredentials(request, userId);
    await this.createUserProfile(request, userId);

    const requestRoles = request?.role ?? [];
    await this.userRepository.assignRoles({
      userId,
      roleIdentifiers: requestRoles,
    });
    rs.roles = await this.userRepository.getUserRoles({ userId });

    //Creating inital user preference
    await this.userPreferenceService.createInitailPreferences(userId);

    return rs;
  }

  // ---------------------------------------------------------------------------------------------
  async updateProfile(
    userId: number,
    profile: UserProfileRequest,
  ): Promise<User> {
    const { roleIds, username, credential, ...info } = profile;
    this.logger.info(
      `[UpdateProfile=le] Starting to update user profile with userId: ${userId} | info: ${info}`,
    );
    const found = await this.userProfileRepository.findOne({
      where: { userId },
    });
    if (found) {
      await this.userProfileRepository.updateById(found.id, { ...info });
    }

    if (roleIds) {
      const mappings = await this.userRoleRepository.find({
        where: { userId },
      });
      if (mappings) {
        const currentRoleIds = mappings.map((it: UserRole) => it.principalId);
        await this.roleService.updateUserRoles(userId, roleIds, currentRoleIds);
      } else {
        await this.roleService.addRolesToUser(userId, roleIds);
      }
    }

    const updatedUser = await this.userRepository.findById(userId, {
      include: [{ relation: 'profile' }, { relation: 'roles' }],
    });

    return updatedUser;
  }

  // ------------------------------------------------------------------------------
  async signIn(signInRequest: SignInRequest): Promise<any> {
    if (!this.isValidSignInCredential(signInRequest)) {
      this.logger.info('[signIn] Invalid signInRequest validation!');
      throw getError({
        statusCode: 400,
        message: '[signIn] Invalid Sign-In credential payload!',
      });
    }

    const user = await this.verifyCredentials(signInRequest);
    const userId = user.id;

    const loginTime = new Date();
    await this.userRepository.updateById(
      user.id,
      { lastLoginAt: loginTime },
      { ignoreUpdate: true },
    );
    const roles = await this.userRepository.getUserRoles({ userId });

    const tokenValue = this.jwtService.generate({
      userId: userId.toString(),
      roles,
    } as JWTTokenPayload);

    return {
      userId,
      roles,
      token: { value: tokenValue, type: Authentication.TYPE_BEARER },
    };
  }

  // ----------------------------------------------------------------------------------
  async isUserExisted(opts: { scheme: string; value: string }) {
    const user = await this.userIdentifierRepository.findUser({
      scheme: opts.scheme,
      identifier: opts.value,
    });

    return (
      user !== null &&
      user !== undefined &&
      [
        UserStatuses.ACTIVATED,
        UserStatuses.DEACTIVATED,
        UserStatuses.BLOCKED,
      ].includes(user.status)
    );
  }

  // -----------------------------------------------------------------------------------
  async changePassword(opts: {
    userId: IdType;
    scheme: string;
    currentPassword: string;
    newPassword: string;
  }) {
    const { userId, currentPassword, newPassword, scheme } = opts;
    const userCredential = await this.userRepository.findCredential({
      userId,
      scheme,
    });
    if (!userCredential) {
      this.logger.error(
        '[verifyCredentials] Not found any credential for user: %s',
        userId,
      );
      throw new HttpErrors[404](
        `[verifyCredentials] Not found any credential for user: ${userId}`,
      );
    }
    const isCredentialMatched = await compare(
      currentPassword,
      userCredential.credential,
    );
    if (!isCredentialMatched) {
      this.logger.error(
        '[verifyCredentials] Credential is NOT MATCHED for user: %s',
        userId,
      );
      throw new HttpErrors[404]('Wrong password');
    }
    const salted = await genSalt();
    const hashedPassword = await hash(newPassword, salted);

    const isSuccess = await this.userRepository
      .credentials(userId)
      .patch({ credential: hashedPassword }, { scheme });

    if (!isSuccess) {
      this.logger.error('Fail update password: %s', userId);
      throw new HttpErrors[404]();
    }
  }

  // -----------------------------------------------------------------------------------
  async resetPassword(opts: {
    userId: IdType;
    scheme: string;
    newPassword?: string;
  }) {
    let { userId, newPassword, scheme } = opts;

    if (!newPassword) {
      // Query username for default password
      const userIdentifier = await this.userIdentifierRepository.findOne({
        where: { userId: Number(userId) },
      });
      if (!userIdentifier) {
        this.logger.error(
          '[verifyIdentifiers] Not found any identifier for user: %s',
          userId,
        );
        throw new HttpErrors[404](
          `[verifyIdentifiers] Not found any identifier for user: ${userId}`,
        );
      }
      newPassword = DefaultPassword.PREFIX + userIdentifier.identifier;
    }

    const salted = await genSalt();
    const hashedPassword = await hash(newPassword, salted);

    const isSuccess = await this.userRepository
      .credentials(userId)
      .patch({ credential: hashedPassword }, { scheme });

    if (!isSuccess) {
      this.logger.error('Fail reset password: %s', userId);
      throw new HttpErrors[404]();
    }
  }

  //------------------------------------------------------------------------------
  async getDaysOff(obj: {
    userIds?: number[];
    years?: number[];
    limit?: number;
    offset?: number;
  }): Promise<DayOffResponse[]> {
    const {
      userIds = [],
      years = [],
      limit = Pagination.DAYS_OFF_LIMIT,
      offset = 0,
    } = obj ?? {};

    if (!userIds.length) {
      const users = await this.userRepository.find({
        fields: ['id'],
        where: {
          status: `${EmployeeStatus.ACTIVATED}`,
        },
      });

      users.forEach(user => {
        userIds.push(user.id);
      });
    }

    if (!years.length) {
      years.push(new Date().getFullYear());
    }

    return await this.userRepository.getFullDayOffRecords(
      userIds,
      years,
      limit,
      offset,
    );
  }
}
