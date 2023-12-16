import { FixedUserRoles, RestPaths } from '@mt-hrm/common';
import { Preference } from '@mt-hrm/models';
import { PreferenceRepository, UserRepository } from '@mt-hrm/repositories';
import { Authentication, defineCrudController } from '@lb/infra';
import { authenticate } from '@loopback/authentication';
import { api } from '@loopback/rest';
import { authorize } from '@loopback/authorization';
import { repository } from '@loopback/repository';

const Controller = defineCrudController({
  entity: Preference,
  repository: { name: PreferenceRepository.name },
  controller: { basePath: RestPaths.PREFERENCE },
});

@authorize({
  allowedRoles: [FixedUserRoles.SUPER_ADMIN, FixedUserRoles.ADMIN],
})
@authenticate(Authentication.STRATEGY_JWT)
@api({ basePath: RestPaths.PREFERENCE })
export class PreferenceController extends Controller {
  constructor(
    @repository(PreferenceRepository)
    preferenceRepository: PreferenceRepository,
  ) {
    super(preferenceRepository);
  }
}
