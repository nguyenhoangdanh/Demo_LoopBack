import {
  applicationEnvironment,
  ApplicationLogger,
  LoggerFactory,
} from '@lb/infra';
import { inject } from '@loopback/core';
import { EnvironmentKeys } from '@mt-hrm/common';
import { NotionPage } from '@mt-hrm/models';
import {
  AttendanceRepository,
  NotionPageRepository,
} from '@mt-hrm/repositories';
import {
  NotionService,
  NotionPage as NotionServicePage,
} from '@mt-hrm/services';
import { isEmpty } from 'lodash';
import {
  AttendanceRes,
  AttendanceSync,
} from '@mt-hrm/models/response/attendance.model';
import { Attendance } from '@mt-hrm/models';
import { dayjs, getVnDate } from '../../utils/date.utility';
import { getError } from '@mt-hrm/utils/error.utility';

export class NotionHelper {
  private notionDatabase: string;
  private logger: ApplicationLogger;

  constructor(
    @inject('repositories.NotionPageRepository')
    private notionPageRepository: NotionPageRepository,
    @inject('services.NotionService')
    private notionService: NotionService,
    @inject('repositories.AttendanceRepository')
    private attendanceRepository: AttendanceRepository,
  ) {
    this.notionDatabase = applicationEnvironment.get<string>(
      EnvironmentKeys.APP_ENV_NOTION_DATABASE_ID,
    );
    this.logger = LoggerFactory.getLogger([NotionHelper.name]);
  }

  async queryMonthPage(month: string): Promise<NotionPage> {
    const startOfMonth = dayjs(month).startOf('month').toDate();
    const endOfMonth = dayjs(month).endOf('month').toDate();
    return await this.notionPageRepository.findOne({
      where: {
        createdAt: {
          between: [startOfMonth, endOfMonth],
        },
      },
    });
  }

  async createNewMonthPage(title: string): Promise<NotionPage> {
    // Create in Notion
    const createdMonthNotion = await this.notionService.addNewMonthPage({
      parent: {
        database_id: this.notionDatabase,
      },
      properties: {
        Month: {
          title: [
            {
              text: {
                content: title,
              },
            },
          ],
        },
      },
    });
    // Add created page to the database
    return await this.notionPageRepository.create({
      pageId: createdMonthNotion.id,
    });
  }

  async getMonthPage(month: string): Promise<NotionPage> {
    let monthPage = await this.queryMonthPage(month);
    if (!monthPage || isEmpty(monthPage.pageId)) {
      monthPage = await this.createNewMonthPage(
        getVnDate(month).format('YYYY-MM'),
      );
    }
    return monthPage;
  }

  // ------------------------------------------------------------------------------
  async queryAttendanceDbInMonthPage(monthPageId: string): Promise<NotionPage> {
    return await this.notionPageRepository.findOne({
      where: {
        pageId: {
          eq: monthPageId,
        },
      },
    });
  }

  async createNewAttendanceDb(monthPage: NotionPage): Promise<NotionPage> {
    const createdAttendanceDb =
      await this.notionService.createNewAttendanceDatabase({
        parent: {
          page_id: monthPage.pageId,
        },
        title: [
          {
            type: 'text',
            text: {
              content: `Attendances History on ${getVnDate(
                monthPage.createdAt.toISOString(),
              ).format('YYYY-MM')}`,
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
          'Check Out At': {
            rich_text: {},
          },
        },
      });

    return await this.notionPageRepository.updateWithReturn(monthPage.id, {
      databaseId: createdAttendanceDb.id,
    });
  }

  async getAttendanceDatabase(monthPage: NotionPage): Promise<NotionPage> {
    let attendanceDatabase = await this.queryAttendanceDbInMonthPage(
      monthPage.pageId,
    );
    if (!attendanceDatabase || isEmpty(attendanceDatabase.databaseId)) {
      attendanceDatabase = await this.createNewAttendanceDb(monthPage);
    }
    return attendanceDatabase;
  }

  // ------------------------------------------------------------------------------
  async addNotionRecordAttendance(
    newData: AttendanceRes,
    notionPage: NotionPage,
    recordId: number,
  ): Promise<void> {
    const checkInTimeInVn = getVnDate(newData.checkInTime);

    try {
      const res = await this.notionService.addNewAttendancePage({
        parent: {
          database_id: notionPage.databaseId,
        },
        properties: {
          'Employee ID': {
            number: newData.userId,
          },
          Name: {
            title: [
              {
                text: {
                  content: newData.fullname,
                },
              },
            ],
          },
          Date: {
            date: {
              start: checkInTimeInVn.format('YYYY-MM-DD'),
            },
          },
          'Check In At': {
            rich_text: [
              {
                text: {
                  content: checkInTimeInVn.format('YYYY-MM-DD HH:mm:ss'),
                },
              },
            ],
          },
          'Check In Location (Lat|Lng)': {
            rich_text: [
              {
                text: {
                  content: `${newData.coordinates.lat} | ${newData.coordinates.lng}`,
                },
              },
            ],
          },
          'Check In Address': {
            rich_text: [
              {
                text: { content: newData.address },
              },
            ],
          },
          In: {
            checkbox: true,
          },
        },
      });

      if (res) {
        await this.attendanceRepository.updateById(recordId, {
          notionRecordId: res.id,
        });
      }
    } catch (e) {
      this.logger.error('[addNotionRecordAttendance] err:', e);
    }
  }

  async addNewAttendanceRecord(
    newData: AttendanceRes,
    notionPage: NotionPage,
  ): Promise<Attendance> {
    const newAttendance = new Attendance({
      userId: newData.userId,
      address: newData.address,
      coordinates: {
        lat: newData.coordinates.lat,
        lng: newData.coordinates.lng,
      },
      notionPageId: notionPage.id,
    });
    const attendanceRes = await this.attendanceRepository.create(newAttendance);
    this.addNotionRecordAttendance(newData, notionPage, attendanceRes.id);
    return attendanceRes;
  }

  // ------------------------------------------------------------------------------
  async updateAttendanceCheckOut(
    attendanceRecordId: number,
    checkOutTime: string,
  ): Promise<NotionServicePage | undefined> {
    const checkOutTimeInVn = getVnDate(checkOutTime);
    const { notionRecordId } = await this.attendanceRepository.findById(
      attendanceRecordId,
    );

    if (!notionRecordId) {
      this.logger.error(
        `[updateAttendanceCheckOut]: NotionRecordId not found for attendance ${attendanceRecordId}`,
      );
      return;
    }

    return await this.notionService.updateAttendanceRecord(notionRecordId, {
      properties: {
        Out: {
          checkbox: true,
        },
        'Check Out At': {
          rich_text: [
            {
              text: { content: checkOutTimeInVn.format('YYYY-MM-DD HH:mm:ss') },
            },
          ],
        },
      },
    });
  }

  // ------------------------------------------------------------------------------
  async syncNotionRecordAttendance(syncData: AttendanceSync): Promise<string> {
    const checkInTimeInVn = getVnDate(syncData.checkInTime);

    const dataSyncToNotion = {
      parent: {
        database_id: syncData.databaseId,
      },
      properties: {
        'Employee ID': {
          number: syncData.userId,
        },
        Name: {
          title: [
            {
              text: {
                content: syncData.fullname,
              },
            },
          ],
        },
        Date: {
          date: {
            start: checkInTimeInVn.format('YYYY-MM-DD'),
          },
        },
        'Check In At': {
          rich_text: [
            {
              text: { content: checkInTimeInVn.format('YYYY-MM-DD HH:mm:ss') },
            },
          ],
        },
        'Check In Location (Lat|Lng)': {
          rich_text: [
            {
              text: {
                content: `${syncData.coordinates.lat} | ${syncData.coordinates.lng}`,
              },
            },
          ],
        },
        'Check In Address': {
          rich_text: [
            {
              text: { content: syncData.address },
            },
          ],
        },
        In: {
          checkbox: true,
        },
        ...(syncData.checkOutTime && {
          'Check Out At': {
            rich_text: [
              {
                text: {
                  content: getVnDate(syncData.checkOutTime).format(
                    'YYYY-MM-DD HH:mm:ss',
                  ),
                },
              },
            ],
          },
          Out: {
            checkbox: true,
          },
        }),
      },
    };

    try {
      const res = await this.notionService.addNewAttendancePage(
        dataSyncToNotion,
      );

      return res.id;
    } catch (e) {
      this.logger.error('[syncNotionRecordAttendance] err:', e);
      throw getError({
        message: '[syncNotionRecordAttendance] err: cannot sync Notion',
      });
    }
  }

  async syncAttendanceRecord(
    attendanceData: AttendanceSync,
  ): Promise<Attendance> {
    const notionRecordId = await this.syncNotionRecordAttendance(
      attendanceData,
    );

    const res = await this.attendanceRepository.updateWithReturn(
      attendanceData.id,
      {
        notionRecordId,
      },
    );
    return res;
  }
}
