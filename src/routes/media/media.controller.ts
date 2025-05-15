import { Body, Controller, MaxFileSizeValidator, Post, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ZodSerializerDto } from 'nestjs-zod';

import { ImageFileTypeValidator } from 'src/routes/media/image-file-type.validator';
import { PresignedUploadFileBodyDTO, PresignedUploadFileResDTO, UploadFilesResDTO } from 'src/routes/media/media.dto';
import { MediaService } from 'src/routes/media/media.service';
import { ParseFilePipeWithUnlink } from 'src/routes/media/parse-file-unlink.pipe';

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('images/upload')
  @ApiBearerAuth()
  @ZodSerializerDto(UploadFilesResDTO)
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

  @Post('images/upload/presigned-url')
  @ApiBearerAuth()
  @ZodSerializerDto(PresignedUploadFileResDTO)
  createPresignedUrl(@Body() body: PresignedUploadFileBodyDTO) {
    return this.mediaService.createPresignedUrl(body);
  }
}
