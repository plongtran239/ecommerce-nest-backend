import { createKeyv } from '@keyv/redis';
import { BullModule } from '@nestjs/bullmq';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { Request, Response } from 'express';
import { AcceptLanguageResolver, I18nModule, QueryResolver } from 'nestjs-i18n';
import { LoggerModule } from 'nestjs-pino';
import { ZodSerializerInterceptor } from 'nestjs-zod';
import path from 'path';
import pino from 'pino';

import { RemoveRefreshTokenCronjob } from 'src/cronjobs/remove-refresh-token.cronjob';
import { PaymentConsumer } from 'src/queues/payment.consumer';
import { AuthModule } from 'src/routes/auth/auth.module';
import { BrandTranslationModule } from 'src/routes/brand/brand-translation/brand-translation.module';
import { BrandModule } from 'src/routes/brand/brand.module';
import { CartModule } from 'src/routes/cart/cart.module';
import { CategoryTranslationModule } from 'src/routes/category/category-translation/category-translation.module';
import { CategoryModule } from 'src/routes/category/category.module';
import { HealthModule } from 'src/routes/health/health.module';
import { LanguageModule } from 'src/routes/language/language.module';
import { MediaModule } from 'src/routes/media/media.module';
import { OrderModule } from 'src/routes/order/order.module';
import { PaymentModule } from 'src/routes/payment/payment.module';
import { PermissionModule } from 'src/routes/permission/permission.module';
import { ProductTranslationModule } from 'src/routes/product/product-translation/product-translation.module';
import { ProductModule } from 'src/routes/product/product.module';
import { ProfileModule } from 'src/routes/profile/profile.module';
import { ReviewModule } from 'src/routes/review/review.module';
import { RoleModule } from 'src/routes/role/role.module';
import { UserModule } from 'src/routes/user/user.module';
import envConfig from 'src/shared/config';
import { HttpExceptionFilter } from 'src/shared/filters/http-exception.filter';
import { ThrottlerBehindProxyGuard } from 'src/shared/guards/throttler-behind-proxy.guard';
import CustomZodValidationPipe from 'src/shared/pipes/zod-validation.pipe';
import { SharedModule } from 'src/shared/shared.module';
import { WebSocketModule } from 'src/websocket/websocket.module';

@Module({
  imports: [
    HealthModule,
    LoggerModule.forRoot({
      pinoHttp: {
        serializers: {
          req(req: Request) {
            return {
              method: req.method,
              url: req.url,
              query: req.query,
              params: req.params,
            };
          },
          res(res: Response) {
            return {
              statusCode: res.statusCode,
            };
          },
        },
        stream: pino.destination({
          dest: path.resolve('logs/app.log'),
          sync: false,
          mkdir: true,
        }),
      },
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: () => {
        return {
          stores: [createKeyv(envConfig.REDIS_URL)],
        };
      },
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          name: 'short',
          ttl: 60000, // 1 minute
          limit: 10,
        },
        {
          name: 'long',
          ttl: 60000 * 10, // 10 minutes
          limit: 100,
        },
      ],
    }),
    BullModule.forRoot({
      connection: {
        url: envConfig.REDIS_URL,
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
    ScheduleModule.forRoot(),
    PrometheusModule.register(),
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
    ReviewModule,
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
    {
      provide: APP_GUARD,
      useClass: ThrottlerBehindProxyGuard,
    },
    PaymentConsumer,
    RemoveRefreshTokenCronjob,
  ],
})
export class AppModule {}
