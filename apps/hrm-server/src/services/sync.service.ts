import { inject } from '@loopback/core';
import { NotionHelper } from '@mt-hrm/helpers/notion';
import { AttendanceSync } from '@mt-hrm/models/response/attendance.model';
import { AttendanceRepository } from '@mt-hrm/repositories';

export class SyncService {
  constructor(
    @inject('helpers.NotionHelper')
    private notionHelper: NotionHelper,
    @inject('repositories.AttendanceRepository')
    private attendanceRepository: AttendanceRepository,
  ) {}
  async syncNotionRecord() {
    const unsyncNotionAttendance = await this.attendanceRepository.find({
      where: {
        notionRecordId: { eq: null },
      },
      include: [
        'notionPage',
        {
          relation: 'user',
          scope: {
            include: ['profile'],
          },
        },
      ],
    });

    for (const attendance of unsyncNotionAttendance) {
      const attendanceSync: AttendanceSync = {
        ...attendance,
        fullname: attendance.user.profile.fullName,
        checkInTime: attendance.createdAt,
        databaseId: attendance.notionPage?.databaseId,
      };

      await this.notionHelper.syncAttendanceRecord(attendanceSync);
    }
  }
}
