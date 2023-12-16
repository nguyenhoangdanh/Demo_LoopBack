import { Getter, inject } from '@loopback/core';
import { NotificationTypes } from '@mt-hrm/common';
import { NotificationActions, SagaHelper } from '@mt-hrm/helpers';
import { NotionHelper } from '@mt-hrm/helpers/notion';
import { Attendance } from '@mt-hrm/models';
import { AttendanceRepository } from '@mt-hrm/repositories';
import { SecurityBindings, UserProfile } from '@loopback/security';

export class CheckOutService {
  constructor(
    @inject('helpers.NotionHelper')
    private notionHelper: NotionHelper,
    @inject('repositories.AttendanceRepository')
    private attendanceRepository: AttendanceRepository,
    @inject.getter(SecurityBindings.USER, { optional: true })
    private getCurrentUser: Getter<UserProfile>,
  ) {}
  async checkOut(id: number, userId?: number): Promise<Attendance> {
    const checkOutTime = new Date().toISOString();

    await this.notionHelper.updateAttendanceCheckOut(id, checkOutTime);
    const attendanceCheckOut = await this.attendanceRepository.updateWithReturn(
      id,
      {
        checkOutTime,
      },
    );

    // Saga dispatch notification for dashboard
    SagaHelper.getInstance().dispatch({
      type: NotificationActions.OBSERVE_NOTIFICATION,
      payload: {
        type: NotificationTypes.MESSAGE,
        args: {
          action: 'check-out',
          payload: {
            userId: userId ?? (await this.getCurrentUser()).userId,
            checkOutAt: checkOutTime,
          },
        },
        error: 'check-out socket failed',
      },
      log: true,
    });
    return attendanceCheckOut;
  }

  async checkOutEndDay() {
    const res = await this.attendanceRepository.updateAttendanceCheckOutTime();

    for (const attendance of res) {
      await this.notionHelper.updateAttendanceCheckOut(
        attendance.id,
        attendance.check_out_time,
      );

      // Saga dispatch notification for dashboard
      SagaHelper.getInstance().dispatch({
        type: NotificationActions.OBSERVE_NOTIFICATION,
        payload: {
          type: NotificationTypes.MESSAGE,
          args: {
            action: 'check-out',
            payload: {
              userId:
                attendance.user_id ?? (await this.getCurrentUser()).userId,
              checkOutAt: attendance.check_out_time,
            },
          },
          error: 'check-out socket failed',
        },
        log: true,
      });
    }
  }
}
