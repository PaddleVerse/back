import { Injectable } from "@nestjs/common";
import { Prisma, PrismaClient, message } from "@prisma/client";

@Injectable()
export class MessageService {
  prisma: PrismaClient;
  constructor() {
    this.prisma = new PrismaClient();
  }

  async getChannelMessages(channelId: number) {
    const messages = await this.prisma.message.findMany({
      where: { channel_id: channelId },
    });
    return messages;
  }

  async getConversationMessages(convoId: number) {
    const messages = await this.prisma.message.findMany({
      where: { conversation_id: convoId },
    });
    return messages;
  }

  async createMessage(message: Prisma.messageCreateInput) {
    console.log(message);
    const m = await this.prisma.message.create({
      data: message
    })
    return m;
  }
}
