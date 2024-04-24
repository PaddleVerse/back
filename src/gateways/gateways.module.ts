import { Module } from '@nestjs/common';
import { GatewaysService } from './gateways.service';
import { GatewaysGateway } from './gateways.gateway';
import { UserModule } from 'src/user/user.module';
import { FriendshipModule } from 'src/friendship/friendship.module';
import { ConversationsModule } from 'src/conversations/conversations.module';
import { ConversationsService } from 'src/conversations/conversations.service';
import { NotificationsService } from 'src/notifications/notifications.service';
import { NotificationsModule } from 'src/notifications/notifications.module';
import GameGateway  from './game.gateway';
@Module({
  providers: [GatewaysService, GatewaysGateway, ConversationsService, NotificationsService, GameGateway],
  imports: [UserModule, FriendshipModule, ConversationsModule, NotificationsModule],
})
export class GatewaysModule {}
