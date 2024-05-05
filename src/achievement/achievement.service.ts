import { Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class AchievementService
{
    private readonly prisma: PrismaClient;
    constructor(private readonly userService : UserService) {
        this.prisma = new PrismaClient();
    }

    async AddAchievement(payload: any)
    {
        try {
            const user = await this.userService.getUser(payload?.user_id);
            if (!user) return ;
            await this.prisma.achievement.create({
                data: {
                    user_id: payload?.user_id,
                    name: payload?.name,
                    description: payload?.description,
                    picture: payload?.picture,
                }
            });
        } catch (error) {}
    }
}
