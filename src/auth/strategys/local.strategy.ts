import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { UserService } from 'src/user/user.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(
    private authService: AuthService,
    private readonly userService: UserService,
  ) {
    super();
  }

  async validate(username: string, password: string): Promise<any> {
    const existingUser = await this.userService.findOne(username);
    if (!existingUser) throw new UnauthorizedException('Invalid credentials');

    const isPasswordValid = await this.authService.validatePassword(
      password,
      existingUser.password,
    );

    if (!isPasswordValid) throw new UnauthorizedException('Invalid credentials');

    return existingUser;
  }
}
