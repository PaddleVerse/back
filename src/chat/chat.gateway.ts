import { Body, HttpException, HttpStatus } from "@nestjs/common";
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Appearance, Prisma, Role, user } from "@prisma/client";
import { Socket, Server } from "socket.io";
import { ChatService } from "./chat.service";
import { UserService } from "src/user/user.service";
import { ChannelsService } from "../channels/channels.service";

@WebSocketGateway({
  namespace: "channel-convo",
  cors: true,
})
export class ChatGateway {
  constructor(
  ) {}
}
