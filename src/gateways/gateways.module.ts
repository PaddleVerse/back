import { Module } from '@nestjs/common';
import { GatewaysService } from './gateways.service';
import { GatewaysGateway } from './gateways.gateway';
import { UserModule } from 'src/user/user.module';
import { FriendshipModule } from 'src/friendship/friendship.module';

@Module({
  providers: [GatewaysService, GatewaysGateway],
  imports: [UserModule, FriendshipModule],
})
export class GatewaysModule {}
