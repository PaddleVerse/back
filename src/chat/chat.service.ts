import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import {
  PrismaClient,
  Prisma,
  channel_participant,
  user,
  channel,
  message,
  Role,
} from "@prisma/client";

/**
 * in the chat service we will implement the logic of the entire chat application
 * in here we will implement the logic for direct messages, group chat and the logic behind it
 */
@Injectable()
export class ChatService {
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
    // in here i should a package that is going to generate a channel name in case the channel name was not provided
    const ch = await this.prisma.channel.create({
      data: channel,
      include: { participants: true, messages: true, ban: true },
    });
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
    const channel = await this.prisma.channel.findUnique({ where: { id: id } });
    if (!channel)
      throw new Error(`the channel you are looking for doesn't exist`);
    return channel;
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

  /**
   *
   * @param id
   * @returns the user with the same user id, might actually not use it
   */
  async filterParticipantbyuserId(id: number) {
    const participant = await this.prisma.channel_participant.findMany({
      where: { user_id: id },
    });
    if (!participant) throw new Error(`the user is not in any channel yet`);
    return participant;
  }

  /**
   *
   * @param id
   * @returns the channel with the same channel id
   */
  async filterParticipantbychannelId(id: number) {
    const participant = await this.prisma.channel_participant.findMany({
      where: { channel_id: id },
    });
    if (!participant) throw new Error(`the user is not in any channel yet`);
    return participant;
  }

  /**
   *
   * @param id
   * @returns removes the participant from the channel as a participant
   */
  async deleteParticipant(id: number) {
    const participant = await this.prisma.channel_participant.delete({
      where: { id: id },
    });
    return participant;
  }

  async createBannedParticipant(data: Prisma.ban_listCreateInput) {
    const user = await this.prisma.ban_list.create({ data: data });
    return user;
  }

  async updateChannel(id: number, data: Prisma.channelUpdateInput) {
    const channel = await this.prisma.channel.update({
      data: data,
      where: { id: id },
    });
    return channel;
  }

  /**
   *
   * @param user
   * @param httpOrSocket
   * @description this function is used to check if the user is found i the data base or not, if not it checks the httporsocket and throws an error
   */
  validateUser(user: any | null, httpOrSocket: boolean) {
    if (httpOrSocket) {
      if (!user) {
        throw new HttpException("no such user", HttpStatus.BAD_REQUEST);
      }
    } else {
      if (!user) {
        throw new Error("no such user");
      }
    }
  }

  /**
   *
   * @param user
   * @param httpOrSocket
   * @returns a bool expression whether the user is privileged or not, true mean yes false means no
   */
  validateUserPrivilege(
    user: channel_participant,
    httpOrSocket: boolean
  ): boolean {
    if (user.role === Role.MEMBER) return false;
    return true;
  }
}
