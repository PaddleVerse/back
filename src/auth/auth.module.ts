import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategys/local.strategy';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategys/jwt.strategy';
import { GoogleStrategy } from './strategys/google.strategy';
import { FortyTwoStrategy } from './strategys/42.strategy';


@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    UserModule, 
    JwtModule.register({ secret: process.env.SECRET, signOptions: { expiresIn: '60s' }})
  ],
  providers: [LocalStrategy, AuthService, JwtStrategy, GoogleStrategy, FortyTwoStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
