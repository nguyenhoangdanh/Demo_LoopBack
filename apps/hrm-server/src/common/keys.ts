import { BindingKey } from '@loopback/core';

export class BindingKeys {
  // -------------------------------------------------------------------------------------
  static readonly APPLICATION_INSTANCE = '@hrm/application';
  static readonly APPLICATION_ROOT_CONTEXT = '@hrm/context/root';
  static readonly APPLICATION_ENVIRONMENTS = '@hrm/application/environments';

  // -------------------------------------------------------------------------------------
  static readonly AUTHORIZATION_PROVIDER =
    '@hrm/application/authorization/provider';
  static readonly ENFORCER_ADAPTER = BindingKey.create(
    '@hrm/application/authorization/enforcer-adapter',
  );
  static readonly ENFORCER_FACTORY = BindingKey.create(
    '@hrm/application/authorization/enforcer-factory',
  );

  // -------------------------------------------------------------------------------------
  static readonly REDIS_IO_CLUSTER = '@hrm/application/io';
}

export namespace LoggerBindings {
  export const LOGGER = BindingKey.create(
    '@hrm/binding/application-logger-instance',
  );
  export const LOGGER_FACTORY = BindingKey.create(
    '@hrm/binding/application-logger-factory',
  );
}
