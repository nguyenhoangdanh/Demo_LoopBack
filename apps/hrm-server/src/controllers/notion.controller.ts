import { dayjs, getError } from '@lb/infra';
import { authorize } from '@loopback/authorization';
import { inject } from '@loopback/core';
import { api, get, param, post, requestBody } from '@loopback/rest';
import { Authentication, FixedUserRoles, RestPaths } from '@mt-hrm/common';
import {
  NotionMonthAddRequest,
  NotionMonthAddSchema,
  NotionAttendanceCreateSchema,
  NotionAttendanceCreateRequest,
  NotionAttendanceAddSchema,
  NotionAttendanceAddRequest,
} from '@mt-hrm/models/request';
import { NotionPageRepository } from '@mt-hrm/repositories';
import { NotionService } from '@mt-hrm/services';
import { isEmpty } from 'lodash';
import { authenticate } from '@loopback/authentication';

// ------------------------------------------------------------------------------
@authorize({ allowedRoles: [FixedUserRoles.SUPER_ADMIN, FixedUserRoles.ADMIN] })
@authenticate(Authentication.STRATEGY_JWT)
@api({ basePath: RestPaths.NOTION })
export class NotionController {
  constructor(
    @inject('services.NotionService')
    private notionService: NotionService,
    @inject('repositories.NotionPageRepository')
    private notionPageRepository: NotionPageRepository,
  ) {}

  // ------------------------------------------------------------------------------
  @get('/pages/{pageId}')
  async getPage(@param.path.string('pageId') pageId: string): Promise<object> {
    return this.notionService.getPage(pageId);
  }

  // ------------------------------------------------------------------------------
  @get('/databases/{databaseId}')
  async getDatabase(
    @param.path.string('databaseId') databaseId: string,
  ): Promise<object> {
    return this.notionService.getDatabase(databaseId);
  }

  // ------------------------------------------------------------------------------
  @get('/databases/{databaseId}/month/{filterMonth}')
  async filterDatbaseWithMonth(
    @param.path.string('databaseId') databaseId: string,
    @param.path.string('filterMonth') filterMonth?: string,
  ): Promise<object> {
    if (isEmpty(filterMonth)) {
      filterMonth = dayjs().format('YYYY-MM');
    }

    return this.notionService.filterDatabaseWithMonth(databaseId, {
      filter: {
        property: 'Month',
        title: {
          equals: filterMonth,
        },
      },
    });
  }

  // ------------------------------------------------------------------------------
  @post('/pages/month', {
    responses: {
      '200': {
        description: 'Create new month row in Notion database',
        context: { 'application/json': {} },
      },
    },
  })
  async createMonthPage(
    @requestBody({
      description: 'Create a new Month Notion database',
      required: true,
      content: {
        'application/json': { schema: NotionMonthAddSchema },
      },
    })
    request: NotionMonthAddRequest,
  ): Promise<object> {
    let { parentDatabaseId, newMonth } = request;

    const { id } = await this.notionService.addNewMonthPage({
      parent: {
        database_id: parentDatabaseId,
      },
      properties: {
        Month: {
          title: [
            {
              text: {
                content: newMonth,
              },
            },
          ],
        },
      },
    });
    if (!isEmpty(id)) {
      // Update the new month database to the notion page table
      return this.notionPageRepository.create({
        pageId: id,
      });
    }
    throw getError({
      statusCode: 500,
      message: 'Failed to create new month database',
    });
  }

  // ------------------------------------------------------------------------------
  @post('/databases/attendance', {
    responses: {
      '200': {
        description: 'Create new month row in Notion database',
        context: { 'application/json': {} },
      },
    },
  })
  async createAttendanceRecord(
    @requestBody({
      description: 'Create a new Attendance Database for Notion',
      required: true,
      content: {
        'application/json': { schema: NotionAttendanceCreateSchema },
      },
    })
    request: NotionAttendanceCreateRequest,
  ): Promise<object> {
    const { id, parent } = await this.notionService.createNewAttendanceDatabase(
      {
        parent: {
          page_id: request.parentPageId,
        },
        title: [
          {
            type: 'text',
            text: {
              content: `Attendance Record for ${
                request.month ?? dayjs().format('YYYY-MM')
              }`,
            },
          },
        ],
        is_inline: true,
        properties: {
          Name: {
            title: {},
          },
          Date: {
            date: {},
          },
          'Employee ID': {
            number: {},
          },
          In: {
            checkbox: {},
          },
          'Check In At': {
            rich_text: {},
          },
          'Check In Address': {
            rich_text: {},
          },
          'Check In Location (Lat|Lng)': {
            rich_text: {},
          },
          Out: {
            checkbox: {},
          },
        },
      },
    );
    if (!isEmpty(id) && !isEmpty(parent)) {
      return this.notionPageRepository.updateAll(
        { databaseId: id },
        { pageId: parent.page_id },
      );
    }
    throw getError({
      statusCode: 500,
      message: 'Failed to create new month database',
    });
  }

  // ------------------------------------------------------------------------------
  @post('/pages/attedance', {
    responses: {
      '200': {
        description: 'Create new attendance row in Notion database',
        context: { 'application/json': {} },
      },
    },
  })
  async createAttendancePage(
    @requestBody({
      description: 'Create a new Attendance Notion database',
      required: true,
      content: {
        'application/json': { schema: NotionAttendanceAddSchema },
      },
    })
    request: NotionAttendanceAddRequest,
  ): Promise<object> {
    let { parentDatabaseId, employeeId, checkInAt, date, checkInAddress } =
      request;

    return this.notionService.addNewAttendancePage({
      parent: {
        database_id: parentDatabaseId,
      },
      properties: {
        'Employee ID': {
          number: employeeId,
        },
        Name: {
          title: [
            {
              text: {
                content: 'Vo Anh Viet',
              },
            },
          ],
        },
        Date: {
          date: {
            start: date,
          },
        },
        'Check In At': {
          rich_text: [
            {
              text: { content: checkInAt },
            },
          ],
        },
        'Check In Location (Lat|Lng)': {
          rich_text: [
            {
              text: { content: '10.772391 | 106.697848' },
            },
          ],
        },
        'Check In Address': {
          rich_text: [
            {
              text: { content: checkInAddress },
            },
          ],
        },
        In: {
          checkbox: true,
        },
      },
    });
  }
}
