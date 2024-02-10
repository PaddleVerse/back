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
import { Prisma, channel, user } from "@prisma/client";
import { DuplicateError } from "./utils/Errors";
import { UserService } from "src/user/user.service";
import { EventEmitter } from "stream";
import { ChatGateway } from "./chat.gateway";
import { ConnectedSocket } from "@nestjs/websockets";
import { Socket } from "socket.io";

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
  ) {}

  /**
   *
   * @param channel
   * @param user
   * @returns a newly created channel with the user that created it as the admin
   */
  @Post("channels")
  async createChannel(
    @Body("channel")
    channel: Prisma.channelCreateInput,
    @Body("user") user: user,
    @ConnectedSocket() socket: Socket
  ) {
    // need to add the case when the channel is going to be private/public/protected
    // add error management
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
      role: "ADMIN",
    });
    ch.participants.push(participant);
    return ch;
  }

  /**
   *
   * @param id  the id of the targeted channel
   * @param updates the object that is used to update the channel with
   * @description this function is used to update the info of the channel such as privacy etc
   */
  //   @Patch("channels/:id")
  //   async updateChannel(@Param("id") id: number, @Body("channelUpdates") updates: Prisma.channelUpdateInput) {
  //     if (updates)
  //       console.log();
  //     // handle if the update is a some channel attribution like the modes or something like that
  //   }
}

// type ChatRoom = channel & {
//   participants: channel_participant[];
//   messages: message[];
// };

// type ChatRoom = Prisma.channelGetPayload<{
//   include: { participants: true; messages: true };
// }>;
