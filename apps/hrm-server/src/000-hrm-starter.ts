import { MtHrmApplication } from './hrm-application';
import path from 'path';
import { applicationContext } from '@configurations';
import { BindingKeys, EnvironmentKeys } from '@common';
import { applicationEnvironment, LoggerFactory } from '@lb/infra';

const applicationName =
  applicationEnvironment
    .get<string>(EnvironmentKeys.APP_ENV_APPLICATION_NAME)
    ?.toUpperCase() ?? '';

export const configs = {
  rest: {
    gracePeriodForClose: 5000,
    openApiSpec: {
      disabled: process.env.NODE_ENV === 'production',
      setServersFromRequest: true,
      endpointMapping: {
        '/openapi.json': { version: '3.0.0', format: 'json' },
        '/openapi.yaml': { version: '3.0.0', format: 'yaml' },
      },
    },
    apiExplorer: {
      disabled: process.env.NODE_ENV === 'production',
      httpUrl: '/v1/api/explorer',
      url: '/v1/api/explorer',
    },
    cors: {
      origin: '*',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      preflightContinue: false,
      optionsSuccessStatus: 204,
      maxAge: 86400,
      credentials: true,
    },
    requestBodyParser: {
      json: {
        limit: '10mb',
      },
    },
  },
};

// Run the application
export const runMtHrm = async () => {
  const logger = LoggerFactory.getLogger(['runMtHrm']);

  const app = new MtHrmApplication(configs);
  applicationContext.bind(BindingKeys.APPLICATION_INSTANCE).to(app);

  logger.info(' Getting ready to start up %s Application...', applicationName);
  await app.boot();
  await app.start();

  const logFolder = path
    .resolve(__dirname, process.env.APP_ENV_LOGGER_FOLDER_PATH ?? '')
    .toString();
  const { url } = app.restServer;
  logger.info(' %s Server is now running...', applicationName);
  logger.info(' Server URL: %s', url);
  logger.info(' Log folder: %s', logFolder);
  return app;
};
