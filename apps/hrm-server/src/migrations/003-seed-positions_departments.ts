import { BaseApplication } from '@lb/infra';

import defaultPositions from '@mt-hrm/migrations/data/positions';
import defaultDepartments from '@mt-hrm/migrations/data/departments';
import { DepartmentRepository, PositionRepository } from '@mt-hrm/repositories';

export default {
  name: __filename.slice(__dirname.length + 1),
  fn: async (application: BaseApplication) => {
    const positionRepository = application.getSync<PositionRepository>(
      'repositories.PositionRepository',
    );
    const departmentRepository = application.getSync<DepartmentRepository>(
      'repositories.DepartmentRepository',
    );

    // Seed positions
    for (const payload of defaultPositions) {
      const { title, code } = payload;

      await positionRepository.upsertWith(
        {
          title,
          code,
        },
        {
          title,
          code,
        },
      );
    }

    // Seed departments
    for (const payload of defaultDepartments) {
      const { name, code } = payload;

      await departmentRepository.upsertWith(
        {
          name,
          code,
        },
        {
          name,
          code,
        },
      );
    }
  },
};
