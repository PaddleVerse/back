import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Query,
} from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { ConversationsService } from "./conversations.service";
import { MessageService } from "src/message/message.service";

@Controller("conversations")
export class ConversationsController {
  constructor(readonly conversationsService: ConversationsService,
    readonly messagesService: MessageService,
  ) { }

  @Post()
  async createConversation(
    @Body("user1") user1: string,
    @Body("user2") user2: string
  ) {
    try {
      const conversation = await this.conversationsService.createConversation(
        Number(user1),
        Number(user2)
      );
      return conversation;
    } catch (error) {
      throw error;
    }
  }

  @Get()
  async getConversation(@Query("uid1") id1: string, @Query("uid2") id2: string) {
    try {
      const conversation = await this.conversationsService.getConversation(
        Number(id1),
        Number(id2)
        );
        if (!conversation) {
          throw new HttpException(
            "Conversation does not exist",
            HttpStatus.NOT_FOUND
            );
          }
          return conversation;
    }
    catch (error) {
      throw error;
    }
  }

  @Delete()
  async deleteConversation(@Query("uid1") id1: string, @Query("uid2") id2: string) {
    try {
      const conversation = await this.conversationsService.getConversation(
        Number(id1),
        Number(id2)
      );
      if (!conversation) {
        throw new HttpException(
          "Conversation does not exist",
          HttpStatus.NOT_FOUND
        );
      }
      const message = await this.messagesService.getConversationMessages(conversation.id);
      const deleted = await this.conversationsService.deleteConversation(
        Number(id1),
        Number(id2)
      );
      return deleted;
    } catch (error) {
      throw error;
    }
  }
}
