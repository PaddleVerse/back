import { Module } from "@nestjs/common";
import { MessageController } from "./message.controller";
import { MessageService } from "./message.service";
import { ChannelsModule } from "src/channels/channels.module";
import { ChannelsService } from "src/channels/channels.service";

@Module({
  controllers: [MessageController],
  providers: [MessageService, ChannelsService],
  imports:[ChannelsModule]
})
export class MessageModule {}
