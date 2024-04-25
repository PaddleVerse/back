import {
  Body,
  ConsoleLogger,
  Controller,
  Get,
  HttpException,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { MessageService } from "./message.service";
import { Prisma, channel, message, user } from "@prisma/client";
import { privateDecrypt } from "crypto";
import { ChannelsService } from "src/channels/channels.service";
import { ConversationsService } from "src/conversations/conversations.service";
import { UserService } from "src/user/user.service";
import { ParticipantsService } from "src/participants/participants.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { MulterFile } from "multer";

@Controller("message")
export class MessageController {
  constructor(
    private readonly messageService: MessageService,
    private readonly channelService: ChannelsService,
    private readonly conversationService: ConversationsService,
    private readonly userService: UserService,
    private readonly participantsService: ParticipantsService
  ) {}

  @Post()
  async createMessage(
    @Body("message") m: Prisma.messageCreateInput,
    @Body("channel") channel: channel,
    @Body("user1") users1: string,
    @Body("user2") users2: string
  ) {
    try {
      if (channel) {
        const ch = !isNaN(channel.id)
          ? await this.channelService.getChannelById(channel.id)
          : await this.channelService.getChannelByName(channel.name);
        if (!ch) {
          throw new HttpException("Channel does not exist", 404);
        }
        const u = await this.userService.getUser(Number(users1));
        if (!u) {
          throw new HttpException("User does not exist", 404);
        }
        const participants = await this.participantsService.getParticipantByIds(
          ch.id,
          Number(users1)
        );
        if (!participants) {
          throw new HttpException("User is not a participant", 404);
        }
        const message = await this.messageService.createMessage({
          ...m,
          channel: { connect: { id: ch.id } },
        });
        return message;
      } else {
        const u1 = await this.conversationService.userService.getUserById(
          Number(users1)
        );
        const u2 = await this.conversationService.userService.getUserById(
          Number(users2)
        );
        if (!u1 || !u2) {
          throw new HttpException("User does not exist", 404);
        }
        const co = await this.conversationService.getConversation(
          Number(users1),
          Number(users2)
        );
        if (!co) {
          throw new HttpException("Conversation does not exist", 404);
        }
        const message = await this.messageService.createMessage({
          ...m,
          conv: { connect: { id: co.id } },
        });
        return message;
      }
    } catch (error) {
      throw error;
    }
  }

  @Post("/image")
  @UseInterceptors(FileInterceptor("image"))
  async createImageMessage(
    @UploadedFile() file: MulterFile,
    @Query("channel") channel: string,
    @Query("sender") users1: string,
    @Query("reciever") users2: string
  ) {
    try {
      // console.log(file);
      console.log(users1, users2);
      if (channel) {
        const ch = !isNaN(Number(channel))
          ? await this.channelService.getChannelById(Number(channel))
          : await this.channelService.getChannelByName(channel);
        if (!ch) {
          throw new HttpException("Channel does not exist", 404);
        }
        const u = await this.userService.getUser(Number(users1));
        if (!u) {
          throw new HttpException("User does not exist", 404);
        }
        const participants = await this.participantsService.getParticipantByIds(
          ch.id,
          Number(users1)
        );
        if (!participants) {
          throw new HttpException("User is not a participant", 404);
        }
        const url = await this.userService.uploadImage(file);
        const message = await this.messageService.createMessage({
          content: url,
          content_type: "image",
          sender_picture: u.picture,
          sender_id: u.id,
          channel: { connect: { id: ch.id } },
        });
        return message;
      } else {
        const u1 = await this.conversationService.userService.getUserById(
          Number(users1)
        );
        const u2 = await this.conversationService.userService.getUserById(
          Number(users2)
        );
        if (!u1 || !u2) {
          throw new HttpException("User does not exist", 404);
        }
        const co = await this.conversationService.getConversation(
          Number(users1),
          Number(users2)
        );
        if (!co) {
          throw new HttpException("Conversation does not exist", 404);
        }
        const url = await this.userService.uploadImage(file);
        const message = await this.messageService.createMessage({
          content: url,
          content_type: "image",
          sender_picture: u1.picture,
          sender_id: u1.id,
          conv: { connect: { id: co.id } },
        });
        return message;
      }
    } catch (error) {
      throw error;
    }
  }
}
