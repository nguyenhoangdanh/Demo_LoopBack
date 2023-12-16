import { defineCrudController, getError, RoleRepository } from '@lb/infra';
import { Authentication, FixedUserRoles, RestPaths } from '@mt-hrm/common';
import { SecurityBindings, UserProfile } from '@loopback/security';
import { Status } from '@mt-hrm/models';
import { AttendanceRepository, UserRepository } from '@mt-hrm/repositories';
import { authenticate } from '@loopback/authentication';
import { authorize } from '@loopback/authorization';
import { Getter, inject } from '@loopback/core';
import { api, get, getModelSchemaRef, param } from '@loopback/rest';
import { StatusRepository } from '@mt-hrm/repositories/status.repository';
import { Filter } from '@loopback/repository';

const Controller = defineCrudController({
  entity: Status,
  repository: { name: AttendanceRepository.name },
  controller: { basePath: RestPaths.STATUS },
});

@authorize({ allowedRoles: [FixedUserRoles.SUPER_ADMIN, FixedUserRoles.ADMIN] })
@authenticate(Authentication.STRATEGY_JWT)
@api({ basePath: RestPaths.STATUS })
export class StatusController extends Controller {
  constructor(
    @inject('repositories.StatusRepository')
    private statusRepository: StatusRepository,
    @inject.getter(SecurityBindings.USER, { optional: true })
    private getCurrentUser: Getter<UserProfile>,
    @inject('repositories.UserRepository')
    private userRepository: UserRepository,
  ) {
    super(statusRepository);
  }

  @get('/', {
    responses: {
      '200': {
        description: 'Array of Issue model instances',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                type: 'array',
                items: getModelSchemaRef(Status, {
                  includeRelations: true,
                }),
              },
            },
          },
        },
      },
    },
  })
  async find(@param.filter(Status) filter?: Filter<Status>): Promise<Status[]> {
    const currentUser = await this.getCurrentUser();

    if (!currentUser) {
      throw getError({ message: 'Invalid user', statusCode: 400 });
    }

    const statusRes = await this.repository.find(filter);

    // Get role of user
    const existingRoles = await this.userRepository
      .roles(currentUser?.userId)
      .find();
    if (
      existingRoles.some(
        role =>
          role.identifier === FixedUserRoles.SUPER_ADMIN ||
          role.identifier === FixedUserRoles.ADMIN,
      )
    ) {
      return statusRes;
    }

    return statusRes.filter(status => status.code === '401-canceled');
  }
}
