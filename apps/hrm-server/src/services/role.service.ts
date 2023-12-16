import { RoleRepository, UserRoleRepository } from '@mt-hrm/repositories';
import { BaseService, IdType, Role, UserRole } from '@lb/infra';
import { inject } from '@loopback/core';
import _ from 'lodash';

export class RoleService extends BaseService {
  constructor(
    @inject('repositories.RoleRepository')
    private roleRepository: RoleRepository,
    @inject('repositories.UserRoleRepository')
    private userRoleRepository: UserRoleRepository,
  ) {
    super({ scope: RoleService.name });
  }

  // ---------------------------------------------------------------------------------------------
  getRepository() {
    return this.roleRepository;
  }

  // ---------------------------------------------------------------------------------------------
  async save(role: Role): Promise<Role> {
    const { id, ...info } = role;
    let saved: Role;

    if (!id) {
      this.logger.info(
        `[SaveRole] Starting to create new role with info: ${info}`,
      );
      saved = await this.roleRepository.create(new Role({ ...info }));
    } else {
      this.logger.info(
        `[SaveRole] Starting to update role with id: ${id} | info: ${info}`,
      );
      await this.roleRepository.updateById(id, { ...info });
      saved = role;
    }

    return saved;
  }

  // ---------------------------------------------------------------------------------------------
  async addRolesToUser(
    userId: number,
    roleIds: (IdType | undefined)[],
  ): Promise<boolean> {
    const mappings = [];
    for (const principalId of roleIds) {
      mappings.push(new UserRole({ userId, principalId }));
    }
    await this.userRoleRepository.createAll(mappings);

    return true;
  }

  // ---------------------------------------------------------------------------------------------
  async removeRolesFromUser(
    userId: number,
    roleIds: (IdType | undefined)[],
  ): Promise<boolean> {
    for (const principalId of roleIds) {
      const mapping = await this.userRoleRepository.findOne({
        where: { userId, principalId },
      });
      if (mapping) {
        await this.userRoleRepository.deleteById(mapping.id);
      }
    }
    return true;
  }

  // ---------------------------------------------------------------------------------------------
  async updateUserRoles(
    userId: number,
    roleIds: number[],
    currentRoleIds: (IdType | undefined)[],
  ) {
    const addIds = _.difference(roleIds, currentRoleIds);
    const removeIds = _.difference(currentRoleIds, roleIds);

    if (addIds) {
      await this.addRolesToUser(userId, addIds);
    }

    if (removeIds) {
      await this.removeRolesFromUser(userId, removeIds);
    }

    return true;
  }
}
