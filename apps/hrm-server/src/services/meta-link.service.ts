import { minioClient } from '@helpers';
import { inject } from '@loopback/core';
import { Client, UploadedObjectInfo } from 'minio';
import { UserIdentifierRepository, UserProfileRepository } from 'repositories';
import { FileRequest, ImgObject } from '../models/request/meta-link.model';
import { MinioService } from './minio.service';
import { UserProfile } from '@mt-hrm/models';
import { getError } from '@lb/infra';
import { randomUUID } from 'crypto';
import { MigrationUser } from '@mt-hrm/common';

export class MetaLinkService {
  client: Client;

  constructor(
    @inject('services.MinioService') private minioService: MinioService,
    @inject('repositories.UserProfileRepository')
    private userProfileRepository: UserProfileRepository,
    @inject('repositories.UserIdentifierRepository')
    private userIdentifierRepository: UserIdentifierRepository,
  ) {
    this.client = minioClient;
  }

  createUniqueFileName(fileName: string): string {
    const indexOfDot = fileName.lastIndexOf('.');
    const name = fileName.slice(0, indexOfDot);
    const extension = fileName.slice(indexOfDot + 1);

    return `${name}-${randomUUID()}.${extension}`;
  }

  getFileDestination(bucket: string, fileName: string): string {
    return `${bucket}/${fileName}`;
  }

  async createMetaLink(reqData: FileRequest): Promise<string | null> {
    const { bucket, fileName } = reqData;

    reqData.fileName = this.createUniqueFileName(fileName);

    console.log('bucket', reqData.bucket)

    let uploadFileRequest: UploadedObjectInfo | undefined;
    try {
      uploadFileRequest = await this.minioService.upload(reqData);
    } catch (e) {
      throw getError({ statusCode: 400, message: `[Upload] Error ${e}` });
    } finally {
      if (uploadFileRequest) {
        return this.getFileDestination(bucket, reqData.fileName);
      }
      return null;
    }
  }


  async updateMetaLink(reqData: FileRequest): Promise<string | null> {
    const {bucket, fileName} = reqData;

    reqData.fileName = this.createUniqueFileName(fileName);

    let uploadFileRequest: UploadedObjectInfo | undefined;
    try {
      uploadFileRequest = await this.minioService.upload(reqData);
    } catch (e) {
      throw getError({statusCode: 400, message: `[Upload] Error ${e}`});
    } finally {
      if (uploadFileRequest) {
        return this.getFileDestination(bucket, reqData.fileName);
      }
      return null;
    }
  }


  async getAllUsersMetaLink(): Promise<UserProfile[]> {
    // Get all user from migration
    const excludeUsers = await this.userIdentifierRepository.find({
      fields: { userId: true },
      where: {
        identifier: {
          inq: MigrationUser.MigrationList,
        },
      },
    });
    const excludeUserIds = excludeUsers.map(user => user.userId);

    return await this.userProfileRepository.find({
      fields: { userId: true, faceImgUrl: true },
      where: {
        userId: {
          nin: excludeUserIds,
        },
      },
    });
  }

  async parseAllMetaLink(): Promise<ImgObject[]> {
    let resData: ImgObject[] = [];
    // Get user list from postgres
    const userData = await this.getAllUsersMetaLink();
    for (let user of userData) {
      if (user.faceImgUrl === '') continue;
      const [bucket, imgName] = user.faceImgUrl!.split('/');

      try {
        const imgBuffer: Buffer = await this.minioService.getObject(
          bucket,
          imgName,
        );
        resData.push({ id: user.userId!, imgBuffer });
      } catch (err) {
        throw err;
      }
    }

    return resData;
  }

  async getUserImg(currentUserId: string): Promise<ImgObject | undefined> {
    const user = await this.userProfileRepository.findById(currentUserId);

    if (user.faceImgUrl === '') return;
    const [bucket, imgName] = user.faceImgUrl!.split('/');

    try {
      const imgBuffer: Buffer = await this.minioService.getObject(
        bucket,
        imgName,
      );
      return { id: user.userId!, imgBuffer };
    } catch (err) {
      throw err;
    }
  }
}
