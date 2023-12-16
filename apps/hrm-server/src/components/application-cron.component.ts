import { BaseApplication, BaseComponent, CronHelper } from '@lb/infra';
import { CoreBindings, LifeCycleObserver, inject } from '@loopback/core';
import { CronCode, DefaultCronTime } from '@mt-hrm/common';
import { CronTime } from 'cron';
import { UserProfile } from '@mt-hrm/models';
import { CronLockRepository } from '@mt-hrm/repositories';
import {
  CheckOutService,
  CronJobService,
  MinioService,
  SyncService,
  UserProfileService,
  FaceRecogService,
} from '@mt-hrm/services';
import { difference } from 'lodash';

interface ICronTime {
  [key: string]: string;
}

interface ICronInstances {
  [key: string]: CronHelper;
}

export class ApplicationCronComponent
  extends BaseComponent
  implements LifeCycleObserver
{
  private cronTime: ICronTime = {};
  private cronInstances: ICronInstances = {};

  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE)
    private application: BaseApplication,
    @inject('services.MinioService')
    private minioService: MinioService,
    @inject('services.CronJobService')
    private cronJobService: CronJobService,
    @inject('repositories.CronLockRepository')
    private cronLockRepository: CronLockRepository,
  ) {
    super({ scope: ApplicationCronComponent.name });

    // Get cron time from config
    for (const code of CronCode.CRON_LIST) {
      this.cronTime[code] = DefaultCronTime.DEFAULT;
    }

    this.cronTime[CronCode.NOTION_SYNC] = '45 16 * * *';
  }
  cronFetchRunningTime() {
    const cronTime = DefaultCronTime.FETCH_TIME;
    const cron = new CronHelper({
      cronTime,
      onTick: async () => {
        this.logger.info('[onTick] Starting cron fetch running time...');
        for (const key in this.cronInstances) {
          const { cronTime } = await this.cronLockRepository.findOne({
            where: { code: key },
          });
          // Has change in cron Time
          if (cronTime && this.cronTime[key] !== cronTime) {
            this.logger.info(
              `[onTick] Cron fetch running time detected changed in cron ${key}`,
            );
            this.cronTime[key] = cronTime;

            // Restart cron
            const cronInstance = this.cronInstances[key];
            cronInstance.instance.setTime(new CronTime(cronTime));
            this.logger.info(`[onTick] Cron ${key} restarted`);
          }
        }
        this.logger.info('[onTick] Complete cron fetch running time...');
      },
    });

    cron.start();
  }

  // Cron CHECK_OUT
  cronCheckout() {
    const cronTime = this.cronTime[CronCode.CHECK_OUT];
    const checkoutCallback = async () => {
      this.logger.info('[onTick] Starting cron checkout...');
      const checkOutService = await this.application.get<CheckOutService>(
        'services.CheckOutService',
      );
      await checkOutService.checkOutEndDay();
      this.logger.info('[onTick] Complete cron checkout...');
    };

    const cron = new CronHelper({
      cronTime,
      onTick: async () => {
        await this.cronJobService.runCronJobWithLock(
          CronCode.CHECK_OUT,
          checkoutCallback,
        );
      },
    });
    this.cronInstances[CronCode.CHECK_OUT] = cron;

    cron.start();
  }

  // Cron DELETE_IMAGES
  cronDeleteRedundantImg() {
    const cronTime = this.cronTime[CronCode.DELETE_IMAGES];
    const deleteImgsCallback = async () => {
      const userProfileService = this.application.getSync<UserProfileService>(
        'services.UserProfileService',
      );
      this.logger.info('[onTick] Starting cron delete redundant images...');
      const listImgsName: string[] = (
        await this.minioService.getAllObjsInBucket('employee')
      ).map(obj => obj.name);
      const listUserProfiles: UserProfile[] =
        await userProfileService.getUserImgs();
      const listUserProfileImgs: string[] = listUserProfiles.map(
        e => e.faceImgUrl?.split('/')[1]!,
      );
      const dif = difference(listImgsName, listUserProfileImgs);
      await this.minioService.removeImgsInBucket('employee', dif);
      this.logger.info('[onTick] Complete cron delete redundant images...');
    };

    const cron = new CronHelper({
      cronTime,
      onTick: async () => {
        await this.cronJobService.runCronJobWithLock(
          CronCode.DELETE_IMAGES,
          deleteImgsCallback,
        );
      },
    });
    this.cronInstances[CronCode.DELETE_IMAGES] = cron;

    cron.start();
  }

  // Cron ENCODE
  cronEncodeImg() {
    const cronTime = this.cronTime[CronCode.ENCODE];
    const cron = new CronHelper({
      cronTime,
      onTick: async () => {
        const faceRecogService = this.application.getSync<FaceRecogService>(
          'services.FaceRecogService',
        );
        this.logger.info('[onTick] Starting cron encode images...');
        await faceRecogService.encodeImgs();
        this.logger.info('[onTick] Complete cron encode images...');
      },
    });
    this.cronInstances[CronCode.ENCODE] = cron;

    cron.start();
  }

  // Cron NOTION
  cronNotionSync() {
    const cronTime = this.cronTime[CronCode.NOTION_SYNC];
    const notionSyncCallback = async () => {
      this.logger.info('[onTick] Starting cron sync Notion...');
      const syncService = await this.application.get<SyncService>(
        'services.SyncService',
      );
      await syncService.syncNotionRecord();
      this.logger.info('[onTick] Complete cron sync Notion...');
    };

    const cron = new CronHelper({
      cronTime,
      onTick: async () => {
        await this.cronJobService.runCronJobWithLock(
          CronCode.NOTION_SYNC,
          notionSyncCallback,
        );
      },
    });
    this.cronInstances[CronCode.NOTION_SYNC] = cron;

    cron.start();
  }

  start() {
    this.logger.info('[configure] Initialized application cron component!');
    this.cronFetchRunningTime();
    this.cronCheckout();
    this.cronDeleteRedundantImg();
    this.cronNotionSync();
  }
}
