import { FileValidator } from '@nestjs/common';

export class ImageFileTypeValidator extends FileValidator<Record<string, any>> {
  constructor() {
    super({});
  }

  isValid(file: Express.Multer.File): boolean {
    const allowedMimeTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    return allowedMimeTypes.includes(file.mimetype);
  }

  buildErrorMessage(): string {
    return 'File type is not supported. Allowed types: image/png, image/jpeg, image/jpg, image/webp';
  }
}
