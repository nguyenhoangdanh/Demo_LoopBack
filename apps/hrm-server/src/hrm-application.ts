import {
  App,
  applicationEnvironment,
  AuthenticateComponent,
  AuthenticateKeys,
  AuthorizeComponent,
  AuthorizerKeys,
  DefaultRestApplication,
  MinioKeys,
  StaticAssetComponent,
} from '@lb/infra';
import { ApplicationConfig } from '@loopback/core';
import {
  RestExplorerBindings,
  RestExplorerComponent,
} from '@loopback/rest-explorer';
import { NotionDataSource, PostgresDataSource } from '@mt-hrm/datasources';
import {
  AttendanceRepository,
  CronLockRepository,
  DepartmentRepository,
  IssueAssigneeRepository,
  IssueRepository,
  IssueTagRepository,
  MigrationRepository,
  NotionPageRepository,
  PositionRepository,
  StatusRepository,
  TagRepository,
  TypeRepository,
  UserCredentialRepository,
  UserDepartmentRepository,
  UserIdentifierRepository,
  UserPositionRepository,
  UserProfileRepository,
  UserRepository,
  PreferenceRepository,
  UserPreferenceRepository,
} from '@mt-hrm/repositories';
import path from 'path';
import {
  ApplicationCronComponent,
  CacheComponent,
  NotionComponent,
} from './components';
import {
  AuthorizationService,
  CheckOutService,
  CronJobService,
  MetaLinkService,
  MinioService,
  RedisService,
  SyncService,
  UserProfileService,
  UserService,
  FaceRecogService,
  UserIdentifierService,
} from '@mt-hrm/services';
import { Authentication, EnvironmentKeys, FixedUserRoles } from './common';
import { SagaHelper } from '@mt-hrm/helpers';
import { ApplicationSocketIOServerComponent } from '@mt-hrm/components';
import { RedisComponent } from './components/redis.component';
import * as faceapi from '@vladmandic/face-api';
// import { ChangeUserService } from './services/change-user-profile.service';
// import { ChangeUserProfileService } from './services/change-user-profile.service';

export class MtHrmApplication extends DefaultRestApplication {
  constructor(options: ApplicationConfig = {}) {
    super({ serverOptions: options });
  }

  preConfigure(): void {
    super.preConfigure();

    // Repositories
    this.configureRepositories();

    // Services
    this.configureServices();

    // Security
    this.configureSecurity();

    // Saga
    SagaHelper.getInstance();

    if (process.env.RUN_MODE === 'migrate') {
      return;
    }
  }

  configureSecurity() {
    // Authentication
    this.bind(AuthenticateKeys.APPLICATION_SECRET).to(App.SECRET);
    this.bind(AuthenticateKeys.TOKEN_OPTIONS).to({
      tokenSecret: Authentication.ACCESS_TOKEN_SECRET,
      tokenExpiresAt: Authentication.ACCESS_TOKEN_EXPIRES_IN,
      refreshSecret: Authentication.REFRESH_TOKEN_SECRET,
      refreshExpiresIn: Authentication.REFRESH_TOKEN_EXPIRES_IN,
    });

    this.component(AuthenticateComponent);

    // Security - Authorization
    this.bind(AuthorizerKeys.ALWAYS_ALLOW_ROLES).to(
      FixedUserRoles.ALWAYS_ALLOW_ROLES,
    );
    this.bind(AuthorizerKeys.AUTHORIZE_DATASOURCE).toInjectable(
      PostgresDataSource,
    );

    this.component(AuthorizeComponent);
  }

  configureServices() {
    this.service(MetaLinkService);
    this.service(FaceRecogService);
    this.service(SyncService);
    this.service(MinioService);
    this.service(UserProfileService);
    this.service(UserService);
    this.service(AuthorizationService);
    this.service(CronJobService);
    this.service(CheckOutService);
    this.service(RedisService);
    this.service(UserIdentifierService);
  }

  configureRepositories() {
    this.dataSource(NotionDataSource);
    this.repository(MigrationRepository);
    this.repository(UserRepository);
    this.repository(UserIdentifierRepository);
    this.repository(UserCredentialRepository);
    this.repository(UserProfileRepository);
    this.repository(DepartmentRepository);
    this.repository(UserDepartmentRepository);
    this.repository(PositionRepository);
    this.repository(UserPositionRepository);
    this.repository(AttendanceRepository);
    this.repository(NotionPageRepository);
    this.repository(CronLockRepository);
    this.repository(IssueRepository);
    this.repository(IssueAssigneeRepository);
    this.repository(TagRepository);
    this.repository(IssueTagRepository);
    this.repository(TypeRepository);
    this.repository(StatusRepository);
    this.repository(PreferenceRepository);
    this.repository(UserPreferenceRepository);
  }

  staticConfigure(): void {
    this.static('/', path.join(__dirname, '../public'));
  }

  getProjectRoot(): string {
    return __dirname;
  }

  postConfigure(): void {
    if (process.env.NODE_ENV !== 'production') {
      this.configure(RestExplorerBindings.COMPONENT).to({ path: '/explorer' });
      this.component(RestExplorerComponent);
    }
    this.component(CacheComponent);
    this.component(NotionComponent);
    this.component(RedisComponent);
    this.component(ApplicationCronComponent);
    this.component(ApplicationSocketIOServerComponent);

    this.bind(MinioKeys.CONNECTION_OPTIONS).to({
      endPoint:
        applicationEnvironment.get<string>(
          EnvironmentKeys.APP_ENV_MINIO_HOST,
        ) ?? '',
      port:
        +applicationEnvironment.get<string>(
          EnvironmentKeys.APP_ENV_MINIO_PORT,
        ) ?? 9000,
      useSSL: false,
      accessKey:
        applicationEnvironment.get<string>(
          EnvironmentKeys.APP_ENV_MINIO_ACCESS_KEY,
        ) ?? '',
      secretKey:
        applicationEnvironment.get<string>(
          EnvironmentKeys.APP_ENV_MINIO_SECRET_KEY,
        ) ?? '',
    });
    this.component(StaticAssetComponent);

    // Load face-api models
    const modelDisk = path.join(__dirname, '../weights');
    faceapi.nets.ssdMobilenetv1
      .loadFromDisk(modelDisk)
      .then(() => faceapi.nets.faceLandmark68Net.loadFromDisk(modelDisk))
      .then(() => faceapi.nets.faceRecognitionNet.loadFromDisk(modelDisk))
      .catch(error => {
        this.logger.error(error);
      })
      .finally(() => this.logger.info('Loaded face-api models'));
  }
}
