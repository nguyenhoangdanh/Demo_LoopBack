import { BaseService } from '@lb/infra';
import { inject } from '@loopback/core';
import { IsolationLevel } from '@loopback/repository';
import { CronCode } from '@mt-hrm/common';
import { CronLockRepository } from '../repositories';

export class CronJobService extends BaseService {
  constructor(
    @inject('repositories.CronLockRepository')
    private cronLockRepository: CronLockRepository,
  ) {
    super({ scope: CronJobService.name });
  }

  async runCronJobWithLock(
    cronCode: CronCode,
    cronCallback: () => Promise<void>,
  ) {
    const cronLock = await this.cronLockRepository.findOne({
      fields: { id: true },
      where: { code: cronCode },
    });

    const transaction =
      await this.cronLockRepository.dataSource.beginTransaction(
        IsolationLevel.SERIALIZABLE,
      );

    try {
      const foundLock = await this.cronLockRepository.findById(
        cronLock.id,
        {},
        { transaction },
      );

      if (foundLock.locked) {
        this.logger.info(
          `[CronService] Another server instance is running the cron code: ${cronCode}!`,
        );
        await transaction.rollback();
        return;
      }

      // Lock acquired
      await this.cronLockRepository.updateById(
        cronLock.id,
        { locked: true },
        { transaction },
      );
      this.logger.info(
        `[CronService] Cron is running the cron code: ${cronCode}...`,
      );

      await cronCallback();

      this.logger.info(
        `[CronService] Cron accomplished the cron code: ${cronCode}!`,
      );

      // Release the lock
      await this.cronLockRepository.updateById(
        cronLock.id,
        { locked: false },
        { transaction },
      );
      this.logger.info(`[CronService] Cron ${cronCode} released lock!`);
      await transaction.commit();
    } catch (err) {
      console.error('Error running job: ', err);
      await transaction.rollback();
    }
  }
}
