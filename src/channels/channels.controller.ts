import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
} from "@nestjs/common";
import { ChannelsService } from "./channels.service";
import { Appearance, Prisma, Role, user } from "@prisma/client";
import { UserService } from "src/user/user.service";
import { ParticipantsService } from "src/participants/participants.service";
import { BanService } from "src/ban/ban.service";

@Controller("channels")
export class ChannelsController {
  constructor(
    private readonly channelService: ChannelsService,
    private readonly userService: UserService,
    private readonly participantService: ParticipantsService,
    private readonly banService: BanService
  ) {}

  @Post()
  async createChannel(
    @Body("channel") info: Prisma.channelCreateInput,
    @Body("user") user: user
  ) {
    try {
      try {
        const ch = await this.channelService.getChannelByName(info.name);
        if (ch)
          throw new HttpException(
            "channel already exist",
            HttpStatus.BAD_GATEWAY
          );
      } catch (error) {
        throw error;
      }

      try {
        const us = await this.userService.getUserById(Number(user.id));
        if (!us)
          throw new HttpException("user doesnt exist", HttpStatus.BAD_GATEWAY);
      } catch (error) {
        throw error;
      }
      try {
        const newChannel = await this.channelService.createChannel(info);
        const admin = await this.participantService.createParticipant({
          role: Role.ADMIN,
          mute: false,
          channel: { connect: { id: newChannel.id } },
          user: { connect: { id: user.id } },
        });
        newChannel.participants.push(admin);
        return newChannel;
      } catch (error) {
        console.log(error);
      }
    } catch (error) {
      console.log(error);
    }
  }

  @Get()
  async getAllChannels() {
    const channels = await this.channelService.getChannels();
    return channels;
  }

  @Get(":id")
  async getChannel(@Param("id") id: string) {
    try {
      const channels = !isNaN(Number(id))
        ? await this.channelService.getChannelById(Number(id))
        : await this.channelService.getChannelByName(id);
      console.log("here");
      return channels;
    } catch (error) {
      console.log(error);
    }
  }

  @Put(":id")
  async updateChannel(
    @Param("id") id: string,
    @Body("user") user: user,
    @Body("channel") updates: Prisma.channelUpdateInput
  ) {
    try {
      try {
        console.log(user);
        const channels = !isNaN(Number(id))
          ? await this.channelService.getChannelById(Number(id))
          : await this.channelService.getChannelByName(id);
        const us = await this.userService.getUserById(Number(user.id));
        if (!us) {
          throw new HttpException("no such user", HttpStatus.BAD_REQUEST);
        }
        if (!channels)
          throw new HttpException("no such channel", HttpStatus.BAD_REQUEST);
        const participant = await this.participantService.getParticipantByIds(
          channels.id,
          us.id
        );
        if (participant.role === Role.MEMBER) {
          throw new HttpException(
            "you are not an admin to this channel",
            HttpStatus.BAD_REQUEST
          );
        }
        if (updates.state) {
          if (updates.state === Appearance.protected) {
            if (!updates.key) {
              throw new HttpException(
                "no key for protection mode",
                HttpStatus.BAD_GATEWAY
              );
            }
          }
        }
        const updatedChannel = await this.channelService.updateChannel(
          channels.id,
          updates
        );
        return updatedChannel;
      } catch (error) {
        throw error;
      }
    } catch (error) {
      throw error;
    }
  }
}
