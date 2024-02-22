import { Injectable } from "@nestjs/common";
import { Prisma, PrismaClient } from "@prisma/client";
import {
  uniqueNamesGenerator,
  Config,
  adjectives,
  colors,
  animals,
} from "unique-names-generator";

@Injectable()
export class ChannelsService {
  prisma: PrismaClient;
  constructor() {
    this.prisma = new PrismaClient();
  }

  async createChannel(data: Prisma.channelCreateInput) {
    if (!data.name) {
      const customConfig: Config = {
        dictionaries: [adjectives, colors],
        separator: "-",
        length: 3,
      };
      const randomName: string = uniqueNamesGenerator({
        dictionaries: [adjectives, colors, animals],
      });
      data.name = uniqueNamesGenerator(customConfig);
    }
    const channel = await this.prisma.channel.create({
      data: data,
      include: { participants: true, messages: true, ban: true },
    });
    return channel;
  }

  async updateChannel(data: Prisma.channelUpdateInput) {
    return;
  }

  async getChannelById(id: number) {
    return;
  }

  async getChannelByName(name: string) {
    return;
  }
}
