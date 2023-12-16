import {
  BaseController,
  defineCrudController,
  FixedUserRoles,
  Permission,
  PermissionRepository,
} from '@lb/infra';
import { Authentication, RestPaths } from '@mt-hrm/common';
import { authenticate } from '@loopback/authentication';
import { inject } from '@loopback/core';
import { api, get, param } from '@loopback/rest';
import { authorize } from '@loopback/authorization';
import { Filter } from '@loopback/repository';

// -------------------------------------------------------------------------
@authorize({ allowedRoles: [FixedUserRoles.SUPER_ADMIN, FixedUserRoles.ADMIN] })
@authenticate(Authentication.STRATEGY_JWT)
@api({ basePath: RestPaths.PERMISSION })
export class PermissionController extends BaseController {
  constructor(
    @inject('repositories.PermissionRepository')
    private permissionRepository: PermissionRepository,
  ) {
    super({ scope: PermissionController.name });
  }

  // ------------------------------------------------------------------------------
  @get('/')
  async findAll(
    @param.filter(Permission) filter?: Filter<Permission>,
  ): Promise<Permission[]> {
    return this.permissionRepository.find(filter);
  }
}
