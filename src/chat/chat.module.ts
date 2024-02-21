import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { UserService } from 'src/user/user.service';
import { UserModule } from 'src/user/user.module';
import { FriendshipService } from 'src/friendship/friendship.service';
import { FriendshipModule } from 'src/friendship/friendship.module';

@Module({
  providers: [ChatService, UserService, FriendshipService],
  controllers: [ChatController],
  imports: [UserModule, FriendshipModule],
})
export class ChatModule {}
