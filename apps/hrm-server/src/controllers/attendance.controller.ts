import { defineCrudController } from '@lb/infra';
import { Authentication, FixedUserRoles, RestPaths } from '@mt-hrm/common';
import { Attendance } from '@mt-hrm/models';
import { AttendanceRepository } from '@mt-hrm/repositories';
import { authenticate } from '@loopback/authentication';
import { authorize } from '@loopback/authorization';
import { inject } from '@loopback/core';
import { api, get, getModelSchemaRef, param } from '@loopback/rest';
import { Filter } from '@loopback/repository';
import { compareId } from '@mt-hrm/security/voter-compare-id';

const Controller = defineCrudController({
  entity: Attendance,
  repository: { name: AttendanceRepository.name },
  controller: { basePath: RestPaths.ATTENDANCE },
});

@authorize({
  allowedRoles: [FixedUserRoles.SUPER_ADMIN, FixedUserRoles.ADMIN],
  voters: [compareId],
})
@authenticate(Authentication.STRATEGY_JWT)
@api({ basePath: RestPaths.ATTENDANCE })
export class AttendanceController extends Controller {
  constructor(
    @inject('repositories.AttendanceRepository')
    private attendanceRepository: AttendanceRepository,
  ) {
    super(attendanceRepository);
  }

  @get('/', {
    responses: {
      '200': {
        description: 'Array of Attendance model instances',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                data: {
                  type: 'array',
                  items: getModelSchemaRef(Attendance, {
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
  async findAll(@param.filter(Attendance) filter?: Filter<Attendance>) {
    const data = await this.repository.find(filter);
    const total = await this.repository.count(filter?.where);

    return {
      data,
      total: total.count,
    };
  }
}
