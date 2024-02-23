import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { MessageService } from "./message.service";
import { Prisma, message } from "@prisma/client";
import { privateDecrypt } from "crypto";
import { ChannelsService } from "src/channels/channels.service";

@Controller("message")
export class MessageController {
  constructor(
    private readonly messageService: MessageService,
    private readonly channelService: ChannelsService
  ) {}

  @Get()
  async getChannelMessages(@Query("other") otherId: string) {
    const message = [{ content: "hello user", createdAt: new Date() }];
    console.log(message);
    return message;
  }

  // @Post()
  // async createMessage(@Body("message") m: message) {
  //   const message = await this.messageService.createMessage({
  //     content: m.content,
  //     content_type: m.content_type,
  //     channel: { connect: { id: m.channel_id } },
  //     conv: {connect: {id: m.conversation_id}}
  //   });
  //   return message;
  // }
  @Post()
  async createMessage(@Body("message") m: Prisma.messageCreateInput) {
    const message = await this.messageService.createMessage(m);

    return message;
  }
}
