import envConfig from 'src/shared/config';
import { RoleName } from 'src/shared/constants/role.constant';
import { HashingService } from 'src/shared/services/hashing.service';
import { PrismaService } from 'src/shared/services/prisma.service';

const prismaService = new PrismaService();
const hashingService = new HashingService();

const main = async () => {
  const roleCount = await prismaService.role.count();

  if (roleCount > 0) {
    throw new Error('Roles already exist');
  }

  const roles = await prismaService.role.createMany({
    data: [
      {
        name: RoleName.Admin,
        description: 'Role for Admin',
      },
      {
        name: RoleName.Client,
        description: 'Role for Client',
      },
      {
        name: RoleName.Seller,
        description: 'Role for Seller',
      },
    ],
  });

  const adminRole = await prismaService.role.findUniqueOrThrow({
    where: {
      name: RoleName.Admin,
    },
  });

  const hashedPassword = await hashingService.hash(envConfig.ADMIN_PASSWORD);

  const adminUser = await prismaService.user.create({
    data: {
      email: envConfig.ADMIN_EMAIL,
      name: envConfig.ADMIN_NAME,
      password: hashedPassword,
      phoneNumber: envConfig.ADMIN_PHONE_NUMBER,
      roleId: adminRole.id,
    },
  });

  return {
    createdRolesCount: roles.count,
    adminUser,
  };
};

main()
  .then(({ adminUser, createdRolesCount }) => {
    console.log(`Created ${createdRolesCount} roles`);
    console.log(`Created admin user: ${adminUser.email}`);
  })
  .catch((error) => {
    console.error(error);
  });
