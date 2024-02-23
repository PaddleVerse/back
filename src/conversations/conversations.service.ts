import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class ConversationsService {
	prisma: PrismaClient;
	constructor() {
		this.prisma = new PrismaClient();
	}

	async getConversation(user: number, friend: number) {
		const convo = await this.prisma.conversation.findFirst({
			where: {
				user_a_id: user,
				user_b_id: friend,
			}
		})
		return convo;
	}
}
