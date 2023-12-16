import { Context } from '@loopback/core';
import { BindingKeys } from '@common';

const applicationContext = new Context(BindingKeys.APPLICATION_ROOT_CONTEXT);
applicationContext.setMaxListeners(128);

export { applicationContext };
