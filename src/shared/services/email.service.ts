import { Injectable } from '@nestjs/common';

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

    return await this.resend.emails.send({
      from: 'EcommerceNestJS <onboarding@resend.dev>',
      to: [envConfig.RESEND_EMAIL], // chỉ gửi được đến email đăng ký trên resend
      subject: 'OTP Verification Code',
      html: `<strong>${code}</strong>`,
    });
  }
}
