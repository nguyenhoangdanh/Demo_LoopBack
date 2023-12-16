import { BaseApplication } from '@lb/infra';

import defaultStatus from '@mt-hrm/migrations/data/status';
import { StatusRepository } from '@mt-hrm/repositories';

export default {
  name: __filename.slice(__dirname.length + 1),
  fn: async (application: BaseApplication) => {
    const statusRepository = application.getSync<StatusRepository>(
      'repositories.StatusRepository',
    );

    for (const payload of defaultStatus) {
      const { description, code, name } = payload;

      await statusRepository.upsertWith(
        {
          description,
          code,
          name,
        },
        {
          description,
          code,
          name,
        },
      );
    }
  },
};
