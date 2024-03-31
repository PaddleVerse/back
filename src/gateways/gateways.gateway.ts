import { Body } from "@nestjs/common";
import {
  ConnectedSocket,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Socket, Server } from "socket.io";
import { FriendshipService } from "src/friendship/friendship.service";
import { UserService } from "../user/user.service";
import { Req, Status, user } from "@prisma/client";
import { Payload } from "@prisma/client/runtime/library";
import { GatewaysService } from "./gateways.service";
import { ConversationsService } from "src/conversations/conversations.service";

@WebSocketGateway({
  cors: {
    origin: "*",
  },
})
export class GatewaysGateway {
  constructor(
    private readonly friendshipService: FriendshipService,
    private readonly userService: UserService,
    private readonly convService: ConversationsService,
    private readonly gatewayService: GatewaysService
  ) {}
  @WebSocketServer() server: Server;

  async handleConnection(client: any) {
    const userId = await client.handshake.query?.userId;
    this.userService.clients[userId] = { socketId: client.id };
    const user = await this.userService.getUserById(+userId);
    user &&
      (await this.userService.updateUser(user.id, { status: Status.ONLINE }));
    // the chat part, where the user should join the rooms he is in if he gets reconnected
    this.gatewayService.rooms.forEach((room) => {
      if (room.host.id === Number(userId)) {
        client.join(room.name);
      } else {
        room.users.forEach((user, id) => {
          if (Number(userId) === user.id) {
            client.join(room.name);
          }
        });
      }
    });
    // end of chat part
    this.server.emit("ok", { ok: 1 });
    console.log(`User ${userId} connected with socket ID ${client.id}`);
  }

  async handleDisconnect(client: any) {
    for (const key in this.userService.clients) {
      if (this.userService.clients[key].socketId === client.id) {
        console.log(`Client with id ${key} disconnected.`);
        const user = await this.userService.getUserById(+key);
        user &&
          (await this.userService.updateUser(user.id, {
            status: Status.OFFLINE,
          }));
        // here the user should leave the room he is on by calling the leaveRoom function
        this.gatewayService.rooms.forEach((room) => {
          if (room.host.id === Number(key)) {
            client.leave(room.name);
          } else {
            room.users.forEach((user, id) => {
              if (Number(key) === user.id) {
                client.leave(room.name);
              }
            });
          }
        });
        //
        await delete this.userService.clients[key];
        this.server.emit("ok", { ok: 1 });
      }
    }
  }

  @SubscribeMessage("friendRequest")
  async handleFriendRequest(client: any, payload: any): Promise<string> {
    try {
      const id: any = await this.getSocketId(payload?.reciverId);
      await this.friendshipService.addFriend(
        payload?.senderId,
        payload?.reciverId,
        Req.SEND
      );
      await this.friendshipService.addFriend(
        payload?.reciverId,
        payload?.senderId,
        Req.RECIVED
      );
      if (id === null) {
        this.server.to(client.id).emit("refresh", { ok: 0 });
        return "User not found.";
      }

      this.server.to(id).emit("refresh", payload);
      client.emit("refresh", payload);
      return "Friend request received!";
    } catch (error) {
      return "Failed to receive friend request.";
    }
  }

  @SubscribeMessage("acceptFriendRequest")
  async handleAcceptFriendRequest(client: any, payload: any): Promise<string> {
    try {
      await this.friendshipService.acceptFriend(
        payload?.senderId,
        payload?.reciverId
      );
      await this.friendshipService.acceptFriend(
        payload?.reciverId,
        payload?.senderId
      );
      await this.convService.createConversation(
        payload?.senderId,
        payload?.reciverId
      );
      const id: any = this.getSocketId(payload?.senderId);
      if (id === null) {
        this.server.to(client.id).emit("refresh", { ok: 0 });
        return "User not found.";
      }
      this.server.to(id).emit("refresh", payload);
      client.emit("refresh", payload);

      return "Friend request accepted!";
    } catch (error) {
      return "Failed to accept friend request.";
    }
  }

  @SubscribeMessage("rejectFriendRequest")
  async handleRejectFriendRequest(client: any, payload: any): Promise<string> {
    try {
      const id: any = await this.getSocketId(payload?.senderId);
      await this.friendshipService.removeFriend(
        payload?.senderId,
        payload?.reciverId
      );
      await this.friendshipService.removeFriend(
        payload?.reciverId,
        payload?.senderId
      );

      if (id === null) {
        this.server.to(client.id).emit("refresh", { ok: 0 });
        return "User not found.";
      }
      this.server.to(id).emit("refresh", payload);
      client.emit("refresh", payload);
    } catch (error) {
      return "Failed to reject friend request.";
    }
    return "Friend request rejected!";
  }

  @SubscribeMessage("removeFriend")
  async handleRemoveFriend(client: any, payload: any): Promise<string> {
    try {
      const id: any = await this.getSocketId(
        payload?.is ? payload?.reciverId : payload?.senderId
      );
      await this.friendshipService.removeFriend(
        payload?.senderId,
        payload?.reciverId
      );
      await this.friendshipService.removeFriend(
        payload?.reciverId,
        payload?.senderId
      );
      await this.convService.deleteConversation(
        payload?.senderId,
        payload?.reciverId
      );
      if (id === null) {
        this.server.to(client.id).emit("refresh", { ok: 0 });
        return "User not found.";
      }
      this.server.to(id).emit("refresh", payload);
      client.emit("refresh", payload);
      return "Friend removed!";
    } catch (error) {
      return "Failed to removed friend.";
    }
  }

  @SubscribeMessage("cancelFriendRequest")
  async handleCancelFriendRequest(client: any, payload: any): Promise<string> {
    try {
      await this.friendshipService.removeFriend(
        payload?.senderId,
        payload?.reciverId
      );
      await this.friendshipService.removeFriend(
        payload?.reciverId,
        payload?.senderId
      );
      const id: any = await this.getSocketId(payload?.reciverId);
      if (id === null) {
        this.server.to(client.id).emit("refresh", { ok: 0 });
        return "User not found.";
      }

      this.server.to(id).emit("refresh", payload);
      client.emit("refresh", payload);

      return "Friend request canceled!";
    } catch (error) {
      return "Failed to cancele friend.";
    }
  }

  @SubscribeMessage("blockFriend")
  async handleBlockFriendRequest(client: any, payload: any): Promise<string> {
    try {
      await this.friendshipService.blockFriend(
        payload?.senderId,
        payload?.reciverId,
        Req.SEND
      );
      await this.friendshipService.blockFriend(
        payload?.reciverId,
        payload?.senderId,
        Req.RECIVED
      );
      await this.convService.deleteConversation(
        payload?.senderId,
        payload?.reciverId
      );
      const id: any = await this.getSocketId(payload?.reciverId);
      if (id === null) {
        this.server.to(client.id).emit("refresh", { ok: 0 });
        return "User not found.";
      }

      this.server.to(id).emit("refresh", payload);
      client.emit("refresh", payload);

      return "Friend request canceled!";
    } catch (error) {
      return "Failed to cancele friend.";
    }
  }

  @SubscribeMessage("unblockFriend")
  async handleUnblockFriendRequest(client: any, payload: any): Promise<string> {
    try {
      const id: any = await this.getSocketId(payload?.reciverId);
      await this.friendshipService.removeFriend(
        payload?.senderId,
        payload?.reciverId
      );
      await this.friendshipService.removeFriend(
        payload?.reciverId,
        payload?.senderId
      );
      if (id === null) {
        this.server.to(client.id).emit("refresh", { ok: 0 });
        return "User not found.";
      }
      this.server.to(id).emit("refresh", payload);
      client.emit("refresh", payload);
      return "Friend removed!";
    } catch (error) {
      return "Failed to cancele friend.";
    }
  }

  getSocketId(userId: number): string {
    return this.userService.clients[userId] === undefined
      ? null
      : this.userService.clients[userId].socketId;
  }

  @SubscribeMessage("dmmessage")
  async handleDmMessage(
    @ConnectedSocket() socket: Socket,
    @Body("sender") client: any,
    @Body("reciever") reciever: any
  ) {
    try {
      //some logic here to handle the message between the two users, mainly check the sockets and if they exist in the data base or not
      const id: any = this.getSocketId(reciever);
      this.server.to(id).emit("update", { dm: true }); // final result
      this.server.to(socket.id).emit("update", { dm: true }); // final result
    } catch (error) {}
  }

  // still under development
  @SubscribeMessage("joinRoom")
  async handleJoinRoom(
    @ConnectedSocket() socket: Socket,
    @Body("user") client: user,
    @Body("roomName") roomName: string
  ) {
    try {
      const u = this.getSocketId(Number(client.id));
      if (u === null) {
        throw new Error("User not found.");
      }
      const room = await this.gatewayService.getRoom(roomName);
      if (room === -1) {
        await this.gatewayService.addRoom(roomName, {
          id: Number(client.id),
          userName: client.username,
          socketId: u,
        });
        socket.join(roomName);
        this.server.to(u).emit("update", { channel: true });
        return "done";
      }
      if (this.gatewayService.rooms.length > 0) {
        const part = await this.gatewayService.rooms[room].users.get(client.id);
        if (part) {
          return;
        }
      }
      await this.gatewayService.addUserToRoom(roomName, {
        id: Number(client.id),
        userName: client.username,
        socketId: u,
      });
      socket.join(roomName);
      this.server.to(u).emit("update", { channel: true });
    } catch (error) {
      this.server.to(socket.id).emit("error", error.toString());
    }
  }

  @SubscribeMessage("channelmessage")
  async handleChannelMessage(
    @ConnectedSocket() socket: Socket,
    @Body("roomName") roomName: string,
    @Body("user") user: user
  ) {
    try {
      const r = await this.gatewayService.getRoom(roomName);
      if (r === -1) {
        throw new Error("Room not found.");
      }
      const u = await this.getSocketId(Number(user.id));
      if (u === null) {
        throw new Error("User not found.");
      }
      this.server.to(roomName).emit("update", { channel: true });
    } catch (error) {
      this.server.to(socket.id).emit("error", error.toString());
    }
  }

  @SubscribeMessage("leaveRoom")
  async handleLeaveRoom(
    @ConnectedSocket() socket: Socket,
    @Body("roomName") roomName: string,
    @Body("user") user: user
  ) {
    try {
      const r = await this.gatewayService.getRoom(roomName);
      if (r === -1) {
        throw new Error("Room not found.");
      }
      const u = await this.getSocketId(Number(user.id));
      if (u === null) {
        throw new Error("User not found.");
      }
      await this.gatewayService.RemoveUserFromRoom(roomName, user.id);
      socket.leave(roomName);
      this.server.to(u).emit("update", { channel: true });
    } catch (error) {}
  }

  @SubscribeMessage("channelUpdate")
  async handleChannelUpdate(
    @ConnectedSocket() Socket: Socket,
    @Body("roomName") roomName: string,
    @Body("user") user: user
  ) {
    try {
      this.server.to(roomName).emit("update", { channel: true });
    } catch (error) {
      console.log(error);
    }
  }
}
