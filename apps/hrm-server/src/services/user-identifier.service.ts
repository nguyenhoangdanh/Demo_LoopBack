import {UserIdentifierRepository,RoleRepository, UserProfileRepository} from '@mt-hrm/repositories';
import {BaseService, getError} from '@lb/infra';
import {inject} from '@loopback/core';

export class UserIdentifierService extends BaseService {
  constructor(
    @inject('repositories.RoleRepository')
    private roleRepository: RoleRepository,
    @inject('repositories.UserIdentifierRepository')
    private userIdentifierRepository: UserIdentifierRepository,
    @inject('repositories.UserProfileRepository')
    private userProfileRepository: UserProfileRepository,
  ) {
    super({scope: UserIdentifierService.name});
  }
  getRepository() {
    return this.roleRepository;
  }
}
