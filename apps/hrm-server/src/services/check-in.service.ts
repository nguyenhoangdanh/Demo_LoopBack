import { Getter, inject } from '@loopback/core';
import { FaceRecogService } from './face-recog.service';
import { Request } from '@loopback/rest';
import { SecurityBindings, UserProfile } from '@loopback/security';
import { isEmpty } from 'lodash';
import { getError } from '@lb/infra';
import { AttendanceRes } from '@mt-hrm/models/response/attendance.model';
import { UserProfileRepository } from '@mt-hrm/repositories';
import { NotionHelper } from '@mt-hrm/helpers/notion';
import { Attendance } from '@mt-hrm/models';
import { NotificationActions, SagaHelper } from '@mt-hrm/helpers';
import { NotificationTypes } from '@mt-hrm/common';

export class CheckInService {
  constructor(
    @inject('services.FaceRecogService')
    private faceRecog: FaceRecogService,
    @inject('repositories.UserProfileRepository')
    private userProfileRepository: UserProfileRepository,
    @inject.getter(SecurityBindings.USER, { optional: true })
    private getCurrentUser: Getter<UserProfile>,
    @inject('helpers.NotionHelper')
    private notionHelper: NotionHelper,
  ) {}

  async checkIn(imgBuffer: Buffer, request: Request): Promise<AttendanceRes> {
    const currentUser = await this.getCurrentUser();

    if (!this.validRequest) {
      throw getError({ message: 'Invalid request body.', statusCode: 400 });
    }
    if (!currentUser) {
      throw getError({ message: 'Invalid user', statusCode: 400 });
    }

    const validIdentity = await this.faceRecog.compareFaces(imgBuffer);

    const attendanceRes: AttendanceRes = {
      userId: currentUser.userId,
      fullname: 'Unknown',
      checkInTime: '',
      address: request.body.address,
      coordinates: {
        lat: request.body.lat,
        lng: request.body.lng,
      },
      imgFace: imgBuffer,
    };
    if (!validIdentity) {
      return attendanceRes;
    } else {
      const user = await this.userProfileRepository.findOne({
        where: { userId: currentUser.userId },
      });
      attendanceRes.fullname = user.fullName;
      attendanceRes.checkInTime = new Date().toISOString();
      const { id } = await this.saveAttendance(attendanceRes);

      // Saga dispatch notification for dashboard
      SagaHelper.getInstance().dispatch({
        type: NotificationActions.OBSERVE_NOTIFICATION,
        payload: {
          type: NotificationTypes.MESSAGE,
          args: {
            action: 'check-in',
            payload: {
              userId: attendanceRes.userId,
              createdAt: attendanceRes.checkInTime,
            },
          },
          error: 'check-in socket failed',
        },
        log: true,
      });
      return { ...attendanceRes, id };
    }
  }

  validRequest(request: Request) {
    const { coordinate, address } = request.body;
    return (
      coordinate &&
      address &&
      !isEmpty(coordinate.lat) &&
      !isEmpty(coordinate.lng) &&
      !isEmpty(address)
    );
  }

  async saveAttendance(attendanceRes: AttendanceRes): Promise<Attendance> {
    // Notion & Database handler
    let notionPageForMonth = await this.notionHelper.getMonthPage(
      attendanceRes.checkInTime,
    );
    let NotionPageForAttendance = await this.notionHelper.getAttendanceDatabase(
      notionPageForMonth,
    );
    return await this.notionHelper.addNewAttendanceRecord(
      attendanceRes,
      NotionPageForAttendance,
    );
  }

  async checkIdentity(imgBuffer: Buffer, uid: any): Promise<boolean> {
    const uidRecog = await this.faceRecog.runFaceRecogScript(imgBuffer);
    const uidCurrent = Number(uid);

    return uidCurrent === uidRecog;
  }
}
