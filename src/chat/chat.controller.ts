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

@Controller("chat")
export class ChatController {
  /**
   *
   * @param chatService
   * @description this constructor will init all the dependencies that we need to use in the chatController
   */
  constructor(
    private readonly chatService: ChatService,
    private readonly userService: UserService
  ) {}

  /**
   *
   * @param channel
   * @param user
   * @returns a newly created channel with the user that created it as the admin
   */
  @Post("channels")
  async createChannel(
    @Body("channel") channel: Prisma.channelCreateInput,
    @Body("user") user: user
  ) {
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


  @Patch("channels/:id")
  async updateChannel(@Param("id") id: number, @Body("channelUpdates") updates: Prisma.channelUpdateInput) {
    // handle if the update is a new message
    // handle if the update is a new participant
    // handle if the update is a some channel attribution like the modes or something like that
    // const channel = this.chatService.updateChannel();
  }

  /**
   *
   * @returns all the channels in the database
   */
  @Get("channels")
  async getChannels() {
    const channels = await this.chatService.getChannels();
    return channels;
  }
}

// type ChatRoom = channel & {
//   participants: channel_participant[];
//   messages: message[];
// };

// type ChatRoom = Prisma.channelGetPayload<{
//   include: { participants: true; messages: true };
// }>;
