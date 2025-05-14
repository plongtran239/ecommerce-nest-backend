import { S3 } from '@aws-sdk/client-s3';
import { Injectable, OnModuleInit } from '@nestjs/common';

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

  async checkConnection(): Promise<boolean> {
    try {
      const res = await this.s3.listBuckets({});
      console.log(res);

      await this.s3.headBucket({ Bucket: this.bucketName });
      console.log('✅ Connected to DigitalOcean Spaces!');
      return true;
    } catch (error) {
      console.error('❌ Failed to connect to Spaces:', error.message);
      return false;
    }
  }
}
