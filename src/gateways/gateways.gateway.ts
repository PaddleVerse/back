import { Body } from "@nestjs/common";
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Socket, Server } from "socket.io";
import { FriendshipService } from "src/friendship/friendship.service";
import { UserService } from "../user/user.service";
import { N_Type, PrismaClient, Req, Status, user } from "@prisma/client";
import { GatewaysService } from "./gateways.service";
import { ConversationsService } from "src/conversations/conversations.service";
import { NotificationsService } from "src/notifications/notifications.service";
import { zip } from "rxjs";

class Ball {
  constructor(
    public position: { x: number; y: number; z: number },
    public velocity: { x: number; y: number; z: number }
  ) { 
    this.position = { x: 0, y: 20, z: 0 };
    this.velocity = { x: 0, y: 0, z: 0 };
  }
}

@WebSocketGateway({
  cors: {
    origin: "*",
  },
})
export class GatewaysGateway {
  private readonly prisma: PrismaClient;
  private rooms: { [key: string]: { [key: string]: string } } = {};
  private intervalId: NodeJS.Timer;
  private ball = new Ball({ x: 0, y: 20, z: 0 }, { x: 0, y: 0, z: 0 });

  constructor(
    private readonly friendshipService: FriendshipService,
    private readonly userService: UserService,
    private readonly convService: ConversationsService,
    private readonly gatewayService: GatewaysService,
    private readonly notificationService: NotificationsService
  ) { this.prisma = new PrismaClient(); }
  @WebSocketServer() server: Server;

  async handleConnection(client: any) {
    const userId = await client.handshake.query?.userId;
    const socketId = client.id;
    this.userService.clients[userId] = { socketId };
    const user = await this.userService.getUserById(+userId);
    if (user) {
      await this.userService.updateUser(user.id, { status: Status.ONLINE });
      // Join the user to a room with their userId
      client.join(userId + "");
      this.server.to(userId).emit("connected", { userId, socketId });
    }
    // console.log(`User ${userId} connected with socket ID ${socketId}`);
  }

  async handleDisconnect(client: any) {
    const socketId = client.id;
    // Find the user ID based on the disconnecting socket ID
    const userId = Object.keys(this.userService.clients).find(key => this.userService.clients[key].socketId === socketId);

    if (userId) {
      // console.log(`Client with user ID ${userId} and socket ID ${socketId} disconnected.`);
      const user = await this.userService.getUserById(+userId);
      if (user) {
        await this.userService.updateUser(user.id, { status: Status.OFFLINE });
        // Emit the disconnection event to the specific user channel.
        this.server.to(userId).emit("disconnected", { userId: +userId, socketId });
        // Clean up the user's socket information.
        delete this.userService.clients[userId];
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
      await this.notificationService.createNotification(
        payload?.reciverId,
        N_Type.REQUEST,
        payload?.senderId
      );

      if (id === null) {
        this.server.to(client.id).emit("refresh", { ok: 0 });
        return "User not found.";
      }

      this.server.to(payload?.reciverId + "").emit("notification", payload);
      this.server.to(payload?.reciverId + "").emit("refresh", payload);
      this.server.to(payload?.senderId + "").emit("refresh", payload);
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
      this.server.to(payload?.senderId + "").emit("refresh", payload);
      this.server.to(payload?.reciverId + "").emit("refresh", payload);

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
      this.server.to(payload?.senderId + "").emit("refresh", payload);
      this.server.to(payload?.reciverId + "").emit("refresh", payload);
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
      this.server.to(payload?.reciverId + "").emit("refresh", payload);
      this.server.to(payload?.senderId + "").emit("refresh", payload);
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

      this.server.to(payload?.senderId + "").emit("refresh", payload);
      this.server.to(payload?.reciverId + "").emit("refresh", payload);

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

      this.server.to(payload?.senderId + "").emit("refresh", payload);
      this.server.to(payload?.reciverId + "").emit("refresh", payload);

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
      this.server.to(payload?.senderId + "").emit("refresh", payload);
      this.server.to(payload?.reciverId + "").emit("refresh", payload);
      return "Friend removed!";
    } catch (error) {
      return "Failed to cancele friend.";
    }
  }

  @SubscribeMessage("!notified")
  async handleNotified(client: any, payload: any): Promise<string> {
    try {
      await this.prisma.user.update({
        where: {
          id: +payload?.userId,
        },
        data: {
          notified: false,
        },
      });
      return "Notification deleted!";
    } catch (error) {
      return "Failed to delete notification.";
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
    } catch (error) { }
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
    } catch (error) { }
  };
};