import { BaseComponent } from '@lb/infra';
import {
  Application,
  CoreBindings,
  inject,
  LifeCycleObserver,
} from '@loopback/core';
import { NotionHelper } from 'helpers/notion';

export class NotionComponent
  extends BaseComponent
  implements LifeCycleObserver
{
  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE) private application: Application,
  ) {
    super({ scope: NotionComponent.name });
  }

  start() {
    this.application.bind('helpers.NotionHelper').toClass(NotionHelper);

    this.logger.info('[configure] Initialized Notion component!');
  }
}
