import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { UserService } from 'src/user/user.service';
import { UserModule } from 'src/user/user.module';
import { FriendshipService } from 'src/friendship/friendship.service';
import { FriendshipModule } from 'src/friendship/friendship.module';
import { ParticipantsModule } from './participants/participants.module';
import { MessageModule } from './message/message.module';
import { ChannelsController } from './channels/channels.controller';
import { BanModule } from './ban/ban.module';
import { ChannelsService } from './channels/channels.service';
import { ChannelsModule } from './channels/channels.module';

@Module({
  providers: [ChatService, UserService, FriendshipService, ChannelsService],
  controllers: [ChatController, ChannelsController],
  imports: [UserModule, FriendshipModule, ParticipantsModule, MessageModule, BanModule, ChannelsModule],
})
export class ChatModule {}
