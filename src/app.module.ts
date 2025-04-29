import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { AcceptLanguageResolver, I18nModule, QueryResolver } from 'nestjs-i18n';
import { ZodSerializerInterceptor } from 'nestjs-zod';
import path from 'path';

import { PaymentConsumer } from 'src/queues/payment.consumer';
import { AuthModule } from 'src/routes/auth/auth.module';
import { BrandTranslationModule } from 'src/routes/brand/brand-translation/brand-translation.module';
import { BrandModule } from 'src/routes/brand/brand.module';
import { CartModule } from 'src/routes/cart/cart.module';
import { CategoryTranslationModule } from 'src/routes/category/category-translation/category-translation.module';
import { CategoryModule } from 'src/routes/category/category.module';
import { LanguageModule } from 'src/routes/language/language.module';
import { MediaModule } from 'src/routes/media/media.module';
import { OrderModule } from 'src/routes/order/order.module';
import { PaymentModule } from 'src/routes/payment/payment.module';
import { PermissionModule } from 'src/routes/permission/permission.module';
import { ProductTranslationModule } from 'src/routes/product/product-translation/product-translation.module';
import { ProductModule } from 'src/routes/product/product.module';
import { ProfileModule } from 'src/routes/profile/profile.module';
import { RoleModule } from 'src/routes/role/role.module';
import { UserModule } from 'src/routes/user/user.module';
import envConfig from 'src/shared/config';
import { HttpExceptionFilter } from 'src/shared/filters/http-exception.filter';
import CustomZodValidationPipe from 'src/shared/pipes/zod-validation.pipe';
import { SharedModule } from 'src/shared/shared.module';
import { WebSocketModule } from 'src/websocket/websocket.module';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        username: envConfig.REDIS_USERNAME,
        password: envConfig.REDIS_PASSWORD,
        host: envConfig.REDIS_HOST,
        port: Number(envConfig.REDIS_PORT),
      },
    }),
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: path.resolve('src/i18n/'),
        watch: true,
      },
      resolvers: [{ use: QueryResolver, options: ['lang'] }, AcceptLanguageResolver],
      typesOutputPath: path.resolve('src/generated/i18n.generated.ts'),
    }),
    SharedModule,
    AuthModule,
    LanguageModule,
    PermissionModule,
    RoleModule,
    ProfileModule,
    UserModule,
    MediaModule,
    BrandModule,
    BrandTranslationModule,
    CategoryModule,
    CategoryTranslationModule,
    ProductModule,
    ProductTranslationModule,
    CartModule,
    OrderModule,
    PaymentModule,
    WebSocketModule,
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
    PaymentConsumer,
  ],
})
export class AppModule {}
