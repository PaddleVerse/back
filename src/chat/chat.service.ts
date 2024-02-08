import { Injectable } from "@nestjs/common";
import {
  PrismaClient,
  Prisma,
  channel,
  channel_participant,
  user,
  message,
} from "@prisma/client";
import { error } from "console";

/**
 * in the chat service we will implement the logic of the entire chat application
 * in here we will implement the logic for direct messages, group chat and the logic behind it
 */
@Injectable()
export class ChatService {
  /**
   * new instance of the prisma client
   */
  prisma: PrismaClient;
  constructor() {
    this.prisma = new PrismaClient();
  }
  // // this function will create a chat room for groups that will later be either updated or deleted
  // /**
  //  *
  //  * @param channel
  //  * @returns an newly created channel instance that is to be added to the database
  //  */
  // async createGroupChat(
  //   channel: Prisma.channelCreateInput
  // ): Promise<Prisma.channelGetPayload<{
  //   include: { participants: true; messages: true };
  // }> | null> {
  //   const msg: message = await this.prisma.message.create({ data: {} });
  //   const participant: channel_participant =
  //     await this.prisma.channel_participant.create({});
  //   const chatRoom = await this.prisma.channel.create({
  //     data: {
  //       ...channel,
  //       participants: { create: participant },
  //       messages: { create: msg },
  //     },
  //     include: {
  //       participants: true,
  //       messages: true,
  //     },
  //   });
  //   return chatRoom;
  // }

  // /**
  //  *
  //  * @param channelName
  //  * @returns an array of all the channels in the database or some channels with a specific name
  //  */
  // async getChatRooms(
  //   channelName: string | null
  // ): Promise<
  //   Prisma.channelGetPayload<{
  //     include: { participants: true; messages: true };
  //   }>[]
  // > {
  //   if (!channelName) {
  //     return await this.prisma.channel.findMany({
  //       include: {
  //         participants: true,
  //         messages: true,
  //       },
  //     });
  //   }
  //   return await this.prisma.channel.findMany({
  //     where: { name: channelName },
  //     include: {
  //       participants: true,
  //       messages: true,
  //     },
  //   });
  // }

  // /**
  //  *
  //  * @param channelName
  //  * @returns the first occurance of the channel that matches the filter
  //  */
  // async getChatRoom(channelName: string): Promise<channel | null> {
  //   const channel = this.prisma.channel.findFirst({
  //     where: { name: channelName },
  //   });
  //   return channel;
  // }

  // /**
  //  *
  //  * @param userId
  //  * @param channelId
  //  * @returns an new created object to the
  //  */
  // async createChannelParticipants(
  //   userId: number,
  //   channelId: number
  // ): Promise<channel_participant | null> {
  //   const participants = this.prisma.channel_participant.create({
  //     data: { channel_id: channelId, user_id: userId },
  //   });
  //   return;
  // }

  // /**
  //  *
  //  * @param user/channel participant
  //  * @param channelId
  //  * @returns promise with the new updated channel praticipants list and their roles if needed
  //  */
  // async updateChannelParticipants(
  //   user: channel_participant,
  //   channelId: number
  // ): Promise<channel_participant | null> {
  //   const updateChannelParticipants = this.prisma.channel_participant.update({
  //     where: { id: channelId },
  //     data: { ...user },
  //   });
  //   return updateChannelParticipants;
  // }

  // async createNewParticipant(
  //   userId: number,
  //   channelId: number,
  //   role: string,
  //   channel: Prisma.channelGetPayload<{
  //     include: { participants: true; messages: true };
  //   }>
  // ) {
  //   const participant = await this.prisma.channel_participant.create({});
  //   return;
  // }

  /**
   *
   * @param channel
   * @returns the newly created object of the channel
   */
  async createChannel(channel: Prisma.channelCreateInput) {
    // in here i should a package that is going to generate a channel name in case the channel name was not provided
    const ch = await this.prisma.channel.create({
      data: channel,
      include: { participants: true, messages: true },
    });
    if (!ch) {
      throw new Error("an error in channel creation occured");
    }
    return ch;
  }

  async getChannel(name: string) {
    return await this.prisma.channel.findUnique({ where: { name: name } });
  }

  async getChannels(): Promise<channel[]> {
    return await this.prisma.channel.findMany();
  }

  async createParticipant(dat: Prisma.channel_participantCreateInput) {
    const participant = await this.prisma.channel_participant.create({
      data: dat,
    });
    return participant;
  }
}
