import { Injectable } from "@nestjs/common";
import { Prisma, PrismaClient, message } from "@prisma/client";

@Injectable()
export class MatchService {
  prisma: PrismaClient;
  constructor() {
    this.prisma = new PrismaClient();
  }

  async getMatchHistoryByUserId(userId: number) {
    
    return await this.prisma.game_history.findMany({
      where: {
        OR: [
          { winner: userId },
          { loser: userId }
        ]
      }
    });
  }
}