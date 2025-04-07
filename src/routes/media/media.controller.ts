import {
  Controller,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  NotFoundException,
  Param,
  ParseFilePipe,
  Post,
  Res,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import path from 'path';

import envConfig from 'src/shared/config';
import { UPLOAD_DIR } from 'src/shared/constants/other.constant';
import { IsPublic } from 'src/shared/decorators/auth.decorator';

@Controller('media')
export class MediaController {
  @Post('images/upload')
  @UseInterceptors(
    FilesInterceptor('files', 100, {
      limits: {
        fileSize: 1024 * 1024 * 5, // 5MB
      },
    }),
  )
  uploadFile(
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }), // 5MB
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/ }),
        ],
      }),
    )
    files: Array<Express.Multer.File>,
  ) {
    return {
      files: files.map((file) => ({
        filename: file.filename,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        url: `${envConfig.PREFIX_STATIC_ENDPOINT}/${file.filename}`,
      })),
    };
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
