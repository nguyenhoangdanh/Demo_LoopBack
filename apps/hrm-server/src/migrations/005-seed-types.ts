import { BaseApplication } from '@lb/infra';

import defaultTypes from '@mt-hrm/migrations/data/types';
import { TypeRepository } from '@mt-hrm/repositories';

export default {
  name: __filename.slice(__dirname.length + 1),
  fn: async (application: BaseApplication) => {
    const typeRepository = application.getSync<TypeRepository>(
      'repositories.TypeRepository',
    );

    for (const payload of defaultTypes) {
      const { description, code, name } = payload;

      await typeRepository.upsertWith(
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
