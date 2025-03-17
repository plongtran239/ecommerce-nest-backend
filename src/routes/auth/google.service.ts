import { Injectable } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';
import { v4 as uuidv4 } from 'uuid';

import { GoogleUserInfoError } from 'src/routes/auth/auth.error';
import { GoogleAuthStateType } from 'src/routes/auth/auth.model';
import { AuthRepository } from 'src/routes/auth/auth.repository';
import { AuthService } from 'src/routes/auth/auth.service';
import { RoleService } from 'src/routes/role/role.service';
import envConfig from 'src/shared/config';
import { HashingService } from 'src/shared/services/hashing.service';

@Injectable()
export class GoogleService {
  private oath2Client: OAuth2Client;

  constructor(
    private readonly authRepository: AuthRepository,
    private readonly roleService: RoleService,
    private readonly hashingService: HashingService,
    private readonly authService: AuthService,
  ) {
    this.oath2Client = new google.auth.OAuth2({
      clientId: envConfig.GOOGLE_CLIENT_ID,
      clientSecret: envConfig.GOOGLE_CLIENT_SECRET,
      redirectUri: envConfig.GOOGLE_REDIRECT_URI,
    });
  }

  getAuthorizationURL({ userAgent, ip }: GoogleAuthStateType) {
    const scope = [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ];

    const stateString = Buffer.from(JSON.stringify({ userAgent, ip })).toString('base64');

    const url = this.oath2Client.generateAuthUrl({
      access_type: 'offline',
      scope,
      include_granted_scopes: true,
      state: stateString,
    });

    return { url };
  }

  async googleCallback({ state, code }: { state: string; code: string }) {
    try {
      let userAgent = 'unknown';
      let ip = 'unknown';

      if (state) {
        const clientInfo = JSON.parse(Buffer.from(state, 'base64').toString()) as GoogleAuthStateType;
        userAgent = clientInfo.userAgent;
        ip = clientInfo.ip;
      }

      const { tokens } = await this.oath2Client.getToken(code);

      this.oath2Client.setCredentials(tokens);

      const oauth2 = google.oauth2({
        auth: this.oath2Client,
        version: 'v2',
      });

      const { data } = await oauth2.userinfo.get();

      if (!data.email) {
        throw GoogleUserInfoError;
      }

      let user = await this.authRepository.findUniqueUserIncludeRole({ email: data.email });

      if (!user) {
        const clientRoleId = await this.roleService.getClientRoleId();

        const randomPassword = uuidv4();

        const hashedPassword = await this.hashingService.hash(randomPassword);

        user = await this.authRepository.createUserIncludeRole({
          email: data.email,
          name: data.name ?? '',
          password: hashedPassword,
          roleId: clientRoleId,
          phoneNumber: '',
        });
      }

      const device = await this.authRepository.createDevice({
        userId: user.id,
        userAgent,
        ip,
      });

      const authTokens = await this.authService.generateTokens({
        userId: user.id,
        deviceId: device.id,
        roleId: user.role.id,
        roleName: user.role.name,
      });

      return authTokens;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
