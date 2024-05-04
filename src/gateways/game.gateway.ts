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

import GameRoom from "src/game/objects/GameRoom";
import Player from "src/game/objects/Player";
import Game from "src/game/objects/game";

type userT = {
  id: number;
  userName: string;
  socketId: string;
};

@WebSocketGateway({
  cors: {
    origin: "*",
  },
})
export default class GameGateway {
  private readonly prisma: PrismaClient;
  private rooms: {
    [key: string]: GameRoom;
  } = {};
  private mainLoopId: NodeJS.Timer;

  constructor(
    private readonly friendshipService: FriendshipService,
    private readonly userService: UserService,
    private readonly convService: ConversationsService,
    private readonly gatewayService: GatewaysService,
    private readonly notificationService: NotificationsService
  ) {
    this.prisma = new PrismaClient();
    this.mainLoop();
  }
  @WebSocketServer() server: Server;

  async handleConnection(client: any) {
    // console.log(`Client connected: ${client.id}`);
  }

  async handleDisconnect(client: any) {
    const socketId = client.id;
    // Find the user ID based on the disconnecting socket ID
    const userId = Object.keys(this.userService.clients).find(
      (key) => this.userService.clients[key].socketId === socketId
    );

    if (userId) {
      // console.log(`Client with user ID ${userId} and socket ID ${socketId} disconnected.`);
      const user = await this.userService.getUserById(+userId);
      if (user) {
        // find the player and which room they are in
        let room = null;
        for (const roomKey in this.rooms) {
          let players =
            this.rooms && this.rooms[roomKey]
              ? this.rooms[roomKey].players
              : null;
          if (!players) continue;
          for (const player of players) {
            // delete the player from the room
            if (player.id === socketId) {
              room = roomKey;
              this.rooms[room] = null;
              break;
            }
          }
        }
      }
    } else {
      console.error(`Failed to find a matching user for socket ID ${socketId}`);
    }
  }
  // Helper method to notify the remaining player
  private notifyRemainingPlayer(room: string, remainingRole: string) {
    const remainingPlayerId = this.rooms[room][remainingRole];
    if (remainingPlayerId) {
      this.server.to(remainingPlayerId).emit("update", {
        message: `Your opponent has disconnected. You are now the only player in the room.`,
      });
    }
  }
  // game logic
  @SubscribeMessage("joinGame")
  async handleJoinGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { senderId: number; room: string }
  ): Promise<void> {
    // Join the client to the specified room
    client.join(data.room);
    // locate the room if it exists
    if (this.rooms[data.room]) {
      this.rooms[data.room].addPlayer(
        client.id,
        this.server,
        client,
        data.senderId
      );
    } else {
      let room = new GameRoom(data.room, this.server);
      this.rooms[data.room] = room;
      room.addPlayer(client.id, this.server, client, data.senderId);
    }
  }

  @SubscribeMessage("movePaddleGame")
  async handleMovePaddleGame(client: any, payload: any): Promise<string> {
    if (!this.rooms[payload.room]) return;
    const game = this.rooms[payload.room].game;
    if (!game) return;
    game.movePaddle(client.id, payload);
    client.broadcast.to(payload.room).emit("paddlePositionUpdate", payload);
    return "Yep";
  }
  @SubscribeMessage("resetBall")
  async handleResetBall(client: any, payload: any): Promise<null> {
    if (!this.rooms[payload.room]) return;
    const game = this.rooms[payload.room].game;
    game.ball.position = { x: 0, y: 15, z: 0 };
    game.ball.velocity = { x: 0.4, y: 0, z: 0 };
  }

  mainLoop() {
    this.mainLoopId = setInterval(async () => {
      for (const room in this.rooms) {
        if (!this.rooms[room]) continue;
        if (this.rooms[room].game) {
          const gameRoom = this.rooms[room];
          const game = this.rooms[room].getGame();
          game.update();
          this.server.to(room).emit("moveBall", game.ball);
          if (game.isGameOver()) {
            this.addGameHistory(this.rooms[room]);
            this.rooms[room].dataSaved = true;
          }
        }
      }
    }, 1000 / 60);
  }
  addGameHistory = async (room: GameRoom) => {
    if (room.dataSaved) return;
    const game = room.game;
    await this.prisma.$connect();
    const winner: Player = game.winner;
    console.log(winner.userid)
    const loser: Player = game.players.find((p) => p.id !== winner.id);
    const winnerId = winner.userid;
    const loserId = loser.userid;
    const winnerScore = game.score[winner.id];
    const loserScore = game.score[loser.id];
    // coins to add depending on the diffrence in score
    const coinsToAdd = Math.abs(winnerScore - loserScore) * 100;
    try {
      const data = {
        winner: winnerId,
        loser: loserId,
        winner_score: winnerScore,
        loser_score: loserScore,
        start_time: room.startDate,
        end_time: new Date(),
      };

      const createResult = await this.prisma.game_history.create({
        data,
      });
      // increment the win_streak of the winner and put the result in the game history
      const user = await this.prisma.user.update({
        where: { id: winnerId },
        data: {
          win_streak: {
            increment: 1,
          },
        },
      });

      await this.prisma.game_history.update({
        where: { id: createResult.id },
        data: {
          winner: winnerId,
          loser: loserId,
          winner_score: winnerScore,
          loser_score: loserScore,
          winner_streak: user.win_streak,
        },
      });
      // reset the win streak of the loser
      await this.prisma.user.update({
        where: { id: loserId },
        data: {
          win_streak: 0,
        },
      });
      
      // add xp to the winner that changes due to the diffrence in score
      await this.prisma.user.update({
        where: { id: winnerId },
        data: {
          xp: {
            increment: Math.abs(winnerScore - loserScore) * 10,
          },
        },
      });
      
      const winnerUser = await this.userService.getUserById(winnerId);
      const loserUser = await this.userService.getUserById(loserId);
      await this.userService.addCoins(winnerUser.id, coinsToAdd);
    } catch (error) {
      console.error("Failed to create game history:", error);
    }

    this.server
      .to(room.id)
      .emit("gameOver", { winner: winner.id, loser: loser.id });
    delete this.rooms[room.id];
  };

  @SubscribeMessage("matchMaking")
  async MatchMakingHandler(client: any, payload: any) {
    const user = await this.userService.getUserById(payload.id);

    const usr: userT = {
      id: user.id,
      userName: user.username,
      socketId: this.getSocketId(user.id),
    };
    const room = await this.gatewayService.matchmaking(usr);
    if (room) {
      const matchQueue = await this.gatewayService.matchQueue;

      const values = Array.from(matchQueue.values());

      values.forEach(async (value, index) => {
        const otherUserIndex = index === 0 ? 1 : 0;
        const otherUserId = await values[otherUserIndex].id;

        await this.server.to(value.socketId).emit("start", {
          id: otherUserId,
          room: room,
        });
      });
      this.gatewayService.matchQueue.clear();
    }
  }

  @SubscribeMessage("cancelMatchMaking")
  async CancelMatchMaking(client: any, payload: any) {
    await this.gatewayService.matchQueue.clear();
  }

  @SubscribeMessage("leftRoom")
  async leaveRoomHandler(client: any, payload: any) {
    const room = this.rooms[payload.room];
    if (!room) return;

    for (const player of room.players) {
      // check who wins
      this.server.to(player.id).emit("leftRoom");
    }

    delete this.rooms[payload.room];
    const user = await this.userService.getUserById(payload.id);
    if (!user) return;
    const usr: userT = {
      id: user.id,
      userName: user.username,
      socketId: this.getSocketId(user.id),
    };
    await this.gatewayService.leaveRoom(usr);
  }

  getSocketId(userId: number): string {
    return this.userService.clients[userId] === undefined
      ? null
      : this.userService.clients[userId].socketId;
  }

  @SubscribeMessage("gameInvite")
  async gameInvite(
    @ConnectedSocket() socket: Socket,
    @Body("sender") sender: user,
    @Body("receiver") receiver: user
  ) {
    const senderSocketId = this.userService.clients[sender.id].socketId;
    const receiverSocketId = this.userService.clients[receiver.id].socketId;
    const roomId = sender.name + receiver.name + Date.now();
    this.server.to(receiverSocketId).emit("acceptedGameInvite", {
      sender: sender,
      reciever: receiver,
      roomId: roomId,
    });
    this.server.to(senderSocketId).emit("acceptedGameInvite", {
      sender: sender,
      reciever: receiver,
      roomId: roomId,
    });
  }
}
