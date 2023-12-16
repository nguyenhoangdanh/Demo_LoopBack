import {
  applicationLogger,
  BaseApplication,
  PermissionMappingRepository,
  PermissionRepository,
  RoleRepository,
} from '@lb/infra';

import defaultPermissionsMapping from '@mt-hrm/migrations/data/permissions-mapping';

const seedPermissions = async (application: BaseApplication) => {
  const defaultPermissions = (
    await import('@mt-hrm/migrations/data/permissions.json')
  ).default;
  const permissionRepository = application.getSync<PermissionRepository>(
    'repositories.PermissionRepository',
  );

  for (const permission of defaultPermissions) {
    for (const detail of permission.details) {
      const code = `${permission.subject}.${detail.method}`;
      await permissionRepository.upsertWith(
        {
          subject: permission.subject,
          name: detail.name,
          action: permission.action,
          pType: permission.pType,
          code,
        },
        { code },
      );
    }
  }
};

export default {
  name: __filename.slice(__dirname.length + 1),
  options: { alwaysRun: true },
  fn: async (application: BaseApplication) => {
    await seedPermissions(application);

    const permissionRepository = application.getSync<PermissionRepository>(
      'repositories.PermissionRepository',
    );
    const permissionMappingRepository =
      application.getSync<PermissionMappingRepository>(
        'repositories.PermissionMappingRepository',
      );
    const roleRepository = application.getSync<RoleRepository>(
      'repositories.RoleRepository',
    );

    for (const payload of defaultPermissionsMapping) {
      const { roleIdentifier, effect } = payload;
      for (const role of roleIdentifier) {
        const roleQuery = await roleRepository.findOne({
          where: { identifier: role },
        });
        if (!roleQuery) {
          applicationLogger.info(
            '[seedPermissions] Cannot find role %s to assign permissions %s',
            role,
            payload.permissionCode,
          );
          continue;
        }

        for (const code of payload.permissionCode!) {
          const permissionQuery = await permissionRepository.findOne({
            where: { code },
          });

          if (!permissionQuery) {
            applicationLogger.info(
              '[seedPermissions] Cannot find permission %s to assign role %s',
              code,
              role,
            );
            continue;
          }

          await permissionMappingRepository.upsertWith(
            {
              roleId: roleQuery.id,
              permissionId: permissionQuery.id,
              effect: effect.toString(),
            },
            {
              roleId: roleQuery.id,
              permissionId: permissionQuery.id,
              effect: effect.toString(),
            },
          );
        }
      }
    }
  },
};
