import {
  api,
  post,
  requestBody,
  HttpErrors,
  getModelSchemaRef,
  patch,
  get,
} from '@loopback/rest';
import {
  ChangePasswordSchema,
  NewUser,
  ResetPasswordSchema,
  SignInRequest,
  SignInSchema,
} from '@mt-hrm/models/request';
import { Getter, inject } from '@loopback/core';
import { authenticate } from '@loopback/authentication';
import {
  DefaultPassword,
  FixedUserRoles,
  RestPaths,
  UserCredentialSchemes,
} from '@mt-hrm/common';
import { UserService } from '@mt-hrm/services';
import { SignUpResponse } from '@mt-hrm/models/response';
import { Authentication, BaseController } from '@lb/infra';
import _ from 'lodash';
import { SecurityBindings, UserProfile } from '@loopback/security';
import { authorize } from '@loopback/authorization';

@authorize({ allowedRoles: [FixedUserRoles.SUPER_ADMIN, FixedUserRoles.ADMIN] })
@api({ basePath: RestPaths.AUTH })
export class AuthenticationController extends BaseController {
  /**
   * Constructor
   * @param handler - Inject an express request handler to deal with the request
   */
  constructor(
    @inject('services.UserService')
    private userService: UserService,
    @inject.getter(SecurityBindings.USER, { optional: true })
    private getCurrentUser: Getter<UserProfile>,
  ) {
    super({ scope: AuthenticationController.name });
  }
  @authorize.skip()
  @post('sign-in', {
    responses: {
      '200': {
        description: 'Sign in',
        context: { 'application/json': {} },
      },
    },
  })
  async signIn(
    @requestBody({
      description: "Sign in function's params",
      required: true,
      content: {
        'application/json': { schema: SignInSchema },
      },
    })
    payload: SignInRequest,
  ): Promise<any | null> {
    const res = await this.userService.signIn(payload);
    return res;
  }

  @authenticate(Authentication.STRATEGY_JWT)
  @post('/sign-up', {
    responses: {
      '200': {
        description: 'Sign up',
        content: { 'application/json': {} },
      },
    },
  })
  async signUp(
    @requestBody({
      description: "Sign up function's parmas",
      required: true,
      content: {
        'application/json': {
          schema: getModelSchemaRef(NewUser, {
            title: 'Create new user request',
          }),
        },
      },
    })
    request: NewUser,
  ): Promise<SignUpResponse> {
    if (!request.credential) {
      request.credential = DefaultPassword.PREFIX + request.username;
    }
    const rs = await this.userService.signUp(request);
    return rs;
  }

  // -------------------------------------------------------------------------------
  @authenticate(Authentication.STRATEGY_JWT)
  @patch('/change-password', {
    responses: {
      '204': {
        description: 'Change password',
        content: { 'application/json': {} },
      },
    },
  })
  async changePassword(
    @requestBody({
      content: {
        'application/json': { schema: ChangePasswordSchema },
      },
    })
    payload: {
      currentPassword: string;
      newPassword: string;
      scheme?: string;
    },
  ): Promise<any> {
    const currentUser = await this.getCurrentUser();
    if (!currentUser) {
      throw new HttpErrors[400]('User not found');
    }
    await this.userService.changePassword({
      ...payload,
      scheme: payload.scheme ?? UserCredentialSchemes.BASIC,
      userId: currentUser.userId!,
    });
  }

  // -------------------------------------------------------------------------------
  @authenticate(Authentication.STRATEGY_JWT)
  @patch('/reset-password', {
    responses: {
      '204': {
        description: 'Reset password',
        content: { 'application/json': {} },
      },
    },
  })
  async resetPassword(
    @requestBody({
      content: {
        'application/json': { schema: ResetPasswordSchema },
      },
    })
    payload: {
      userId: number;
      newPassword?: string;
      scheme?: string;
    },
  ): Promise<any> {
    await this.userService.resetPassword({
      ...payload,
      scheme: payload.scheme ?? UserCredentialSchemes.BASIC,
    });
  }

  // -------------------------------------------------------------------------------
  @authorize.skip()
  @authenticate(Authentication.STRATEGY_JWT)
  @get('/who-am-i')
  async whoAmI(): Promise<UserProfile> {
    return await this.getCurrentUser();
  }
}
