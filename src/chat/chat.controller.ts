import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
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
import { DuplicateError } from "./utils/Errors";
import { UserService } from "src/user/user.service";
import { ConnectedSocket, WebSocketGateway } from "@nestjs/websockets";
import { Socket } from "socket.io";
import { get } from "http";
import { FriendshipService } from "src/friendship/friendship.service";
import { threadId } from "worker_threads";
import { send } from "process";

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
    private readonly friendShipService: FriendshipService
  ) {}

  /**
   *
   * @param channel
   * @param user
   * @returns a newly created channel with the user that created it as the admin
   */
  @Post("channel")
  async createChannel(
    @Body("channel")
    channel: Prisma.channelCreateInput,
    @Body("user") user: user,
    @ConnectedSocket() socket: Socket
  ) {
    try {
      const u = await this.userService.getUserById(user.id);

      if (!u)
        throw new HttpException(
          "there is no user with that id",
          HttpStatus.BAD_REQUEST
        );
      const c = await this.chatService.getChannelByName(channel.name);
      if (c) throw new DuplicateError(channel.name);
      const ch = await this.chatService.createChannel(channel);
      const participant = await this.chatService.createParticipant({
        user: { connect: { id: user.id } }, // connect the fields that has a relation through a unique attribute (id)
        channel: { connect: { id: ch.id } }, // Fix: Connect the channel using its unique identifier
        role: Role.ADMIN,
      });
      ch.participants.push(participant);
      return ch;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  @Get("chatlist/:id")
  async getChatList(@Param("id") id: string) {
    try {
      const channelList = await this.chatService.filterParticipantbyuserId(+id);
      const friendsList = await this.friendShipService.getFriends(+id);
      let channels = [];
      let friends = [];
      console.log("the id is ", id);
      for (const value of channelList) {
        const ch = await this.chatService.getChannelById(value.channel_id);
        channels.push(ch);
      }
      for (const fr of friendsList) {
        const user = await this.userService.getUserById(fr.id);
        console.log(user.id);
        friends.push(user);
      }
      const list = channels.concat(friends);
      console.log(list);
      return list;
    } catch (error) {
      throw new HttpException("no records found", HttpStatus.BAD_REQUEST);
    }
  }
}

// type ChatRoom = channel & {
//   participants: channel_participant[];
//   messages: message[];
// };

// type ChatRoom = Prisma.channelGetPayload<{
//   include: { participants: true; messages: true };
// }>;
