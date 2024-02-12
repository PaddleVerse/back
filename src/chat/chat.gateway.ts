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

@WebSocketGateway({ namespace: "channel-convo" })
export class ChatGateway {
  constructor(
    private readonly chatService: ChatService,
    private readonly userService: UserService
  ) {
    this.connectedClients = new Map<number, string>();
  }
  @WebSocketServer()
  server: Server;
  connectedClients: Map<number, string>;

  /**
   *
   * @param socket the socket that initiated the handshake
   * @description this function handles the logic of the connection of the socket to the server
   */
  async handleConnection(@ConnectedSocket() socket: Socket) {
    try {
      // get the user by id, if the user doesnt exist the socket assignment line will raise an error to be thrown later
      const user = await this.userService.getUserById(
        Number(socket.handshake.query.userId)
      );
      try {
        this.connectedClients.set(user.id, socket.id);
      } catch (error) {
        throw new Error(`error connecting socket to unregistered user`);
      }
    } catch (error: any) {
      socket.emit("connection-error", { error: error.toString() });
    }
  }

  /**
   *
   * @param channelInfo
   * @param user
   * @param socket
   * @returns an acknoledgement to the client that the channel has been created
   */
  @SubscribeMessage("join-channel")
  async joinChannel(
    @Body("channel-info") channelInfo: any,
    @Body("user-info") user: user, // this one can be fixed by using query containing user id
    @ConnectedSocket() socket: Socket
  ) {
    if (!channelInfo || !user) {
      this.server
        .to(socket.id)
        .emit("arg-error", { error: "wrong arg, try again" });
    }
    console.log(user, channelInfo);
    try {
      // check if the user exists or not
      const u = await this.userService.getUserById(user.id);
      if (!u) throw new Error(`the user with the id ${user.id} doesn't exist`);
      // check if the channel exists or not, if not throw an http error
      const channel = await this.chatService.getChannelByName(channelInfo.name);
      if (!channel)
        throw new Error(
          `the channel with the name ${channelInfo.name} doesn't exist`
        );
      // check the mode of the channel if it is locked with key or not
      if (channel.state === Appearance.protected) {
        if (channel.key !== channelInfo.key)
          throw new Error(`wrong key for the channel ${channel.name}`);
      }
      // check if the user exists in the channel or not
      const Participant = await this.chatService.filterParticipantByIds(
        u.id,
        channel.id
      );
      if (Participant) throw new Error("user is already on that channel");
      // in case the user doesnt exist in the channel you create a new
      const newChannel = this.chatService.createParticipant({
        user: { connect: { id: u.id } },
        channel: { connect: { id: channel.id } },
      });
      this.server
        .to(socket.id)
        .emit("join-success", { success: "the checks are succesfull" });
    } catch (error) {
      this.server.to(socket.id).emit("arg-error", { error: error.toString() });
    }
    return "reached end of structutre";
    // the channel can have three states, private (hidden from the groupds interface), protected (not hidden but has a password), or public check those and check if the user has all the things needed to join
  }

  @SubscribeMessage("kick-from-channel")
  async kickFromChannel(
    @ConnectedSocket() socket: Socket,
    @Body("kick-target") target: target
  ) {
    // check if both users (the executor and the target) are part of the channel and if they are both are mods/admins
    try {
      // check if the channel exists or not
      const channel = await this.chatService.getChannelById(target.channelId);
      // checking if the channel exists or not
      if (!channel)
        throw new Error(
          `the channel with the id ${target.channelId} doesnt exist`
        );
      const executorParticipant = await this.chatService.filterParticipantByIds(
        +socket.handshake.query.userId,
        channel.id
      );
      // checking if the user exists and if he is anything else but a member
      if (!executorParticipant || executorParticipant.role === Role.MEMBER)
        throw new Error(
          `the user with the id ${socket.handshake.query.userId} doesnt have privilege over the channel`
        );
      const targetParticipant = await this.chatService.filterParticipantByIds(
        target.id,
        target.channelId
      );
      // checking if the participant is a member or not
      if (!targetParticipant)
        throw new Error(
          `the user with the id ${target.id} doesnt exist in the channel`
        );
      // ch
      if (Number(socket.handshake.query.userId) === target.id)
        throw new Error("cannot kick self");
      if (targetParticipant.role !== Role.MEMBER) {
        if (executorParticipant.role === Role.ADMIN)
          console.log("the user is admin and can kick anyone");
        else throw new Error("cannot kick a mod or a channel admin");
      }
    } catch (error: any) {
      this.server.to(socket.id).emit("arg-error", { error: error.toString() });
    }
    return "reached end of structure";
  }
}
