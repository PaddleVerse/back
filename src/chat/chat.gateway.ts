import { Body, HttpException, HttpStatus } from "@nestjs/common";
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Appearance, Prisma, user } from "@prisma/client";
import { Socket, Server } from "socket.io";
import { ChatService } from "./chat.service";
import { UserService } from "src/user/user.service";

// this type is here only for testing the end points
type message = {
  message: string;
  sender: string;
};

@WebSocketGateway()
export class ChatGateway {
  constructor(
    private readonly chatService: ChatService,
    private readonly userService: UserService
  ) {}
  @WebSocketServer()
  server: Server;
  @SubscribeMessage("message")
  handleMessage(
    @ConnectedSocket() client: Socket,
    @Body() payload: message
  ): string {
    // the message type is to be changed later on when adding the type for dev and for deployment
    // console.log(`the sender of the message is :${payload.sender} and the content is : [${payload.message}]`);

    /*
     * this here is how the server able to send, there are methods that chain together  to send to a specific user/channel
     *
     * this.server.emit("creation", [
     *   { message: "about to create the room" },
     *   { message: "room created" },
     * ]);
     */
    return "Hello world!";
  }

  @SubscribeMessage("createDirectMessageChat")
  handleDirectMessage(@ConnectedSocket() client: Socket, payload: any) {
    console.log(`the content with in the paylod is ${payload}`);
  }
  @SubscribeMessage("createGroupMessageChat")
  async handleGroupMessageChatCreation(
    @Body("channelName") channel: any /*Prisma.channelCreateInput*/,
    @Body("client")
    client: /*Prisma.userCreateInput*/ user /* in here we take the user payload as input for the validation that the user does not infact exist in the room before hand  */
  ) {
    console.log(
      `the channel name is ${channel} and the creator is ${client.name}`
    );
    // const
    // const room = this.chatService.createDmRoom();
    return true;
  }

  @SubscribeMessage("join-channel")
  async joinChannel(
    @Body("channel-info") channelInfo: any,
    @Body("user-info") user: user,
    @ConnectedSocket() socket: Socket
  ) {
    // check if the user exists in the channel exists or not
    {
      const u = await this.userService.getUserById(user.id);
      if (!u)
        throw new HttpException(
          `the user with the id ${user.id} doesn't exist`,
          HttpStatus.BAD_REQUEST
        );
    }
    // check if the channel exists or not, if not throw an http error
    {
      const channel = await this.chatService.getChannelByName(channelInfo.name);
      if (!channel)
        throw new HttpException(
          `the channel with the name ${channel.name} doesn't exist`,
          HttpStatus.BAD_REQUEST
        );
      // check the mode of the channel if it is locked with key or not
      if (channel.state === Appearance.protected) {
        if (channel.key !== channelInfo.key)
          throw new HttpException(
            `wrong key for the channel ${channel.name}`,
            HttpStatus.BAD_REQUEST
          );
      }
    }
    // the channel can have three states, private (hidden from the groupds interface), protected (not hidden but has a password), or public check those and check if the user has all the things needed to join
  }
}
