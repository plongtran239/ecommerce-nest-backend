import {
  Controller,
  Get,
  MaxFileSizeValidator,
  NotFoundException,
  Param,
  Post,
  Res,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import path from 'path';

import { ImageFileTypeValidator } from 'src/routes/media/image-file-type.validator';
import { MediaService } from 'src/routes/media/media.server';
import { ParseFilePipeWithUnlink } from 'src/routes/media/parse-file-unlink.pipe';
import { UPLOAD_DIR } from 'src/shared/constants/other.constant';
import { IsPublic } from 'src/shared/decorators/auth.decorator';

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('images/upload')
  @ApiBearerAuth()
  @UseInterceptors(
    FilesInterceptor('files', 100, {
      limits: {
        fileSize: 1024 * 1024 * 5, // 5MB
      },
    }),
  )
  uploadFile(
    @UploadedFiles(
      new ParseFilePipeWithUnlink({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }), // 5MB
          new ImageFileTypeValidator(),
        ],
      }),
    )
    files: Array<Express.Multer.File>,
  ) {
    return this.mediaService.uploadFile(files);
  }

  @Get('static/:filename')
  @IsPublic()
  serveFile(@Param('filename') filename: string, @Res() res: Response) {
    return res.sendFile(path.resolve(UPLOAD_DIR, filename), (err) => {
      if (err) {
        const notFound = new NotFoundException('File not found');
        res.status(notFound.getStatus()).json(notFound.getResponse());
      }
    });
  }
}
