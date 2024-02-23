import { Injectable } from "@nestjs/common";
import { Prisma, PrismaClient } from "@prisma/client";

@Injectable()
export class BanService {
  prisma: PrismaClient;
  constructor() {
    this.prisma = new PrismaClient();
  }

  async createBannedParticipant(userId : number) {
    const participant = null;
    return participant;
  }
}
