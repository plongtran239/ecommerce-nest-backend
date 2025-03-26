import { Module } from '@nestjs/common';

import { ProfileController } from 'src/routes/profile/profile.controller';
import { ProfileService } from 'src/routes/profile/profile.service';

@Module({
  controllers: [ProfileController],
  providers: [ProfileService],
})
export class ProfileModule {}
