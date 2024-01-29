import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { UserService } from 'src/user/user.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google')
{
  constructor(private readonly userService: UserService) {
    super({
        clientID: "267690897013-02sk5hg7ko3dtvcoubpj5dg3rd0mutlg.apps.googleusercontent.com",
        clientSecret: "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",
        callbackURL: 'http://localhost:8080/auth/google/callback',
        passReqToCallback: true,
        scope: ['profile', 'email'],
    });
  }

  async validate(request: any, accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any> {
    const user = await this.userService.findOrCreateGoogleUser(profile);
    // console.log(user);
    return done(null, user);
  }
}
