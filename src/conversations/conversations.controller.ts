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

@Controller("conversations")
export class ConversationsController {
  constructor(readonly conversationsService: ConversationsService) {}

  @Post()
  async createConversation(
    @Body("user1") user1: string,
    @Body("user2") user2: string
  ) {
    try {
      const user1Exists = await this.conversationsService.userService.getUser(
        Number(user1)
      );
      const user2Exists = await this.conversationsService.userService.getUser(
        Number(user2)
      );
      if (!user1Exists || !user2Exists) {
        throw new HttpException("User does not exist", HttpStatus.NOT_FOUND);
      }
      const convo = await this.conversationsService.getConversation(
        Number(user1),
        Number(user2)
      );
      if (convo)
        throw new HttpException(
          "Conversation already exists",
          HttpStatus.CONFLICT
        );
      const friend1 =
        await this.conversationsService.prisma.friendship.findFirst({
          where: {
            user_id: Number(user1),
            friendId: Number(user2),
            status: "ACCEPTED",
          },
        });
      const friend2 =
        await this.conversationsService.prisma.friendship.findFirst({
          where: {
            user_id: Number(user2),
            friendId: Number(user1),
            status: "ACCEPTED",
          },
        });
      if (!friend1 || !friend2)
        throw new HttpException(
          "Friendship does not exist",
          HttpStatus.NOT_FOUND
        );
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
