import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ChatService } from "./chat.service";
import { Prisma, channel } from "@prisma/client";

@Controller("chat")
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get("channels") // in here i should add a query that indicates that we are searching by name or something
  async getAllChannels() {
    return await this.chatService.getChatRooms(null);
  }

  @Get("DirectMessages") // here i should add a query to indicate that the user can use filters or something like that
  async getAllDirectMessage() {
    return "got all direct messages";
  }

  @Get("channels/:id")
  async getChannel(@Param("id") id: string) {
	  return await this.chatService.getChatRooms(id);
  }

  @Get("DirectMessages/:id")
  async getDirectMessage(@Param("id") id: string) {
	  return "here in get direct messages by id/name";
  }

  @Post("Channels")
  async createChannel(@Body() channelData: Prisma.channelCreateInput): Promise<channel> {
    const channel = await this.chatService.createGroupChat(channelData);
    return channel;
  }
  @Post("DirectMessages")
  async createDirectMessage() {
    return "in create direct messages";
  }
}