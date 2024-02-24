import { Injectable } from '@nestjs/common';
import { PrismaClient,FriendshipStatus } from '@prisma/client';

@Injectable()
export class FriendshipService 
{
    private readonly prisma: PrismaClient;
    constructor() 
    {
        this.prisma = new PrismaClient();
    }

    async getFriendships()
    {
        try
        {
            const friendships = await this.prisma.friendship.findMany();
            return friendships;
        }
        catch (error)
        {
            return error;
        }
    }

    async getFriends(userId: number)
    {
        try
        {
            const friends = await this.prisma.friendship.findMany({
                where: {
                    user_id: userId
                }
            });
            return friends;
        }
        catch (error)
        {
            throw error;
        }
    }


    async addFriend(userId: number, friendId: number) 
    {
        try
        {
            const friendship = await this.prisma.friendship.create({
                data: {
                    user_id: userId,
                    friendId: friendId,
                    status: FriendshipStatus.PENDING
                }
            });
            return friendship;
        }
        catch (error)
        {
            return error;
        }
    }

    async acceptFriend(userId: number, friend_id: number) 
    {
        try
        {
            await this.prisma.friendship.updateMany({
                where: {
                    user_id : userId,
                    friendId : friend_id,
                    status: FriendshipStatus.PENDING
                },
                data: {
                  status: FriendshipStatus.ACCEPTED
                },
              });
        }
        catch (error)
        {
            return error;
        }
    }

    async removeFriend(userId: number, friend_id: number)
    {
        try
        {
            await this.prisma.friendship.deleteMany({
                where: {
                    user_id: userId,
                    friendId: friend_id
                }
            });
        }
        catch (error)
        {
            return error;
        }
    }

    async blockFriend(userId: number, friend_id: number)
    {
        try
        {
            await this.prisma.friendship.deleteMany({
                where: {
                    user_id: friend_id,
                    friendId: userId
                }
            });
            const user = await this.prisma.friendship.updateMany({
                where: {
                    user_id: userId,
                    friendId: friend_id,
                },
                data: {
                  status: FriendshipStatus.BLOCKED
                },
              });
            if (user.count === 0)
            {
                await this.prisma.friendship.create({
                    data: {
                        user_id: userId,
                        friendId: friend_id,
                        status: FriendshipStatus.BLOCKED
                    }
                });
            }
        }
        catch (error)
        {
            return error;
        }
    }

    async getFriendshipStatus(userId: number, friend_id: number)
    {
        try
        {
            const friendship = await this.prisma.friendship.findFirst({
                where: {
                    user_id: +userId,
                    friendId: +friend_id
                }
            });
            return friendship.status;
        }
        catch (error)
        {
            return error;
        }
    }
}
