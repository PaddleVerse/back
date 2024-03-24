import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { UserService } from 'src/user/user.service';

@Injectable()
export class SearchService 
{
    private readonly prisma : PrismaClient;
    constructor(private readonly userService : UserService)
    {
        this.prisma = new PrismaClient();
    }

    async getAll()
    {
        return await this.prisma.searchHistory.findMany();
    }

    async filterSearch(name: string, userId: number)
    {
        try
        {
            const filteredUsers = await this.prisma.user.findMany({
            where: {
                id: {
                    not: userId,
                },
                name: {
                    contains: name.toLowerCase(),
                    mode: 'insensitive',
                },
            },
            });
        
            return filteredUsers;
        }
        catch (error) { return []; }
    }

    async getSearchedUsers()
    {
        try {
            const srchs = await this.getAll();
            const users = await this.userService.getUsers();
            const usersID = srchs?.map((user : any) => user?.userId);
            const res = usersID.map((id : any) => users.find((u : any) => (u?.id === id)));
            return res;
        } catch (error) {
            return error;
        }
    }
    async addSearch(user_id : number)
    {
        try {
            const prev = await this.prisma.searchHistory.findFirst({
                where: {
                    userId : user_id
                }
            });
            if (prev) return prev;
            return await this.prisma.searchHistory.create({
                data: {
                    userId : user_id
                }
            });
        } catch (error) {
            return error;
        }
    }

    async deleteSearch(id : number)
    {
        try {
            return await this.prisma.searchHistory.delete({
                where: {
                    id
                }
            });
        } catch (error) {
            return error;
        }
    }
}
