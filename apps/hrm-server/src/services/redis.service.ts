import { BaseService, getError, RedisHelper } from '@lb/infra';
import { BindingScope, inject, injectable } from '@loopback/core';
import { BindingKeys } from '@mt-hrm/common';

// ----------------------------------------------------------------------------------
@injectable({ scope: BindingScope.SINGLETON })
export class RedisService extends BaseService {
  constructor(
    @inject(BindingKeys.REDIS_IO_CLUSTER) private ioClusterRedis: RedisHelper,
  ) {
    super({ scope: RedisService.name });
  }

  getRepository() {
    return null;
  }

  getRedisByName(name: 'REDIS_IO_CLUSTER') {
    switch (name) {
      case 'REDIS_IO_CLUSTER': {
        return this.ioClusterRedis;
      }
      default: {
        throw getError({
          message: 'Invalid redis name! Valid name: REDIS_IO_CLUSTER.',
        });
      }
    }
  }
}
