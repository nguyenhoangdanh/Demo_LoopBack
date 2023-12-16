import { applicationLogger } from '@lb/infra';
import { runMtHrm } from './000-hrm-starter';

export * from './hrm-application';

export const main = async () => {
  const mtHrm = await runMtHrm();
  return { mtHrm };
};

main().catch(error => {
  applicationLogger.error('Cannot start the application | Error: %s', error);
  process.exit(1);
});

if (require.main !== module) {
  applicationLogger.log(
    'error',
    'Invalid application module to start application!',
  );
  process.exit(1);
}
