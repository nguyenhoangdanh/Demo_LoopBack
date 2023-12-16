import { BucketStream, Client } from 'minio';
import { minioClient } from '@helpers';
import { FileRequest } from '@mt-hrm/models/request';
import { ObjsInBucket } from '@mt-hrm/models/response/minio.model';

export class MinioService {
  client: Client;

  constructor() {
    this.client = minioClient;
  }

  async makeBucket(bucket: string) {
    await this.client.makeBucket(bucket, 'us-east-1');
  }

  async bucketExists(bucket: string) {
    return this.client.bucketExists(bucket);
  }

  async upload(uploadRQ: FileRequest) {
    let uploadRS;
    try {
      const { bucket, buffer, fileName } = uploadRQ;
      const bucketExists = await this.bucketExists(bucket);

      if (!bucketExists) {
        await this.makeBucket(bucket);
      }
      uploadRS = await this.client.putObject(bucket, fileName, buffer);
    } catch (e) {
      console.log(`[Upload] Error`, e);
    }
    return uploadRS;
  }

  getFile(
    bucket: string,
    name: string,
    callback: (error: Error | null, result: any) => void,
  ) {
    this.client.getObject(bucket, name, callback);
  }

  async remove(bucket: string, name: string) {
    await this.client.removeObject(bucket, name);
  }

  async getObject(bucket: string, object: string): Promise<Buffer> {
    const dataStream: BucketStream<Buffer> = await new Promise(
      (resolve, reject) => {
        minioClient.getObject(bucket, object, (err, stream) => {
          if (err) {
            reject(err);
          } else {
            resolve(stream);
          }
        });
      },
    );

    const dataChunks: Buffer[] = [];

    return new Promise((resolve, reject) => {
      dataStream.on('data', (chunk: Buffer) => {
        dataChunks.push(chunk);
      });

      dataStream.on('end', () => {
        const dataBuffer: Buffer = Buffer.concat(dataChunks);
        resolve(dataBuffer);
      });

      dataStream.on('error', err => {
        reject(err);
      });
    });
  }

  getAllObjsInBucket(bucket: string): Promise<Array<ObjsInBucket>> {
    var data: Array<ObjsInBucket> = [];
    var stream = minioClient.listObjects(bucket, '', true);
    return new Promise((resolve, reject) => {
      stream.on('data', function (obj: ObjsInBucket) {
        data.push(obj);
      });
      stream.on('end', function () {
        resolve(data);
      });
      stream.on('error', function (err) {
        reject(err);
      });
    });
  }
  async removeImgsInBucket(bucket: string, objNames: Array<string>) {
    this.client.removeObjects(bucket, objNames, function (e) {
      if (e) {
        throw e;
      }
    });
  }
}
