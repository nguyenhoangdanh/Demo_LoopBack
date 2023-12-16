import { defineCrudController } from '@lb/infra';
import { Authentication, FixedUserRoles, RestPaths } from '@mt-hrm/common';
import { Type } from '@mt-hrm/models';
import { AttendanceRepository } from '@mt-hrm/repositories';
import { authenticate } from '@loopback/authentication';
import { authorize } from '@loopback/authorization';
import { inject } from '@loopback/core';
import { api } from '@loopback/rest';
import { TypeRepository } from '@mt-hrm/repositories/type.repository';

const Controller = defineCrudController({
  entity: Type,
  repository: { name: AttendanceRepository.name },
  controller: { basePath: RestPaths.TYPE },
});

@authorize({ allowedRoles: [FixedUserRoles.SUPER_ADMIN, FixedUserRoles.ADMIN] })
@authenticate(Authentication.STRATEGY_JWT)
@api({ basePath: RestPaths.TYPE })
export class TypeController extends Controller {
  constructor(
    @inject('repositories.TypeRepository')
    private typeRepository: TypeRepository,
  ) {
    super(typeRepository);
  }
}
