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

  /**
   *
   * @param channel
   * @returns the newly created object of the channel
   */
  async createChannel(channel: Prisma.channelCreateInput) {
    // it still needs the logic that is going to use the key and take into account th
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

  /**
   *
   * @param name the name of the channel
   * @returns the channel with the name, as it is a unique field in the channel
   */
  async getChannelByName(name: string) {
    return await this.prisma.channel.findUnique({ where: { name: name } });
  }

  /**
   *
   * @param id the id of the channel
   * @returns the channel that matches the filter (id)
   */
  async getChannelById(id: number) {
    return await this.prisma.channel.findUnique({ where: { id: id } });
  }

  /**
   *
   * @returns a promise with all the channels in the db
   */
  async getChannels(): Promise<channel[]> {
    return await this.prisma.channel.findMany();
  }

  /**
   *
   * @param dat the input needed to creare the new participant
   * @returns a new participant to the channel
   */
  async createParticipant(dat: Prisma.channel_participantCreateInput) {
    const participant = await this.prisma.channel_participant.create({
      data: dat,
    });
    return participant;
  }

  /**
   *
   * @param userId the user filter
   * @param channelId the channel filter
   * @returns the participant with both the exact channelid and userid
   */
  async filterParticipantByIds(userId: number, channelId: number) {
    const participant = this.prisma.channel_participant.findFirst({
      where: { user_id: userId, channel_id: channelId },
    });
    return participant;
  }

  async filterParticipantbyuserId(id: number) {
    const participant = await this.prisma.channel_participant.findMany({
      where: { user_id: id },
    });
    return participant;
  }

  async filterParticipantbychannelId(id: number) {
    const participant = await this.prisma.channel_participant.findMany({
      where: { channel_id: id },
    });
    return participant;
  }

  async deleteParticipant(id: number) {
    const participant = await this.prisma.channel_participant.delete({
      where: { id: id },
    });
    return participant;
  }
}
