import { Injectable } from "@nestjs/common";
import { PrismaClient, Prisma } from "@prisma/client";

@Injectable()
export class ChatService {
  /*
   * in the chat service we will implement the logic of the entire chat application
   * in here we will implement the logic for direct messages, group chat and the logic behind it
   */
	prisma: PrismaClient;
	constructor() {
		this.prisma = new PrismaClient();
	}

	// this function will create a chat room for groups that will later be either updated or deleted
	async createGroupRoom(/* in here the logic will be different for the regular conversation ... */) {
	}

	// in this function we will create the one to one conversation, the logic is still a bit vague but it is getting there
	async createDmRoom(/* the arguments in here will be what ever it is required by the database */) {

	}

	// async createUtoUMessage(message: string, roomID: string) {
	// }
	createMessage() {}
}
