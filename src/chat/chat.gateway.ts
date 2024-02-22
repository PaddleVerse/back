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
import { ChannelsService } from "./channels/channels.service";

@WebSocketGateway({
  namespace: "channel-convo",
  cors: true
})
export class ChatGateway {
  constructor(
    private readonly chatService: ChatService,
    private readonly userService: UserService,
    private readonly channelService: ChannelsService
  ) {
    this.connectedClients = new Map<number, Socket>();
  }
  @WebSocketServer()
  server: Server;
  connectedClients: Map<number, Socket>;

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
      if (!user)
        throw new Error('there is no such user')
      this.connectedClients.set(Number(socket.handshake.query.userId), socket);
      if (Math.random() % 2 === 0) {
        console.log("in first");
        socket.join("first");
      }
      else {
        console.log("in second");
        socket.join("second");
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
    @Body("channel-info") channelInfo: any, // this one needs fix for later use, by using channel_info type
    @ConnectedSocket() socket: Socket
  ) {
    try {
      // check if the user exists or not
      const u = await this.userService.getUserById(+socket.handshake.query.userId);
      if (!u) throw new Error(`the user with the id ${socket.handshake.query.userId} doesn't exist`);
      // check if the channel exists or not, if not throw an http error
      const channel = await this.channelService.getChannelByName(channelInfo.name);
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
      const newChannel = await this.chatService.createParticipant({
        user: { connect: { id: u.id } },
        channel: { connect: { id: channel.id } },
      });
      socket.join(channel.name);
      this.server
        .to(socket.id)
        .emit("join-success", { success: "the checks are succesfull" });
    } catch (error) {
      this.server.to(socket.id).emit("arg-error", { error: error.toString() });
    }
    return "reached end of structutre";
    // the channel can have three states, private (hidden from the groupds interface), protected (not hidden but has a password), or public check those and check if the user has all the things needed to join
  }

  /**
   *
   * @param socket
   * @param target
   * @returns the object of the kicked participant
   * @description this function will kick a user from the channel in real time
   */
  @SubscribeMessage("kick-from-channel")
  async kickFromChannel(
    @ConnectedSocket() socket: Socket,
    @Body("kick-target") target: target
  ) {
    // check if both users (the executor and the target) are part of the channel and if they are both are mods/admins
    try {
      // check if the channel exists or not
      const channel = await this.channelService.getChannelById(target.channelId);
      //check if the executor is in the channel or not
      const executorParticipant = await this.chatService.filterParticipantByIds(
        +socket.handshake.query.userId,
        channel.id
      );
      if (executorParticipant.role === Role.MEMBER)
        throw new Error(
          `the user doesnt have privilege over the channel`
        );
      const targetParticipant = await this.chatService.filterParticipantByIds(
        target.id,
        target.channelId
      );
      if (Number(socket.handshake.query.userId) === target.id)
        throw new Error("cannot kick self");
      if (targetParticipant.role !== Role.MEMBER) {
        if (executorParticipant.role !== Role.ADMIN)
          throw new Error("cannot kick a mod or a channel admin");
      }
      await this.chatService.deleteParticipant(targetParticipant.id);
      // emit the event that the user is kicked from the channel
    } catch (error: any) {
      this.server.to(socket.id).emit("arg-error", { error: error.toString() });
    }
    return "reached end of structure";
  }

  /**
   *
   * @param socket
   * @param target
   * @description this function will ban a user from a channel
   */
  @SubscribeMessage("ban-from-channel")
  async banFromChannel(
    @ConnectedSocket() socket: Socket,
    @Body("ban-target") target: target
  ) {
    // check if both users (the executor and the target) are part of the channel and if they are both are mods/admins
    try {
      // check if the channel exists or not
      const channel = await this.channelService.getChannelById(target.channelId);
      // checking if the channel exists or not
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
        throw new Error("cannot ban self");
      if (targetParticipant.role !== Role.MEMBER) {
        if (executorParticipant.role !== Role.ADMIN)
          throw new Error("cannot ban a mod or a channel admin");
      }
      const bannedUser = await this.chatService.deleteParticipant(
        targetParticipant.id
      );
      const banned = await this.chatService.createBannedParticipant({
        user: { connect: { id: target.id } },
        channel: { connect: { id: target.channelId } },
      });

      // here i should emit back to the user that banned the notification that he banned a user, and one that tells the user that has been banned a notification
    } catch (error: any) {
      this.server.to(socket.id).emit("arg-error", { error: error.toString() });
    }
    return "reached end of structure";
  }

  /**
   *
   * @param socket
   * @param target
   * @description this function will handle the task of muting and unmuting channel participants, the logic varies with different roles
   */
  @SubscribeMessage("mute-unmute")
  async mute_UnmuteParticipant(
    @ConnectedSocket() socket: Socket,
    @Body("mute/unmute-target") target: target
  ) {
    try {
      // check if the channel exists or not
      const channel = await this.channelService.getChannelById(target.channelId);
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
        throw new Error("cannot mute self");
      if (targetParticipant.role !== Role.MEMBER) {
        if (executorParticipant.role !== Role.ADMIN)
          throw new Error("cannot mute//unmute a mod or a channel admin");
      } else {
        throw new Error("you do not have the privilege to mute/unmute users");
      }
      if (target.muteUnmute && !targetParticipant.mute)
        targetParticipant.mute = true;
      else if (!target.muteUnmute && targetParticipant.mute)
        targetParticipant.mute = false;
      //emit to the executor that the change is done, and to the target that he has been muted
    } catch (error) {
      this.server.to(socket.id).emit("arg-error", { error: error.toString() });
    }
  }

  /**
   * 
   * @param socket 
   * @param updates 
   * @description it handles the changes that happen to the channel in real time
   * it still needs work and definiletly testing
   */
  @SubscribeMessage("channel-update")
  async updateChannelInfo(
    @ConnectedSocket() socket: Socket,
    @Body("channel-updates") updates: channelUpdates
  ) {
    try {
      // check if the user exists in the database and if the user is not a member
      const user = await this.chatService.filterParticipantByIds(
        +socket.handshake.query.userId,
        updates.channelId
      );
      if (!user || user.role === Role.MEMBER)
        throw new Error(
          `you do not have the privilige to make changes in the channel`
        );
      // check if the channel exists or not
      const channel = await this.channelService.getChannelByName(
        updates.channelName
      );
      if (!channel) throw new Error("channel doesn't exist");

      if (
        channel.state === Appearance.private ||
        channel.state === Appearance.public
      )
        return;
      if (channel.state === Appearance.protected && !updates.key)
        throw new Error("need parameter as channel key");
      let state: Appearance = channel.state;
      if (updates.visibility === "private") state = Appearance.private;
      else if (updates.visibility === "public") state = Appearance.public;
      else if (updates.visibility === "protected") state = Appearance.protected;
      const ch = await this.chatService.updateChannel(channel.id, {
        key: (state !== Appearance.protected) ? updates.key: null ,
        state: state,
        name: (updates.channelName) ? updates.channelName : null,
      });
      if (!ch)
        throw new Error("update was not applied");
      // emit to the server that the change is successfull
    } catch (error) {
      this.server.to(socket.id).emit("arg-error", { error: error.toString() });
    }
  }

  @SubscribeMessage("new-message-group")
  async newMessage_Group(@ConnectedSocket() socket: Socket, @Body('message') message: string, @Body("channel") channelName: string) {
    try {
      console.log(message, channelName);
      this.server.to(channelName).emit('new-message', message);
    }
    catch (error) {
      this.server.to(socket.id).emit("error-send", {error: error.toString()});
    }
  }
}
