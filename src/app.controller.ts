import { Controller, Get } from '@nestjs/common';

import { IsPublic } from 'src/shared/decorators/auth.decorator';

@Controller()
@IsPublic()
export class AppController {
  @Get()
  getHello() {
    return {
      status: 'ok',
      message: 'Welcome to the API',
    };
  }
}
