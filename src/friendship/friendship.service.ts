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
            return error;
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

    async acceptFriend(user_id: number, friendId: number) 
    {
        try
        {
            await this.prisma.friendship.updateMany({
                where: {
                    user_id,
                    friendId,
                    status: FriendshipStatus.PENDING // Ensure friendship is pending
                },
                data: {
                  status: FriendshipStatus.ACCEPTED // Update status to ACCEPTED
                },
              });
        }
        catch (error)
        {
            return error;
        }
    }

    async rejectFriend(user_id: number, friendId: number)
    {
        try
        {
            await this.prisma.friendship.updateMany({
                where: {
                    user_id,
                    friendId,
                    status: FriendshipStatus.PENDING // Ensure friendship is pending
                },
                data: {
                  status: FriendshipStatus.REJECTED // Update status to REJECTED
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
                    user_id: +userId,
                    friendId: +friend_id
                }
            });
            return `Friendship between ${userId} and ${friend_id} removed`;
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
