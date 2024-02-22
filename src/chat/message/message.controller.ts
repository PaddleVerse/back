import { Controller, Get, Query } from "@nestjs/common";
import { MessageService } from "./message.service";

@Controller("message")
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Get()
  async getChannelMessages(@Query("other") otherId: string) {
	  const messages = await this.messageService.getChannelMessages(+otherId);
	  console.log('here at channel messages ', otherId);
    return otherId;
  }
}
