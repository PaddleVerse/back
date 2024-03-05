import { Injectable } from '@nestjs/common';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';

@Injectable()
export class TwoFactorService {

  async generateSecret() : Promise<any>
  {
    const secret = await speakeasy.generateSecret({
      name: 'tchipa',
      length: 64,
      symbols: true,
      qr_codes: true
    });

    return {
      secret: secret.base32,
      url: secret.otpauth_url
    }
  }

  async generateQRCode(url: string) : Promise<string>
  {
    return qrcode.toDataURL(url);
  }

  async verifyToken(secret: string, token: string) : Promise<boolean>
  {
    return speakeasy.totp.verify({ secret, encoding: 'base32', token });
  }
}
