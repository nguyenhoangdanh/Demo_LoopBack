import { applicationEnvironment } from '@lb/infra';
import { inject, lifeCycleObserver, LifeCycleObserver } from '@loopback/core';
import { juggler } from '@loopback/repository';
import { EnvironmentKeys } from '@mt-hrm/common';

const config = {
  name: 'Notion',
  connector: 'rest',
  baseURL: 'https://api.notion.com',
  crud: false,
  options: {
    headers: {
      Authorization: `Bearer ${applicationEnvironment.get<string>(
        EnvironmentKeys.APP_ENV_NOTION_API_KEY,
      )}`,
      'Notion-Version': '2022-06-28',
    },
  },
  operations: [
    {
      template: {
        method: 'GET',
        url: 'https://api.notion.com/v1/pages/{pageId}',
      },
      functions: {
        getPage: ['pageId'],
      },
    },
    {
      template: {
        method: 'GET',
        url: 'https://api.notion.com/v1/databases/{databaseId}',
      },
      functions: {
        getDatabase: ['databaseId'],
      },
    },
    {
      template: {
        method: 'POST',
        url: 'https://api.notion.com/v1/databases/{databaseId}/query',
        body: '{body}',
      },
      functions: {
        filterDatabaseWithMonth: ['databaseId', 'body'],
      },
    },
    {
      template: {
        method: 'POST',
        url: 'https://api.notion.com/v1/pages',
        body: '{body}',
      },
      functions: {
        addNewMonthPage: ['body'],
        addNewAttendancePage: ['body'],
      },
    },
    {
      template: {
        method: 'POST',
        url: 'https://api.notion.com/v1/databases',
        body: '{body}',
      },
      functions: {
        createNewAttendanceDatabase: ['body'],
      },
    },
    {
      template: {
        method: 'PATCH',
        url: 'https://api.notion.com/v1/pages/{pageId}',
        body: '{body}',
      },
      functions: {
        updateAttendanceRecord: ['pageId', 'body'],
      },
    },
  ],
};

@lifeCycleObserver('datasource')
export class NotionDataSource
  extends juggler.DataSource
  implements LifeCycleObserver
{
  static dataSourceName = 'Notion';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.Notion', { optional: true })
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
