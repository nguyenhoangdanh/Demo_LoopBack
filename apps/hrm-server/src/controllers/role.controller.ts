import {
  defineCrudController,
  FixedUserRoles,
  Role,
  RoleRepository,
} from '@lb/infra';
import { Authentication, ITotalData, RestPaths } from '@mt-hrm/common';
import { authenticate } from '@loopback/authentication';
import { inject } from '@loopback/core';
import { api, get, param } from '@loopback/rest';
import { authorize } from '@loopback/authorization';
import { Filter } from '@loopback/repository';

// -------------------------------------------------------------------------
const Controller = defineCrudController({
  entity: Role,
  repository: { name: RoleRepository.name },
  controller: { basePath: RestPaths.ROLE },
});

// -------------------------------------------------------------------------
@authorize({ allowedRoles: [FixedUserRoles.SUPER_ADMIN, FixedUserRoles.ADMIN] })
@authenticate(Authentication.STRATEGY_JWT)
@api({ basePath: RestPaths.ROLE })
export class RoleController extends Controller {
  constructor(
    @inject('repositories.RoleRepository')
    private roleRepository: RoleRepository,
  ) {
    super(roleRepository);
  }

  // ------------------------------------------------------------------------------
  @get('/')
  async findAll(
    @param.filter(Role) filter?: Filter<Role>,
  ): Promise<ITotalData<Role>> {
    const { count: total } = await this.roleRepository.count(filter?.where);
    const roles = await this.roleRepository.find(filter);
    return {
      total,
      data: roles,
    };
  }
}
