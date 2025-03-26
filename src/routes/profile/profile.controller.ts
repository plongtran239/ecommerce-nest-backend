import { Body, Controller, Get, Put } from '@nestjs/common';
import { ZodSerializerDto } from 'nestjs-zod';

import { ChangePasswordBodyDTO, UpdateUserProfileBodyDTO } from 'src/routes/profile/profile.dto';
import { ProfileService } from 'src/routes/profile/profile.service';
import { User } from 'src/shared/decorators/user.decorator';
import { MessageResDTO } from 'src/shared/dtos/response.dto';
import { GetUserProfileResDTO, UpdateUserProfileResDTO } from 'src/shared/dtos/shared-user.dto';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  @ZodSerializerDto(GetUserProfileResDTO)
  get(@User('userId') userId: number) {
    return this.profileService.get(userId);
  }

  @Put()
  @ZodSerializerDto(UpdateUserProfileResDTO)
  update(@User('userId') userId: number, @Body() body: UpdateUserProfileBodyDTO) {
    return this.profileService.update({
      userId,
      data: body,
    });
  }

  @Put('change-password')
  @ZodSerializerDto(MessageResDTO)
  changePassword(@User('userId') userId: number, @Body() body: ChangePasswordBodyDTO) {
    return this.profileService.changePassword({
      userId,
      data: body,
    });
  }
}
