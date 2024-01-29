import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import Strategy  from 'passport-42';
import { UserService } from 'src/user/user.service';

@Injectable()
export class FortyTwoStrategy extends PassportStrategy(Strategy, '42') {
  constructor(private readonly userService: UserService) {
    super({
        clientID: "u-s4t2ud-181408ee152be5ca32b6147060a92a4ae9f505b876842dd3e1f4228c1cd898a4",
        clientSecret: "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",
        callbackURL: 'http://localhost:8080/auth/42/callback',
        profileFields:
        {
            id: 'id',
            username: 'login',
            email: 'email',
            avatar: 'image_url',
        },
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: any): Promise<any> {
    // const { login,displayname } = profile;
    // console.log(profile);
    // Your logic to find or create a user
    // const user = {
    //   fortytwoId: id,
    //   // Add any other relevant user properties from the profile
    // };
    const user = await this.userService.findOrCreateFortyTwoUser(profile);
    return done(null, user);
  }
}
