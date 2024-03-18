import {
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
} from "@nestjs/common";
import { ChatService } from "./chat.service";
import {
  Prisma,
  Role,
  channel,
  channel_participant,
  message,
  user,
} from "@prisma/client";
import { UserService } from "src/user/user.service";
import { FriendshipService } from "src/friendship/friendship.service";
import { ChannelsService } from "../channels/channels.service";
import { MessageService } from "src/message/message.service";
import { ConversationsService } from "src/conversations/conversations.service";

@Controller("chat")
export class ChatController {
  /**
   *
   * @param chatService
   * @description this constructor will init all the dependencies that we need to use in the chatController
   */
  constructor(
    private readonly chatService: ChatService,
    private readonly userService: UserService,
    private readonly friendShipService: FriendshipService,
    private readonly channelService: ChannelsService,
    // private readonly messageService: MessageService,
    private readonly conversationService: ConversationsService
  ) {}

  @Get("chatlist/:id")
  async getChatList(@Param("id") id: string, @Param("id") id2: string) {
    try {
      const channelList = await this.chatService.filterParticipantbyuserId(+id);
      const user1 = await this.userService.getUserById(+id);
      if (!user1) {
        throw new HttpException("no records found", HttpStatus.BAD_REQUEST);
      }
      const friendsList = await this.friendShipService.getFriends(+id);
      let channels = [];
      let friends = [];
      for (const value of channelList) {
        const ch = await this.channelService.getChannelById(value.channel_id);
        if (ch) {
            const cha = { ...ch, user: false }
            channels.push(cha);
        }
      }
      for (const friend of friendsList) {
        const user = await this.userService.getUserById(friend.friendId);
        const conversations = await this.conversationService.getConversation(Number(id), user.id);
        if (conversations) {
            const u = {...user, user: true, conversations: conversations}
            friends.push(u);
        }
      }
      return channels.concat(friends);
    } catch (error) {
      throw new HttpException("no records found", HttpStatus.BAD_REQUEST);
    }
  }
}
