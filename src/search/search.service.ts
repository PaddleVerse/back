import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class SearchService 
{
    private readonly prisma : PrismaClient;
    constructor()
    {
        this.prisma = new PrismaClient();
    }

    async getAll()
    {
        return await this.prisma.searchHistory.findMany();
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
