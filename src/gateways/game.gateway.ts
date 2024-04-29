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
	) { this.prisma = new PrismaClient(); this.mainLoop(); }
	@WebSocketServer() server: Server;

	async handleConnection(client: any) {

		// console.log(`Client connected: ${client.id}`);
	}

	async handleDisconnect(client: any) {
		const socketId = client.id;
		// Find the user ID based on the disconnecting socket ID
		const userId = Object.keys(this.userService.clients).find(key => this.userService.clients[key].socketId === socketId);

		if (userId) {
			// console.log(`Client with user ID ${userId} and socket ID ${socketId} disconnected.`);
			const user = await this.userService.getUserById(+userId);
			if (user) {
				// find the player and which room they are in
				let room = null;
				for (const roomKey in this.rooms) {
					let players = this.rooms && this.rooms[roomKey] ? this.rooms[roomKey].players : null;
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
			this.server.to(remainingPlayerId).emit("update", { message: `Your opponent has disconnected. You are now the only player in the room.` });
		}
	}
	// game logic
	@SubscribeMessage('joinGame')
	async handleJoinGame(@ConnectedSocket() client: Socket, @MessageBody() data: { senderId: string; room: string }): Promise<void> {
		// Join the client to the specified room
		client.join(data.room);
		// locate the room if it exists
		if (this.rooms[data.room]) {
			this.rooms[data.room].addPlayer(client.id,this.server, client);
		} else {
			let room = new GameRoom(data.room);
			this.rooms[data.room] = room;
			room.addPlayer(client.id, this.server, client);
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
	async handleResetBall(client: any, payload: any): Promise<string> {
		if (!this.rooms[payload.room]) return;
		const game = this.rooms[payload.room].game;
		game.ball.position = { x: 0, y: 15, z: 0 };
		game.ball.velocity = { x: 0.4, y: 0, z: 0 };
		return "Yep";
	}

	mainLoop() {
		this.mainLoopId = setInterval(() => {
			for (const room in this.rooms) {
				if (!this.rooms[room]) continue;
				if (this.rooms[room].game) {
					this.rooms[room].game.update();
					if (!this.rooms[room].game.ball) continue;
					this.server.to(room).emit('moveBall', this.rooms[room].game.ball);
				}
			}
		}, 1000 / 60);
	}

	@SubscribeMessage("matchMaking")
	async MatchMakingHandler(client: any, payload: any) {
		const user = await this.userService.getUserById(payload.id);
		
		const usr : userT = {
			id: user.id,
			userName: user.username,
			socketId: this.getSocketId(user.id)
		}
		const room = await this.gatewayService.matchmaking(usr)
		if (room)
		{
			const matchQueue = await this.gatewayService.matchQueue;

			const values = Array.from(matchQueue.values());

			values.forEach(async (value, index) => {
				const otherUserIndex = index === 0 ? 1 : 0;
				const otherUserId = await values[otherUserIndex].id;

				await this.server.to(value.socketId).emit('start', {
					id: otherUserId,
					room: room,
				});
			});
			this.gatewayService.matchQueue.clear();
		}
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
		const usr : userT = {
			id: user.id,
			userName: user.username,
			socketId: this.getSocketId(user.id)
		}
		await this.gatewayService.leaveRoom(usr);
	}

	getSocketId(userId: number): string {
		return this.userService.clients[userId] === undefined
		  ? null
		  : this.userService.clients[userId].socketId;
	}
}
