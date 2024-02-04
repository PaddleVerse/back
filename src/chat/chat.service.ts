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
	createMessage() {}
}
