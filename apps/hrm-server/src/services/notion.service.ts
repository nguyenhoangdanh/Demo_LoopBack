import { inject, Provider } from '@loopback/core';
import { getService } from '@loopback/service-proxy';
import { NotionDataSource } from '@mt-hrm/datasources';

interface NotionPageBody {
  parent?: {
    database_id: string;
  };
  properties: object;
}

export interface NotionPage {
  object: string;
  id: string;
  parent: {
    type: string;
    database_id: string;
  };
  properties: object;
}

// ------------------------------------------------------------------------------
interface NotionDatabaseBody {
  parent: {
    page_id: string;
  };
  title: [
    {
      type: 'text';
      text: {
        content: string;
      };
    },
  ];
  is_inline: boolean;
  properties: object;
}

interface NotionDatabase {
  object: string;
  id: string;
  parent: {
    type: string;
    page_id: string;
  };
  properties: object;
}

// ------------------------------------------------------------------------------
interface NotionDatabaseQuery {
  results: NotionPage[];
}

// ------------------------------------------------------------------------------
export interface NotionService {
  getPage(pageId: string): Promise<object>;
  getDatabase(databaseId: string): Promise<object>;
  filterDatabaseWithMonth(
    databaseId: string,
    body: object,
  ): Promise<NotionDatabaseQuery>;
  addNewMonthPage(body: NotionPageBody): Promise<NotionPage>;
  addNewAttendancePage(body: NotionPageBody): Promise<NotionPage>;
  createNewAttendanceDatabase(
    body: NotionDatabaseBody,
  ): Promise<NotionDatabase>;
  updateAttendanceRecord(
    pageId: string,
    body: NotionPageBody,
  ): Promise<NotionPage>;
}

export class NotionServiceProvider implements Provider<NotionService> {
  constructor(
    @inject('datasources.Notion')
    protected dataSource: NotionDataSource = new NotionDataSource(),
  ) {}

  value(): Promise<NotionService> {
    return getService(this.dataSource);
  }
}
