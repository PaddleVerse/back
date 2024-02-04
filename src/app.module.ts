import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserService } from './user/user.service';
import { UserController } from './user/user.controller';
import { UserModule } from './user/user.module';
import { ChatGateway } from './chat/chat.gateway';

@Module({
  imports: [AuthModule, UserModule],
  controllers: [AppController],
  providers: [AppService, ChatGateway],
})
export class AppModule {}
