import { Body } from "@nestjs/common";
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Socket, Server } from "socket.io";

type message = {
  message: string;
  sender: string;
};

@WebSocketGateway()
export class ChatGateway {
  @WebSocketServer()
  server: Server;
  @SubscribeMessage("message")
  handleMessage(
    @ConnectedSocket() client: Socket,
    @Body() payload: message
  ): string {
    // console.log(`the sender of the message is :${payload.sender} and the content is : [${payload.message}]`);
    console.log("here");
    return "Hello world!";
  }

  @SubscribeMessage("createDirectMessage")
  handleDirectMessage(@ConnectedSocket() client: Socket, payload: any) {
    console.log(`the content with in the paylod is ${payload}`);
  }
  @SubscribeMessage("createGroupMessage")
  handleGroupMessage() {}
}
