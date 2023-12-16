import {
  BaseApplication,
  BaseComponent,
  JWTTokenService,
  SocketIOComponent,
  SocketIOKeys,
  applicationEnvironment,
} from '@lb/infra';
import { CoreBindings, LifeCycleObserver, inject } from '@loopback/core';
import { EnvironmentKeys, RestPaths } from '@mt-hrm/common';
import { RedisService } from '@mt-hrm/services';

export class ApplicationSocketIOServerComponent
  extends BaseComponent
  implements LifeCycleObserver
{
  constructor(
    @inject('services.RedisService') private redisService: RedisService,
    @inject(CoreBindings.APPLICATION_INSTANCE)
    private application: BaseApplication,
  ) {
    super({ scope: ApplicationSocketIOServerComponent.name });
  }

  start() {
    this.logger.info('[start] Initializing Application Socket IO Server');

    const ioRedisCluster = this.redisService.getRedisByName('REDIS_IO_CLUSTER');
    const APPLICATION_NAME = applicationEnvironment.get<string>(
      EnvironmentKeys.APP_ENV_APPLICATION_NAME,
    );

    const jwtTokenService = this.application.getSync<JWTTokenService>(
      'services.JWTTokenService',
    );
    this.application
      .bind(SocketIOKeys.IDENTIFIER)
      .to(`${APPLICATION_NAME}_SOCKET_IO_SERVER`);
    this.application.bind(SocketIOKeys.SERVER_OPTIONS).to({
      path: RestPaths.STREAM,
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        preflightContinue: false,
        optionsSuccessStatus: 204,
        credentials: true,
      },
    });
    this.application
      .bind(SocketIOKeys.REDIS_CONNECTION)
      .to(ioRedisCluster.client);
    this.application
      .bind(SocketIOKeys.AUTHENTICATE_HANDLER)
      .to(async (handshake: { headers: any }) => {
        const token = jwtTokenService.extractCredentials(handshake);
        const rs = jwtTokenService.verify(token);
        return rs?.userId !== undefined && rs.userId;
      });
    this.application.component(SocketIOComponent);
  }
}
