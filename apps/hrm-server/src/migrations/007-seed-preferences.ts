import { BaseApplication } from '@lb/infra';

import { PreferenceRepository } from '@mt-hrm/repositories';
import preferenceInitialRecords from './data/preferences';
import { application } from 'express';

export default {
  name: __filename.slice(__dirname.length + 1),
  fn: async (application: BaseApplication) => {
    const preferenceRepository = application.getSync<PreferenceRepository>(
      'repositories.PreferenceRepository',
    );

    for (const payload of preferenceInitialRecords) {
      const { code, description, value } = payload;

      await preferenceRepository.upsertWith(
        {
          code,
          description,
          value,
        },
        {
          code,
          description,
          value,
        },
      );
    }
  },
};
