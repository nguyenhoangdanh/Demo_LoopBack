import { BaseApplication } from '@lb/infra';

import defaultCronLocks from '@mt-hrm/migrations/data/cron-lock';
import { CronLockRepository } from '@mt-hrm/repositories';

export default {
  name: __filename.slice(__dirname.length + 1),
  fn: async (application: BaseApplication) => {
    const cronLockRepository = application.getSync<CronLockRepository>(
      'repositories.CronLockRepository',
    );

    // Seed cron locks
    for (const payload of defaultCronLocks) {
      const { description, code, cronTime } = payload;

      await cronLockRepository.upsertWith(
        {
          description,
          code,
          cronTime,
        },
        {
          description,
          code,
          cronTime,
        },
      );
    }
  },
};
