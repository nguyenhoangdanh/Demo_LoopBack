import { defineCrudController } from '@lb/infra';
import { Authentication, FixedUserRoles, RestPaths } from '@mt-hrm/common';
import { Department } from '@mt-hrm/models';
import { DepartmentRepository } from '@mt-hrm/repositories';
import { authenticate } from '@loopback/authentication';
import { inject } from '@loopback/core';
import { api, get, getModelSchemaRef, param } from '@loopback/rest';
import { Filter } from '@loopback/repository';
import { authorize } from '@loopback/authorization';

const Controller = defineCrudController({
  entity: Department,
  repository: { name: DepartmentRepository.name },
  controller: { basePath: RestPaths.DEPARTMENT },
});

@authorize({ allowedRoles: [FixedUserRoles.SUPER_ADMIN, FixedUserRoles.ADMIN] })
@authenticate(Authentication.STRATEGY_JWT)
@api({ basePath: RestPaths.DEPARTMENT })
export class DepartmentController extends Controller {
  constructor(
    @inject('repositories.DepartmentRepository')
    private departmentRepository: DepartmentRepository,
  ) {
    super(departmentRepository);
  }

  @get('/', {
    responses: {
      '200': {
        description: 'Array of Department model instances',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                data: {
                  type: 'array',
                  items: getModelSchemaRef(Department, {
                    includeRelations: true,
                  }),
                },
                total: { type: 'number' },
              },
            },
          },
        },
      },
    },
  })
  async findAll(@param.filter(Department) filter?: Filter<Department>) {
    const data = await this.repository.find(filter);
    const total = await this.repository.count(filter?.where);

    return {
      data,
      total: total.count,
    };
  }
}
