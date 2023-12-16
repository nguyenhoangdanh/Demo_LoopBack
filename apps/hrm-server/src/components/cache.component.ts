import { applicationEnvironment, BaseComponent } from '@lb/infra';
import {
  Application,
  CoreBindings,
  inject,
  LifeCycleObserver,
} from '@loopback/core';
import { EnvironmentKeys } from '@mt-hrm/common';
import { RedisHelper } from 'helpers/redis';

export class CacheComponent extends BaseComponent implements LifeCycleObserver {
  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE) private application: Application,
  ) {
    super({ scope: CacheComponent.name });
  }

  start() {
    const redis = new RedisHelper({
      name: 'redis',
      host:
        applicationEnvironment.get<string>(
          EnvironmentKeys.APP_ENV_REDIS_HOST,
        ) ?? '127.0.0.1',
      port: +(
        applicationEnvironment.get<string>(
          EnvironmentKeys.APP_ENV_REDIS_PORT,
        ) ?? 6379
      ),
      password:
        applicationEnvironment.get<string>(
          EnvironmentKeys.APP_ENV_REDIS_PASSWORD,
        ) ?? '',
    });
    this.application.bind('helpers.RedisHelper').to(redis);

    this.logger.info('[configure] Initialized Redis component!');
  }
}
