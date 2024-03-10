import { Module } from '@nestjs/common';
import { GatewaysService } from './gateways.service';
import { GatewaysGateway } from './gateways.gateway';
import { UserModule } from 'src/user/user.module';
import { FriendshipModule } from 'src/friendship/friendship.module';
import { ConversationsModule } from 'src/conversations/conversations.module';
import { ConversationsService } from 'src/conversations/conversations.service';

@Module({
  providers: [GatewaysService, GatewaysGateway, ConversationsService],
  imports: [UserModule, FriendshipModule, ConversationsModule],
})
export class GatewaysModule {}
