import { Controller, Get, Param } from '@nestjs/common';
import { FriendshipService } from './friendship.service';

@Controller('friendship')
export class FriendshipController
{
    constructor(private readonly friendshipService: FriendshipService) {}

    @Get(':id')
    getFriends(@Param('id') id: number)
    {
        return this.friendshipService.getFriends(id);
    }

    @Get(':userId/:friendId')
    addFriend(@Param('userId') userId: number, @Param('friendId') friendId: number)
    {
        return this.friendshipService.addFriend(userId, friendId);
    }

    @Get(':userId/:friendId/accept')
    acceptFriend(@Param('userId') userId: number, @Param('friendId') friendId: number)
    {
        return this.friendshipService.acceptFriend(userId, friendId);
    }

    @Get(':userId/:friendId/reject')
    rejectFriend(@Param('userId') userId: number, @Param('friendId') friendId: number)
    {
        return this.friendshipService.rejectFriend(userId, friendId);
    }

    @Get(':userId/:friendId/remove')
    removeFriend(@Param('userId') userId: number, @Param('friendId') friendId: number)
    {
        return this.friendshipService.removeFriend(userId, friendId);
    }
}
