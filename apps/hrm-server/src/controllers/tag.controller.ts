import { Authentication, defineCrudController } from '@lb/infra';
import { FixedUserRoles, RestPaths } from '@mt-hrm/common';
import { Tag } from '@mt-hrm/models';
import { TagRepository } from '@mt-hrm/repositories';
import { authenticate } from '@loopback/authentication';
import { api } from '@loopback/rest';
import { inject } from '@loopback/core';
import { authorize } from '@loopback/authorization';

const Controller = defineCrudController({
  entity: Tag,
  repository: { name: TagRepository.name },
  controller: { basePath: RestPaths.TAG },
});

@authorize({ allowedRoles: [FixedUserRoles.SUPER_ADMIN, FixedUserRoles.ADMIN] })
@authenticate(Authentication.STRATEGY_JWT)
@api({ basePath: RestPaths.TAG })
export class TagController extends Controller {
  constructor(
    @inject('repositories.TagRepository')
    private tagRepository: TagRepository,
  ) {
    super(tagRepository);
  }
}
