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



@WebSocketGateway({
  cors: {
    origin: "*",
  },
})
export class GatewaysGateway {
  private readonly prisma: PrismaClient;
  private rooms: { [key: string]: { [key: string]: string } } = {};
  private intervalId: NodeJS.Timer;
  private ballPos = { x: 0, y: 20, z: 0 };

  constructor(
    private readonly friendshipService: FriendshipService,
    private readonly userService: UserService,
    private readonly convService: ConversationsService,
    private readonly gatewayService: GatewaysService,
    private readonly notificationService: NotificationsService
  ) { this.prisma = new PrismaClient(); this.sendMovmentToClient(); }
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
    console.log(`User ${userId} connected with socket ID ${socketId}`);
  }

  async handleDisconnect(client: any) {
    const socketId = client.id;
    // Find the user ID based on the disconnecting socket ID
    const userId = Object.keys(this.userService.clients).find(key => this.userService.clients[key].socketId === socketId);

    if (userId) {
      console.log(`Client with user ID ${userId} and socket ID ${socketId} disconnected.`);
      const user = await this.userService.getUserById(+userId);
      if (user) {
        await this.userService.updateUser(user.id, { status: Status.OFFLINE });
        // Emit the disconnection event to the specific user channel.
        this.server.to(userId).emit("disconnected", { userId: +userId, socketId });
        // Clean up the user's socket information.
        delete this.userService.clients[userId];

        // Iterate over each room to manage player roles
        Object.keys(this.rooms).forEach(room => {
          if (this.rooms[room].player1 === socketId) {
            this.rooms[room].player1 = null;
            this.notifyRemainingPlayer(room, 'player2');
          } else if (this.rooms[room].player2 === socketId) {
            this.rooms[room].player2 = null;
            this.notifyRemainingPlayer(room, 'player1');
          }

          // If both player slots are null, delete the room
          if (!this.rooms[room].player1 && !this.rooms[room].player2) {
            delete this.rooms[room];
          }
        });
      }
    } else {
      console.error(`Failed to find a matching user for socket ID ${socketId}`);
    }
  }

  // Helper method to notify the remaining player
  private notifyRemainingPlayer(room: string, remainingRole: string) {
    const remainingPlayerId = this.rooms[room][remainingRole];
    if (remainingPlayerId) {
      this.server.to(remainingPlayerId).emit("update", { message: `Your opponent has disconnected. You are now the only player in the room.` });
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
  }

  // game logic
  // game logic
  @SubscribeMessage('joinGame')
  async handleJoinGame(@ConnectedSocket() client: Socket, @MessageBody() data: { senderId: string; room: string }): Promise<void> {
    // Join the client to the specified room
    client.join(data.room);
    console.log(`Client ${data.senderId} joined room ${data.room}`);

    // Initialize the room if not already done
    if (!this.rooms[data.room]) {
      this.rooms[data.room] = {
        player1: null,
        player2: null
      };
    }

    // Assign player roles
    if (!this.rooms[data.room].player1 || this.rooms[data.room].player1 === client.id) {
      this.rooms[data.room].player1 = client.id;
      this.server.to(client.id).emit('role', 'player1');
    } else if (!this.rooms[data.room].player2 || this.rooms[data.room].player2 === client.id) {
      this.rooms[data.room].player2 = client.id;
      this.server.to(client.id).emit('role', 'player2');
    } else {
      // Room already has both players
      this.server.to(client.id).emit('role', 'spec');
      return;
    }

    console.log(`Room status: ${JSON.stringify(this.rooms[data.room])}`);

    // Notify the client they have joined
    // this.server.to(client.id).emit('joined', `You are ${this.rooms[data.room][client.id]}`);
  }



  @SubscribeMessage("movePaddleGame")
  async handleMovePaddleGame(client: any, payload: any): Promise<string> {
    // Send the moves to the clients in the same room, except the sender
    // console.log(payload);
    client.broadcast.to(payload.room).emit("paddlePositionUpdate", payload);
    return "Yep";
  }
  sendMovmentToClient() {
    this.intervalId = setInterval(() => {
      // move the ball in a circle on the x and z axis
      this.ballPos.x = 10 * Math.cos(Date.now() / 1000);
      this.ballPos.z = 10 * Math.sin(Date.now() / 1000);
      // Send the ball position to all clients in the room
      this.server.to('lMa0J3z3').emit('moveBall', this.ballPos);


    }
      , 1000 / 10);
  }
}
