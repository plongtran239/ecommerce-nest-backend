import { Module } from '@nestjs/common';

import { UserController } from 'src/routes/user/user.controller';
import { UserRepository } from 'src/routes/user/user.repository';
import { UserService } from 'src/routes/user/user.service';

@Module({
  controllers: [UserController],
  providers: [UserService, UserRepository],
})
export class UserModule {}
