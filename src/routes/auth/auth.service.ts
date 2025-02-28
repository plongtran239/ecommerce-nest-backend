import { ConflictException, Injectable } from '@nestjs/common';
import { RegisterBodyType } from 'src/routes/auth/auth.model';
import { AuthRepository } from 'src/routes/auth/auth.repository';
import { RoleService } from 'src/routes/auth/role.service';
import { isPrismaUniqueConstrantError } from 'src/shared/helpers';
import { HashingService } from 'src/shared/services/hashing.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly hashingService: HashingService,
    private readonly roleService: RoleService,
    private readonly authRepository: AuthRepository,
  ) {}

  async register(body: RegisterBodyType) {
    try {
      const { email, password, name, phoneNumber } = body;

      const clientRoleId = await this.roleService.getClientRoleId();

      const hashedPassword = await this.hashingService.hash(password);

      return await this.authRepository.createUser({
        email,
        password: hashedPassword,
        name,
        phoneNumber,
        roleId: clientRoleId,
      });
    } catch (error) {
      if (isPrismaUniqueConstrantError(error)) {
        throw new ConflictException('Email already exists');
      }
      throw error;
    }
  }
}
