import { inject } from '@loopback/core';
import {
  Request,
  Response,
  RestBindings,
  api,
  patch,
  post,
  param,
} from '@loopback/rest';
import { FaceRecogService } from '../services/face-recog.service';
import { File } from '../models/request/meta-link.model';
import { getError, parseMultipartBody } from '@lb/infra';
import { CheckInService } from '@mt-hrm/services/check-in.service';
import { Authentication, FixedUserRoles, RestPaths } from '@mt-hrm/common';
import { authenticate } from '@loopback/authentication';
import { CheckOutService } from '@mt-hrm/services/check-out.service';
import { authorize } from '@loopback/authorization';

@authorize({ allowedRoles: [FixedUserRoles.SUPER_ADMIN, FixedUserRoles.ADMIN] })
@authenticate(Authentication.STRATEGY_JWT)
@api({ basePath: RestPaths.CHECKIN })
export class CheckInController {
  constructor(
    @inject('services.CheckInService')
    private checkInService: CheckInService,
    @inject('services.CheckOutService')
    private checkOutService: CheckOutService,
    @inject('services.FaceRecogService')
    private faceRecogService: FaceRecogService,
    @inject(RestBindings.Http.REQUEST)
    private request: Request,
    @inject(RestBindings.Http.RESPONSE)
    private response: Response,
  ) {}

  @post('encode-img', {
    responses: {
      '200': {
        description:
          'User send face image and receive face image with name tag for confirmation',
        content: { 'application/json': {} },
      },
    },
  })
  async encodeImage(): Promise<any | null> {
    const res = await this.faceRecogService.encodeImgs();
    return res;
  }

  @post('/', {
    responses: {
      '200': {
        description:
          'User send face image and receive face image with name tag for confirmation',
        content: { 'application/json': {} },
      },
    },
  })
  async checkIn(): Promise<any | null> {
    const files = await parseMultipartBody(this.request, this.response);

    if (!files) {
      throw getError({
        message: 'File is required',
        statusCode: 400,
      });
    }
    const imgData: File = files[0];

    return await this.checkInService.checkIn(imgData.buffer, this.request);
  }

  @patch('/out/{attendanceId}', {
    responses: {
      '200': {
        description: 'Check-out api',
        content: { 'application/json': {} },
      },
    },
  })
  async checkOut(
    @param.path.number('attendanceId') attendanceId: number,
  ): Promise<object> {
    return await this.checkOutService.checkOut(attendanceId);
  }
}
