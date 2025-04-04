import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ZodSerializerInterceptor } from 'nestjs-zod';

import { AuthModule } from 'src/routes/auth/auth.module';
import { LanguageModule } from 'src/routes/language/language.module';
import { MediaModule } from 'src/routes/media/media.module';
import { PermissionModule } from 'src/routes/permission/permission.module';
import { ProfileModule } from 'src/routes/profile/profile.module';
import { RoleModule } from 'src/routes/role/role.module';
import { UserModule } from 'src/routes/user/user.module';
import { HttpExceptionFilter } from 'src/shared/filters/http-exception.filter';
import CustomZodValidationPipe from 'src/shared/pipes/zod-validation.pipe';
import { SharedModule } from 'src/shared/shared.module';

@Module({
  imports: [
    SharedModule,
    AuthModule,
    LanguageModule,
    PermissionModule,
    RoleModule,
    ProfileModule,
    UserModule,
    MediaModule,
  ],
  providers: [
    {
      provide: APP_PIPE,
      useClass: CustomZodValidationPipe,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ZodSerializerInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
