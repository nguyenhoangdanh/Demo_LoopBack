import { Authentication, IMessage, RestPaths } from '@mt-hrm/common';
import { User } from '@mt-hrm/models';
import { UpsertAuthorizationPermission } from '@mt-hrm/models/request';
import { AuthorizationService } from '@mt-hrm/services';
import {
  defineCrudController,
  FixedUserRoles,
  getError,
  PermissionMapping,
  PermissionMappingRepository,
  Role,
} from '@lb/infra';
import { authenticate } from '@loopback/authentication';
import { authorize } from '@loopback/authorization';
import { inject } from '@loopback/core';
import { api, getModelSchemaRef, post, requestBody } from '@loopback/rest';

// -------------------------------------------------------------------------
const Controller = defineCrudController({
  entity: PermissionMapping,
  repository: { name: PermissionMappingRepository.name },
  controller: { basePath: RestPaths.PERMISSION_MAPPING },
});

// -------------------------------------------------------------------------
@authorize({ allowedRoles: [FixedUserRoles.SUPER_ADMIN, FixedUserRoles.ADMIN] })
@authenticate(Authentication.STRATEGY_JWT)
@api({ basePath: `${RestPaths.PERMISSION_MAPPING}` })
export class AuthorizationController extends Controller {
  constructor(
    @inject('repositories.PermissionMappingRepository')
    private permissionMappingRepository: PermissionMappingRepository,
    @inject('services.AuthorizationService')
    private authorizationService: AuthorizationService,
  ) {
    super(permissionMappingRepository);
  }

  // ------------------------------------------------------------------------------
  @post('/', {
    responses: {
      '200': {
        description: 'Upsert an authorization permission',
        content: { 'application/json': {} },
      },
    },
  })
  async upsert(
    @requestBody({
      required: true,
      content: {
        'application/json': {
          schema: getModelSchemaRef(UpsertAuthorizationPermission),
        },
      },
    })
    payload: UpsertAuthorizationPermission,
  ): Promise<IMessage | null> {
    const principalType = payload?.principalType?.toLowerCase();

    const validPrincipalTypes = new Set([
      User.name.toLowerCase(),
      Role.name.toLowerCase(),
    ]);
    if (!validPrincipalTypes.has(principalType)) {
      throw getError({
        statusCode: 400,
        message: `Invalid principalType to modify principal permission! Valids: ${[
          ...validPrincipalTypes,
        ]}`,
      });
    }

    return this.authorizationService.upDelSertPermissionMapping(payload);
  }
}
