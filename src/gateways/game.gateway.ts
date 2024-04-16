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
import Ball from "src/game/objects/Ball";
import Table from "src/game/objects/Table";
import { checkCollisionGround, checkCollisionNet, checkCollisionTable } from "src/game/logic/Collisions";
import Paddle  from "src/game/objects/Paddle";

@WebSocketGateway({
	cors: {
		origin: "*",
	},
})

export default class GameGateway {
	private readonly prisma: PrismaClient;
	private rooms: { [key: string]: { [key: string]: string } } = {};
	private mainLoopId: NodeJS.Timer;
	private ball = new Ball(0.3, { x: 0, y: 15, z: 0 }, { x: 0, y: 0, z: 0 });
	private table = new Table();
	private paddle = new Paddle(1, { x: 13.0, y: 10.0, z: 0.0 });

	constructor(
		private readonly friendshipService: FriendshipService,
		private readonly userService: UserService,
		private readonly convService: ConversationsService,
		private readonly gatewayService: GatewaysService,
		private readonly notificationService: NotificationsService
	) { this.prisma = new PrismaClient(); this.table.loadTable(); this.mainLoop(); }
	@WebSocketServer() server: Server;

	async handleConnection(client: any) {
		console.log(`Client connected: ${client.id}`);
	}

	async handleDisconnect(client: any) {
		const socketId = client.id;
		// Find the user ID based on the disconnecting socket ID
		const userId = Object.keys(this.userService.clients).find(key => this.userService.clients[key].socketId === socketId);

		if (userId) {
			console.log(`Client with user ID ${userId} and socket ID ${socketId} disconnected.`);
			const user = await this.userService.getUserById(+userId);
			if (user) {
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
						this.ball.position = { x: 0, y: 205, z: 0 };
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
		this.paddle.position = payload.paddle;
		client.broadcast.to(payload.room).emit("paddlePositionUpdate", payload);
		return "Yep";
	}
	@SubscribeMessage("resetBall")
	async handleResetBall(client: any, payload: any): Promise<string> {
		this.ball.position = { x: 0, y: 15, z: 0 };
		this.ball.velocity = { x: 0.4, y: 0, z: 0 };
		this.server.to(payload.room).emit("moveBall", this.ball);
		return "Yep";
	}
	mainLoop() {
		this.mainLoopId = setInterval(() => {
			// move the ball in a circle on the x and z axis
			// this.ball.position.x = 10 * Math.cos(Date.now() / 1000);
			// this.ball.position.z = 10 * Math.sin(Date.now() / 1000);
			// this.ball.velocity.y = 0.1;
			// if there is a player in the room
			if (!this.rooms['lMa0J3z3']) return;
			if (this.rooms['lMa0J3z3'].player1 || this.rooms['lMa0J3z3'].player2) {
				// move the ball
				checkCollisionTable(this.ball, this.table);
				checkCollisionGround(this.ball);
				checkCollisionNet(this.table.netBound, this.ball);
				
				this.ball.update();
				// send the ball position to the players in the room
				this.server.to('lMa0J3z3').emit('moveBall', this.ball);
			}
			// console.log(this.ball)

		}
			, 1000 / 30);
	}
}
