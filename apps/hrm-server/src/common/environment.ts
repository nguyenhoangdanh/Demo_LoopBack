export class EnvironmentKeys {
  // Application
  static readonly APP_ENV_APPLICATION_NAME = 'APP_ENV_APPLICATION_NAME';
  static readonly APP_ENV_APPLICATION_TIMEZONE = 'APP_ENV_APPLICATION_TIMEZONE';
  static readonly APP_ENV_APPLICATION_DS_MIGRATION =
    'APP_ENV_APPLICATION_DS_MIGRATION';
  static readonly APP_ENV_APPLICATION_DS_AUTHORIZE =
    'APP_ENV_APPLICATION_DS_AUTHORIZE';
  static readonly APP_ENV_LOGGER_FOLDER_PATH = 'APP_ENV_LOGGER_FOLDER_PATH';
  static readonly APP_ENV_APPLICATION_SECRET = 'APP_ENV_APPLICATION_SECRET';
  static readonly APP_ENV_APPLICATION_DO_LOG_MARKET_DATA =
    'APP_ENV_APPLICATION_DO_LOG_MARKET_DATA';
  static readonly APP_ENV_APPLICATION_ROLES = 'APP_ENV_APPLICATION_ROLES';

  // Database
  static readonly APP_ENV_DATASOURCE_NAME = 'APP_ENV_DATASOURCE_NAME';
  static readonly APP_ENV_POSTGRES_HOST = 'APP_ENV_POSTGRES_HOST';
  static readonly APP_ENV_POSTGRES_PORT = 'APP_ENV_POSTGRES_PORT';
  static readonly APP_ENV_POSTGRES_USERNAME = 'APP_ENV_POSTGRES_USERNAME';
  static readonly APP_ENV_POSTGRES_PASSWORD = 'APP_ENV_POSTGRES_PASSWORD';
  static readonly APP_ENV_POSTGRES_DATABASE = 'APP_ENV_POSTGRES_DATABASE';

  // Minio
  static readonly APP_ENV_MINIO_HOST = 'APP_ENV_MINIO_HOST';
  static readonly APP_ENV_MINIO_PORT = 'APP_ENV_MINIO_PORT';
  static readonly APP_ENV_MINIO_ACCESS_KEY = 'APP_ENV_MINIO_ACCESS_KEY';
  static readonly APP_ENV_MINIO_SECRET_KEY = 'APP_ENV_MINIO_SECRET_KEY';

  // Notion
  static readonly APP_ENV_NOTION_API_KEY = 'APP_ENV_NOTION_API_KEY';
  static readonly APP_ENV_NOTION_DATABASE_ID = 'APP_ENV_NOTION_DATABASE_ID';

  // Redis
  static readonly APP_ENV_REDIS_HOST = 'APP_ENV_REDIS_HOST';
  static readonly APP_ENV_REDIS_PORT = 'APP_ENV_REDIS_PORT';
  static readonly APP_ENV_REDIS_PASSWORD = 'APP_ENV_REDIS_PASSWORD';

  // Redis IO Cluster
  static readonly APP_ENV_REDIS_IO_CLUSTER_HOST =
    'APP_ENV_REDIS_IO_CLUSTER_HOST';
  static readonly APP_ENV_REDIS_IO_CLUSTER_PORT =
    'APP_ENV_REDIS_IO_CLUSTER_PORT';
  static readonly APP_ENV_REDIS_IO_CLUSTER_PASSWORD =
    'APP_ENV_REDIS_IO_CLUSTER_PASSWORD';
}
