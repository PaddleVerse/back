import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ChatService } from "./chat.service";
import { Prisma, channel, user } from "@prisma/client";
import { DuplicateError } from "./utils/Errors";

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
  /*
   * descripion:
   * this function will create a channel if it doesn't already exist
   */
  @Post("Channels/") // this still needs some error management from the front end in case sql injection etc. it needs to add the logic for the init state where there will be only one user which is the creator of the channel
  async createChannel(
    @Body('channelData') channelData: Prisma.channelCreateInput,
    @Body('userInfo') user: user
  ): Promise<channel> {
    const channel = await this.chatService.getChatRooms(channelData.name);
    console.log(user.id);
    // console.log(user.id);
    if (channel) {
      // the case where the channel already exists
      throw new DuplicateError(channelData.name);
    }
    return await this.chatService.createGroupChat(channelData);
  }
  @Post("DirectMessages")
  async createDirectMessage() {
    return "in create direct messages";
  }
}
