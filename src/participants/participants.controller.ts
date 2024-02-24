import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from "@nestjs/common";
import { ParticipantsService } from "./participants.service";
import { Prisma, Role, channel, user } from "@prisma/client";
import { ChannelsService } from "src/channels/channels.service";
import { UserService } from "src/user/user.service";
import { connect } from "http2";

@Controller("participants")
export class ParticipantsController {
  constructor(private readonly participantsService: ParticipantsService) {}

  @Post()
  async createParticipants(
    @Body("participants") part: Prisma.channel_participantCreateInput,
    @Body("user") user: user,
    @Body("channel") channel: channel
  ) {
    try {
      const ch = await this.participantsService.channelService.getChannelById(
        +channel.id
      );
      const us = await this.participantsService.userService.getUserById(
        +user.id
      );
      const pa = await this.participantsService.getParticipantByIds(
        ch.id,
        us.id
      );
      if (!ch)
        throw new HttpException("no such channel", HttpStatus.BAD_REQUEST);
      if (!us) throw new HttpException("no such user", HttpStatus.BAD_REQUEST);
      if (pa)
        throw new HttpException("user already in channel", HttpStatus.CONFLICT);
      const participant = await this.participantsService.createParticipant({
        ...part,
        channel: { connect: { id: ch.id } },
        user: { connect: { id: us.id } },
      });
      return participant;
    } catch (error) {
      throw error;
    }
  }

  @Get(":id")
  async getPaticipatedChannels(@Param("id") id: string) {
    try {
      const user = await this.participantsService.userService.getUserById(
        Number(id)
      );
      if (!user) {
        throw new HttpException("no such user", HttpStatus.BAD_REQUEST);
      }
      const channels = await this.participantsService.filterParticipationsByUID(
        user.id
      );
      return channels;
    } catch (error) {
      throw error;
    }
  }

  @Put(":id")
  async updatePaticipant(
    @Param("id") id: string,
    @Body("channel") channelId: string,
    @Body("executor") execId: string,
    @Body("participant") update: Prisma.channel_participantUpdateInput
  ) {
    try {
      const u = await this.participantsService.userService.getUserById(
        Number(id)
      );
      const ch = await this.participantsService.channelService.getChannelById(
        Number(channelId)
      );
      if (!u) throw new HttpException("no such user", HttpStatus.BAD_REQUEST);
      if (!ch)
        throw new HttpException("no such channel", HttpStatus.BAD_REQUEST);
      const admin = await this.participantsService.getParticipantByIds(
        ch.id,
        Number(execId)
      );
      if (!admin || admin.role === Role.MEMBER) {
        console.log(admin, execId);
        throw new HttpException(
          "you are not an admin to this channel",
          HttpStatus.BAD_REQUEST
        );
      }
      const participant = await this.participantsService.getParticipantByIds(
        ch.id,
        u.id
      );
      if (!participant)
        throw new HttpException("no such participant", HttpStatus.BAD_REQUEST);
      if (participant.id === admin.id) {
        throw new HttpException(
          "can't modify self",
          HttpStatus.BAD_REQUEST
        );
      }
      if (participant.role === "ADMIN") {
        throw new HttpException(
          "you can't change on an admin",
          HttpStatus.BAD_REQUEST
        );
      }
      const updated = await this.participantsService.updateParticipant(
        participant.id,
        update
      );
      return updated;
    } catch (error) {
      throw error;
    }
  }
}
