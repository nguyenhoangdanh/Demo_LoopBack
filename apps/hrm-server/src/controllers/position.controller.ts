import { defineCrudController } from '@lb/infra';
import { Authentication, FixedUserRoles, RestPaths } from '@mt-hrm/common';
import { Position } from '@mt-hrm/models';
import { PositionRepository } from '@mt-hrm/repositories';
import { authenticate } from '@loopback/authentication';
import { api, get, getModelSchemaRef, param } from '@loopback/rest';
import { inject } from '@loopback/core';
import { Filter } from '@loopback/repository';
import { authorize } from '@loopback/authorization';

const Controller = defineCrudController({
  entity: Position,
  repository: { name: PositionRepository.name },
  controller: { basePath: RestPaths.POSITION },
});

@authorize({ allowedRoles: [FixedUserRoles.SUPER_ADMIN, FixedUserRoles.ADMIN] })
@authenticate(Authentication.STRATEGY_JWT)
@api({ basePath: RestPaths.POSITION })
export class PositionController extends Controller {
  constructor(
    @inject('repositories.PositionRepository')
    private positionRepository: PositionRepository,
  ) {
    super(positionRepository);
  }

  @get('/', {
    responses: {
      '200': {
        description: 'Array of User model instances',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                data: {
                  type: 'array',
                  items: getModelSchemaRef(Position, {
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
  async findAll(@param.filter(Position) filter?: Filter<Position>) {
    const data = await this.repository.find(filter);
    const total = await this.repository.count(filter?.where);

    return {
      data,
      total: total.count,
    };
  }
}
