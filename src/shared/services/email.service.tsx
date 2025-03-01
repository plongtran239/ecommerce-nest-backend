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
    const { code } = payload;

    const subject = 'OTP Verification Code';

    return await this.resend.emails.send({
      from: 'EcommerceNestJS <onboarding@resend.dev>',
      to: [envConfig.RESEND_EMAIL], // chỉ gửi được đến email đăng ký trên resend
      subject,
      react: createElement(OTPEmail, { otpCode: code, title: subject }),
    });
  }
}
