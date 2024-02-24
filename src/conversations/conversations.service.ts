import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { FriendshipService } from 'src/friendship/friendship.service';
import { UserService } from 'src/user/user.service';

@Injectable()
export class ConversationsService {
	prisma: PrismaClient;
	constructor(
		readonly userService: UserService,
		readonly friendService: FriendshipService,
	) {
		this.prisma = new PrismaClient();
	}

	async getConversation(user: number, friend: number) {
		const convo = await this.prisma.conversation.findFirst({
			where: {
				user_a_id: user,
				user_b_id: friend,
			},
			include : {messages: true}
		})
		return convo;
	}

	async createConversation(user: number, friend: number) {
		const convo = await this.prisma.conversation.create({
			data: {
				user_a_id: user,
				user_b_id: friend,
			},
			include: {messages: true},
		})
		return convo;
	}
}
