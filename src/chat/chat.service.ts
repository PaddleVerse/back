import { Injectable } from "@nestjs/common";
import { PrismaClient, Prisma, channel, channel_participant } from "@prisma/client";

@Injectable()
export class ChatService {
  /*
   * in the chat service we will implement the logic of the entire chat application
   * in here we will implement the logic for direct messages, group chat and the logic behind it
   */
  prisma: PrismaClient;
  constructor() {
    this.prisma = new PrismaClient();
  }

  // this function will create a chat room for groups that will later be either updated or deleted
  async createGroupChat(
    channel: Prisma.channelCreateInput
  ): Promise<channel | null> {
    const chatRoom = await this.prisma.channel.create({ data: channel });

    return chatRoom;
  }
  async getChatRooms(channelName: string | null): Promise<channel[]> {
    if (!channelName) return await this.prisma.channel.findMany();
    return await this.prisma.channel.findMany({
      where: { name: channelName },
    });
  }

  async createChannelParticipants(userId: number, channelId: number): Promise<channel_participant | null> {
    const participants = this.prisma.channel_participant.create({
      data: {
      
    }})
    return 
  }
  // in this function we will create the one to one conversation, the logic is still a bit vague but it is getting there
  async createDmRoom(/* the arguments in here will be what ever it is required by the database */) {}

  // async createUtoUMessage(message: string, roomID: string) {
  // }
  createMessage() {}
}
