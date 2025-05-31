import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import multer from 'multer';

import { MediaController } from 'src/routes/media/media.controller';
import { MediaService } from 'src/routes/media/media.service';
import { generateRandomFileName } from 'src/shared/helpers';

const storage = multer.diskStorage({
  filename: function (req, file, cb) {
    const newFileName = generateRandomFileName(file.originalname);
    cb(null, newFileName);
  },
});

@Module({
  providers: [MediaService],
  controllers: [MediaController],
  imports: [
    MulterModule.register({
      storage,
    }),
  ],
})
export class MediaModule {}
