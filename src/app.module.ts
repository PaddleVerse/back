import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserService } from './user/user.service';
import { UserController } from './user/user.controller';
import { UserModule } from './user/user.module';
import { FriendshipService } from './friendship/friendship.service';
import { FriendshipController } from './friendship/friendship.controller';
import { FriendshipModule } from './friendship/friendship.module';
import { ChatGateway } from './chat/chat.gateway';
import { ChatModule } from './chat/chat.module';
import { ChatService } from './chat/chat.service';

@Module({
  imports: [AuthModule, UserModule, FriendshipModule, ChatModule],
  controllers: [AppController, FriendshipController],
  providers: [AppService, FriendshipService, ChatGateway, ChatService],
})
export class AppModule {}
