import { BaseApplication } from '@lb/infra';
import {
  UserPreferenceRepository,
  PreferenceRepository,
} from '@mt-hrm/repositories';
import preferenceInitialRecords from './data/preferences';
import { application } from 'express';
import { generateArray } from './data/user-preferences';

export default {
  name: __filename.slice(__dirname.length + 1),
  fn: async (application: BaseApplication) => {
    const userPreferenceRepository =
      application.getSync<UserPreferenceRepository>(
        'repositories.UserPreferenceRepository',
      );

    const userPreferenceArr = await generateArray(application);

    for (const payload of userPreferenceArr) {
      const { principalId, principalType, userId, effectYear, userValue } =
        payload;

      await userPreferenceRepository.upsertWith(
        {
          principalType,
          principalId,
          userId,
          userValue,
          effectYear,
        },
        {
          principalType,
          principalId,
          userId,
          userValue,
          effectYear,
        },
      );
    }
  },
};
