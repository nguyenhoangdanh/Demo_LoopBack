import { Client } from 'minio';
import { applicationEnvironment } from '@lb/infra';
import { EnvironmentKeys } from '@mt-hrm/common';

const config = {
  endPoint:
    applicationEnvironment.get<string>(EnvironmentKeys.APP_ENV_MINIO_HOST) ??
    '',
  port:
    +applicationEnvironment.get<string>(EnvironmentKeys.APP_ENV_MINIO_PORT) ??
    9000,
  useSSL: false,
  accessKey:
    applicationEnvironment.get<string>(
      EnvironmentKeys.APP_ENV_MINIO_ACCESS_KEY,
    ) ?? '',
  secretKey:
    applicationEnvironment.get<string>(
      EnvironmentKeys.APP_ENV_MINIO_SECRET_KEY,
    ) ?? '',
};

export const minioClient = new Client(config);
