import { Controller, Get, Param, Post } from "@nestjs/common";
import { ChatService } from "./chat.service";

@Controller("chat")
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get("channels") // in here i should add a query that indicates that we are searching by name or something
  async getAllChannels() {
    console.log("here in get all channels method");
    return "got all the channels";
  }

  @Get("DirectMessages") // here i should add a query to indicate that the user can use filters or something like that
  async getAllDirectMessage() {
    console.log("here in direct messages");
    return "got all direct messages";
  }

  @Get("channels/:id")
  async getChannel(@Param("id") id: string) {
	  console.log(id);
	  return "here at get channel by id/name";
  }

  @Get("DirectMessages/:id")
  async getDirectMessage(@Param("id") id: string) {
	  console.log("here in unique direct message");
	  return "here in get direct messages by id/name";
  }

  @Post("Channels")
  async createChannel() {
    return "in create channel";
  }
  @Post("DirectMessages")
  async createDirectMessage() {
    return "in create direct messages";
  }
}
