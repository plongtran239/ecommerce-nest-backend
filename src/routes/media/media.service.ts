import { Injectable } from '@nestjs/common';
import { unlink } from 'fs/promises';

import { PresignedUploadFileBodyType } from 'src/routes/media/media.model';
import { generateRandomFileName } from 'src/shared/helpers';
import { S3Service } from 'src/shared/services/s3.service';

@Injectable()
export class MediaService {
  constructor(private readonly s3Service: S3Service) {}

  async uploadFile(files: Array<Express.Multer.File>) {
    const result = await Promise.all(
      files.map((file) => {
        return this.s3Service
          .uploadFile({
            filename: 'images/' + file.filename,
            filepath: file.path,
            contentType: file.mimetype,
          })
          .then((res) => {
            return { url: res?.Location };
          });
      }),
    );

    await Promise.all(
      files.map((file) => {
        return unlink(file.path);
      }),
    );
    return {
      data: result,
    };
  }

  async createPresignedUrl({ filename }: PresignedUploadFileBodyType) {
    const randomFilename = generateRandomFileName(filename);
    const presignedUrl = await this.s3Service.createPresignedUrlWithClient(randomFilename);
    const url = presignedUrl.split('?')[0];

    return {
      presignedUrl,
      url,
    };
  }
}
