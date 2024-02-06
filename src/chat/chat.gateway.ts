import { Body } from "@nestjs/common";
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Prisma, user } from "@prisma/client";
import { Socket, Server } from "socket.io";
import { ChatService } from "./chat.service";

// this type is here only for testing the end points
type message = {
  message: string;
  sender: string;
};

@WebSocketGateway()
export class ChatGateway {
  constructor(private readonly chatService: ChatService) {}
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
}
