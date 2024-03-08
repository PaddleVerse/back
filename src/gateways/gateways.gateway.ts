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



@WebSocketGateway({
  cors: {
    origin: "*",
  },
})
export class GatewaysGateway {
  constructor(
    private readonly friendshipService: FriendshipService,
    private readonly userService: UserService,
    private readonly gatewayService: GatewaysService
  ) {}
  @WebSocketServer() server: Server;

  async handleConnection(client: any) {
    const userId = await client.handshake.query?.userId;
    this.userService.clients[userId] = { socketId: client.id };
    const user = await this.userService.getUserById(+userId);
    user &&
      (await this.userService.updateUser(user.id, { status: Status.ONLINE }));
    this.server.emit("ok", { ok: 1 });
    // the chat part
    // this.rooms.forEach((room) => {
    //   if (room.host[userId]) {
    //     console.log("host matched");
    //   }
    //   room.users.forEach((user, id) => {
    //     if (id === userId) {
    //       console.log("user matched");
    //     }
    //   })
    // })
    // end of chat part
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
        await delete this.userService.clients[key];
        // here the user should leave the room he is on by calling the leaveRoom function
        //
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
    @Body("sender") client: any,
    @Body("reciever") reciever: any
  ) {
    try {
      //some logic here to handle the message between the two users, mainly check the sockets and if they exist in the data base or not
      const id: any = this.getSocketId(reciever);
      this.server.to(id).emit("update"); // final result
    } catch (error) {}
  }

  @SubscribeMessage("joinRoom")
  async handleJoinRoom(
    @ConnectedSocket() socket: Socket,
    @Body("user") client: user,
    @Body("roomName") roomName: string
  ) {
    try {
      // console.log("join room", roomName, client.id, socket.id);
      // const socketUser = await this.getSocketId(client.id);
      // if (socketUser === null) {
      //   throw new Error("User not found.");
      // }
      // const room = await this.gatewayService.rooms.find((room) => room.name === roomName);
      // if (!room) {
      //   throw new Error("Room not found.");
      // }
      // const part = room.users.get(client.id);
      // if (part) {
      //   return;
      // }
      // socket.join(roomName);
    } catch (error) {
      this.server.to(socket.id).emit("error", error.toString());
    }
  }

  @SubscribeMessage("leaveRoom")
  async handleLEaveRoom() {
    try {
    } catch (error) {}
  }
}
