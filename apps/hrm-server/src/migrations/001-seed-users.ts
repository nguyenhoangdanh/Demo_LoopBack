import { UserIdentifierSchemes } from '@mt-hrm/common';
import { UserIdentifierRepository } from '@mt-hrm/repositories';
import { UserService } from '@mt-hrm/services';
import {
  applicationLogger,
  BaseApplication,
  Role,
  RoleRepository,
  UserRoleRepository,
} from '@lb/infra';

import defaultUsers from '@mt-hrm/migrations/data/users';

const seedRoles = async (application: BaseApplication) => {
  const defaultRoles = (await import('@mt-hrm/migrations/data/roles.json'))
    .default;
  const roleRepository = application.getSync<RoleRepository>(
    'repositories.RoleRepository',
  );

  for (const role of defaultRoles) {
    await roleRepository.upsertWith(
      { ...role },
      { identifier: role.identifier },
    );
  }
};

export default {
  name: __filename.slice(__dirname.length + 1),
  fn: async (application: BaseApplication) => {
    await seedRoles(application);

    const userService = application.getSync<UserService>(
      'services.UserService',
    );
    const userIdentifierRepository =
      application.getSync<UserIdentifierRepository>(
        'repositories.UserIdentifierRepository',
      );
    const roleRepository = application.getSync<RoleRepository>(
      'repositories.RoleRepository',
    );
    const userRoleRepository = application.getSync<UserRoleRepository>(
      'repositories.UserRoleRepository',
    );

    for (const payload of defaultUsers) {
      const existed = await userService.isUserExisted({
        scheme: UserIdentifierSchemes.USERNAME,
        value: payload.username,
      });

      const { roleIdentifier, ...user } = payload;
      let userReg: any = { user: null };

      if (existed) {
        userReg.user = await userIdentifierRepository.findUser({
          scheme: UserIdentifierSchemes.USERNAME,
          identifier: user.username,
        });
      } else {
        userReg = await userService.signUp(user);
      }
      const role = await roleRepository.findOne({
        where: { identifier: roleIdentifier },
      });

      if (!role) {
        applicationLogger.info(
          '[seedUsers] Cannot find role %s to assign user %s',
          roleIdentifier,
          user.username,
        );
        continue;
      }

      await userRoleRepository.upsertWith(
        {
          userId: userReg.user?.id,
          principalId: role.id,
          principalType: Role.name,
        },
        {
          userId: userReg.user?.id,
          principalId: role.id,
          principalType: Role.name,
        },
      );
    }
  },
};
