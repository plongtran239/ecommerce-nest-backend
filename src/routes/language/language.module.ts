import { Module } from '@nestjs/common';

import { LanguageController } from 'src/routes/language/language.controller';
import { LanguageRepository } from 'src/routes/language/language.repository';
import { LanguageService } from 'src/routes/language/language.service';

@Module({
  controllers: [LanguageController],
  providers: [LanguageService, LanguageRepository],
})
export class LanguageModule {}
