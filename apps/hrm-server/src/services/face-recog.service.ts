import { execSync, spawnSync } from 'child_process';
import { getError } from '@lb/infra';
import { Getter, inject } from '@loopback/core';
import { MetaLinkService } from './meta-link.service';
import fs from 'fs';
import { RedisHelper } from '@helpers';
import { ImgObject } from 'models/request/meta-link.model';
import { parsePythonArrayString } from 'utils/parse.utility';
import { FileNames, PYTHON_CMD } from '@mt-hrm/common';
import { SecurityBindings, UserProfile } from '@loopback/security';
import * as faceapi from '@vladmandic/face-api';
import { canvas, faceDetectionOptions } from '@mt-hrm/common';

export class FaceRecogService {
  constructor(
    @inject('services.MetaLinkService')
    private metaLinkService: MetaLinkService,
    @inject('helpers.RedisHelper')
    private redisService: RedisHelper,
    @inject.getter(SecurityBindings.USER, { optional: true })
    private getCurrentUser: Getter<UserProfile>,
  ) {}

  manipulateFiles(arrayData: ImgObject[], filePath: string, type: string) {
    switch (type) {
      case 'save':
        arrayData.forEach(obj => {
          const { id, imgBuffer } = obj;

          const fileName = `${filePath}/${id}.jpg`;

          try {
            fs.writeFileSync(fileName, imgBuffer);
          } catch (err) {
            getError({
              statusCode: 500,
              message: `Failed to save file for ${fileName}.jpg. Err: ${err}`,
            });
          }
        });
        break;
      case 'delete':
        arrayData.forEach(obj => {
          const { id } = obj;
          const fileName = `${filePath}/${id}.jpg`;

          try {
            fs.unlinkSync(fileName);
          } catch (err) {
            getError({
              statusCode: 500,
              message: `Failed to remove file for ${fileName}.jpg: Err: ${err}`,
            });
          }
        });
        break;
      default:
        getError({
          statusCode: 500,
          message: 'Choose the correct type for manipulate',
        });
        break;
    }
  }

  async encodeImgs() {
    const pythonScript = PYTHON_CMD.EXECUTION;
    const pythonPath = process.env.PYTHON_SCRIPT_PATH + FileNames.ENCODE;
    const arrayData = await this.metaLinkService.parseAllMetaLink();

    if (arrayData.length === 0)
      return getError({ statusCode: 400, message: 'Empty user data.' });
    try {
      const imageFolderPath = process.env.IMG_FOLDER_PATH ?? '';

      this.manipulateFiles(arrayData, imageFolderPath, 'save');

      const output = execSync(
        `${pythonScript} ${pythonPath} '${imageFolderPath}'`,
      );

      this.manipulateFiles(arrayData, imageFolderPath, 'delete');
      const parseData = parsePythonArrayString(output.toString());

      parseData.forEach(async (value: any) => {
        await this.redisService.set({
          key: `faceUser-${value.id}`,
          value: value.encoded,
        });
      });
      return { message: 'Encode success', statusCode: 200 };
    } catch (error) {
      throw getError({ statusCode: 400, message: error });
    }
  }

  async runFaceRecogScript(imageBuffer: Buffer): Promise<number> {
    const arrayOfKeys = await this.redisService.keys({ key: 'faceUser-*' });
    const data = await this.redisService.mget(arrayOfKeys);
    const uidEncodedFacePairs = data.map((value, index) => ({
      id: arrayOfKeys[index].substring(arrayOfKeys[index].indexOf('-') + 1),
      encoded: value ? JSON.parse(value) : null,
    }));

    const jsonData = JSON.stringify(uidEncodedFacePairs);

    const pythonPath = process.env.PYTHON_SCRIPT_PATH + FileNames.FACE_RECOG;
    const pythonCmd = PYTHON_CMD.EXECUTION;
    try {
      const { stdout } = spawnSync(pythonCmd, [pythonPath, jsonData], {
        input: imageBuffer,
      });

      const uidRecog = Number(stdout.toString());

      return uidRecog;
    } catch (error) {
      throw getError({ statusCode: 400, message: error });
    }
  }

  async compareFaces(compareImageBuffer: Buffer): Promise<boolean> {
    const currentUserImg = await this.metaLinkService.getUserImg(
      (
        await this.getCurrentUser()
      ).userId,
    );

    if (!compareImageBuffer) {
      throw getError({ message: 'Missing image input.', statusCode: 400 });
    }
    if (!currentUserImg) {
      throw getError({
        message: 'This current user missing image.',
        statusCode: 400,
      });
    }

    const { imgBuffer: refImageBuffer } = currentUserImg;

    const refImage = await canvas.loadImage(refImageBuffer);
    const compareImage = await canvas.loadImage(compareImageBuffer);

    const refImageDetection = await faceapi
      .detectSingleFace(refImage, faceDetectionOptions)
      .withFaceLandmarks()
      .withFaceDescriptor();
    const compareImageDetection = await faceapi
      .detectSingleFace(compareImage, faceDetectionOptions)
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!refImageDetection || !compareImageDetection) {
      return false;
    }
    const isMatch = faceapi.euclideanDistance(
      refImageDetection.descriptor,
      compareImageDetection.descriptor,
    );

    return isMatch < 0.4;
  }
}
