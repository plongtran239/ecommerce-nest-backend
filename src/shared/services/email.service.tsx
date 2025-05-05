import { Injectable } from '@nestjs/common';
import OTPEmail from 'emails/otp';

import { createElement } from 'react';
import { Resend } from 'resend';
import envConfig from 'src/shared/config';

@Injectable()
export class EmailService {
  private resend: Resend;

  constructor() {
    this.resend = new Resend(envConfig.RESEND_API_KEY);
  }

  async sendOTP(payload: { email: string; code: string }) {
    const { code, email } = payload;

    const subject = 'OTP Verification Code';

    return await this.resend.emails.send({
      from: `${envConfig.APP_NAME} <no-reply@${envConfig.DOMAIN_NAME}>`, //default <onboarding@resend.dev>
      to: [email],
      subject,
      react: createElement(OTPEmail, { otpCode: code, title: subject }),
    });
  }
}
