import { AuthorizationEffect } from '@mt-hrm/common';
import { User } from '@mt-hrm/models';
import { UpsertAuthorizationPermission } from '@mt-hrm/models/request';
import { UserRepository } from '@mt-hrm/repositories';
import {
  BaseService,
  getError,
  PermissionMappingRepository,
  PermissionRepository,
  Role,
  RoleRepository,
} from '@lb/infra';
import { BindingScope, inject, injectable } from '@loopback/core';

@injectable({ scope: BindingScope.SINGLETON })
export class AuthorizationService extends BaseService {
  constructor(
    @inject('repositories.PermissionRepository')
    private permissionRepository: PermissionRepository,
    @inject('repositories.UserRepository')
    private userRepository: UserRepository,
    @inject('repositories.RoleRepository')
    private roleRepository: RoleRepository,
    @inject('repositories.PermissionMappingRepository')
    private permissionMappingRepository: PermissionMappingRepository,
  ) {
    super({ scope: AuthorizationService.name });
  }

  getRepository() {
    return this.permissionMappingRepository;
  }

  async upDelSertPermissionMapping(opts: UpsertAuthorizationPermission) {
    const { principalType, principalId, permissions } = opts;

    if (!principalId) {
      throw getError({
        statusCode: 400,
        message: 'Both principal (userId and roleId) cannot be blank!',
      });
    }

    let repository: UserRepository | RoleRepository | null;
    switch (principalType.toLowerCase()) {
      case User.name.toLowerCase(): {
        repository = this.userRepository;
        break;
      }
      case Role.name.toLowerCase(): {
        repository = this.roleRepository;
        break;
      }
      default: {
        throw getError({
          statusCode: 400,
          message: 'Invalid principalType to identify repository!',
        });
      }
    }

    const isPrincipalExisted = await repository.exists(principalId);
    if (!isPrincipalExisted) {
      throw getError({
        statusCode: 400,
        message: `Principal ${principalType} with id ${principalId} not found to modify user authorization permissions`,
      });
    }

    const { grant, omit } = permissions;
    const addPermissionCheckExisted = await Promise.all(
      grant.map(permissionId => {
        return this.permissionRepository.exists(permissionId);
      }),
    );
    if (addPermissionCheckExisted.includes(false)) {
      throw getError({
        statusCode: 400,
        message:
          'Request permissions.add contains non-existed permissionId! Please check again permission.add',
      });
    }

    this.logger.info(
      '[upDelSertPermissionMapping] Adding permission mappings... | principalType: %s | principalId: %s | permissionIds: %j',
      principalType,
      principalId,
      grant,
    );
    const fieldId = `${principalType.toLowerCase()}Id`;
    await Promise.all(
      grant.map(permissionId => {
        return this.permissionMappingRepository.upsertWith(
          {
            [fieldId]: principalId,
            permissionId,
            effect: AuthorizationEffect.ALLOW,
          },
          {
            [fieldId]: principalId,
            permissionId,
          },
        );
      }),
    );

    this.logger.info(
      '[upDelSertPermissionMapping] Omitting permission mappings... | principalType: %s | principalId: %s | permissionIds: %j',
      principalType,
      principalId,
      omit,
    );
    await this.permissionMappingRepository.deleteAll({
      [fieldId]: principalId,
      permissionId: { inq: omit },
    });
    return {
      code: '200',
      message: 'Success',
    };
  }
}
