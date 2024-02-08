import { Module } from '@nestjs/common';
import { FriendshipService } from './friendship.service';
import { FriendshipController } from './friendship.controller';

@Module({
    imports: [],
    controllers: [FriendshipController],
    providers: [FriendshipService],
})
export class FriendshipModule {}
