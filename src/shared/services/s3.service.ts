import { PutObjectCommand, S3 } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { readFileSync } from 'fs';
import mime from 'mime-types';

import envConfig from 'src/shared/config';

@Injectable()
export class S3Service implements OnModuleInit {
  private readonly s3: S3;
  private readonly bucketName = envConfig.S3_BUCKET_NAME;

  constructor() {
    this.s3 = new S3({
      forcePathStyle: false,
      region: envConfig.S3_REGION,
      endpoint: envConfig.S3_ENDPOINT,
      credentials: {
        accessKeyId: envConfig.S3_ACCESS_KEY,
        secretAccessKey: envConfig.S3_SECRET_KEY,
      },
    });
  }

  async onModuleInit() {
    await this.checkConnection();
  }

  private async checkConnection(): Promise<boolean> {
    try {
      await this.s3.headBucket({ Bucket: this.bucketName });
      console.log('✅ Connected to DigitalOcean Spaces!');
      return true;
    } catch (error) {
      console.error('❌ Failed to connect to Spaces:', error.message);
      return false;
    }
  }

  async uploadFile({ filename, filepath, contentType }: { filename: string; filepath: string; contentType: string }) {
    try {
      const parallelUploads3 = new Upload({
        client: this.s3,
        params: {
          Bucket: this.bucketName,
          Key: filename,
          Body: readFileSync(filepath),
          ContentType: contentType,
        },
        tags: [],
        queueSize: 4,
        partSize: 1024 * 1024 * 5,
        leavePartsOnError: false,
      });

      parallelUploads3.on('httpUploadProgress', (progress) => {
        console.log(progress);
      });

      return parallelUploads3.done();
    } catch (e) {
      console.log(e);
    }
  }

  async createPresignedUrlWithClient(filename: string) {
    const contentType = mime.lookup(filename) || 'application/octet-stream';
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: filename,
      ContentType: contentType,
    });
    return getSignedUrl(this.s3, command, { expiresIn: 10 });
  }
}
