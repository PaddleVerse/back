import { Injectable } from '@nestjs/common';
import * as speakeasy from 'speakeasy';
import { qrcode } from 'qrcode';

@Injectable()
export class TwoFactorService {
  async generateSecret(): Promise<{ secret: string; otpauthUrl: string }> {
    const secret = speakeasy.generateSecret();
    const otpauthUrl = speakeasy.otpauth({
      secret: secret.base32,
      label: 'YourAppName',
      issuer: 'YourCompany',
    });
    return { secret, otpauthUrl };
  }

  async validateToken(token: string, secret: string): Promise<boolean> {
    return speakeasy.verify({
      secret,
      token,
      encoding: 'base32',
      window: 1, // Allow a 1-minute window for token validity
    });
  }

  async generateQrCode(otpauthUrl: string): Promise<string> {
    return await qrcode(otpauthUrl);
  }
}
