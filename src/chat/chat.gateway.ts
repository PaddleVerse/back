import { Body } from "@nestjs/common";
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Socket, Server } from "socket.io";

// this type is here only for testing the end points
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
    // the message type is to be changed later on when adding the type for dev and for deployment
    // console.log(`the sender of the message is :${payload.sender} and the content is : [${payload.message}]`);
    console.log("here");

    /*
     * this here is how the server able to send
     *
     * this.server.emit("creation", [
     *   { message: "about to create the room" },
     *   { message: "room created" },
     * ]);
     */
    return "Hello world!";
  }

  @SubscribeMessage("createDirectMessage")
  handleDirectMessage(@ConnectedSocket() client: Socket, payload: any) {
    console.log(`the content with in the paylod is ${payload}`);
  }
  @SubscribeMessage("createGroupMessage")
  handleGroupMessage() {}
}
