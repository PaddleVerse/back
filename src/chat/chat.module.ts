import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { UserService } from 'src/user/user.service';
import { UserModule } from 'src/user/user.module';
import { FriendshipService } from 'src/friendship/friendship.service';
import { FriendshipModule } from 'src/friendship/friendship.module';
import { ParticipantsModule } from './participants/participants.module';
import { MessageModule } from './message/message.module';
import { ChannelController } from './channel/channel.controller';
import { BanModule } from './ban/ban.module';

@Module({
  providers: [ChatService, UserService, FriendshipService],
  controllers: [ChatController, ChannelController],
  imports: [UserModule, FriendshipModule, ParticipantsModule, MessageModule, BanModule],
})
export class ChatModule {}
