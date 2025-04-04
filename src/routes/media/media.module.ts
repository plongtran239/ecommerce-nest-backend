import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import multer from 'multer';
import path from 'path';

import { MediaController } from 'src/routes/media/media.controller';
import { generateRandomFileName } from 'src/shared/helpers';

const UPLOAD_DIR = path.resolve('upload');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    const newFileName = generateRandomFileName(file.originalname);
    cb(null, newFileName);
  },
});

@Module({
  controllers: [MediaController],
  imports: [
    MulterModule.register({
      storage,
    }),
  ],
})
export class MediaModule {}
