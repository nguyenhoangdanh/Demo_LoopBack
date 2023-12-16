import { CoreBindings, inject, LifeCycleObserver } from '@loopback/core';
import { BaseComponent, RedisHelper, applicationEnvironment } from '@lb/infra';
import { BindingKeys, EnvironmentKeys } from '@mt-hrm/common';

export class RedisComponent extends BaseComponent implements LifeCycleObserver {
  private ioClusterRedis: RedisHelper;

  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE) private application: any,
  ) {
    super({ scope: RedisComponent.name });

    // --------------------------------------------------------------------------------
    this.logger.info('Initializing IO CLUSTER REDIS');
    const ioClusterRedisOptions = {
      name: 'IO_CLUSTER_REDIS',
      host: applicationEnvironment.get<string>(
        EnvironmentKeys.APP_ENV_REDIS_IO_CLUSTER_HOST,
      ),
      port: applicationEnvironment.get<number>(
        EnvironmentKeys.APP_ENV_REDIS_IO_CLUSTER_PORT,
      ),
      password: applicationEnvironment.get<string>(
        EnvironmentKeys.APP_ENV_REDIS_IO_CLUSTER_PASSWORD,
      ),
    };
    this.ioClusterRedis = new RedisHelper(ioClusterRedisOptions);
    this.application.bind(BindingKeys.REDIS_IO_CLUSTER).to(this.ioClusterRedis);
  }

  init() {}
}
