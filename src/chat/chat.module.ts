import { Module } from "@nestjs/common";
import { ChatService } from "./chat.service";
import { ChatController } from "./chat.controller";
import { UserService } from "src/user/user.service";
import { UserModule } from "src/user/user.module";
import { FriendshipService } from "src/friendship/friendship.service";
import { FriendshipModule } from "src/friendship/friendship.module";
import { MessageModule } from "../message/message.module";
import { ChannelsService } from "../channels/channels.service";
import { MessageService } from "../message/message.service";
import { ConversationsService } from "src/conversations/conversations.service";
import { UserGateway } from "src/user/user.gateway";
import { ChatGateway } from "./chat.gateway";

@Module({
  providers: [
    ChatService,
    UserService,
    FriendshipService,
    ChannelsService,
    MessageService,
    ConversationsService,
    ChatGateway
  ],
  controllers: [
    ChatController,
  ],
  imports: [UserModule, FriendshipModule, ChatModule, MessageModule],
})
export class ChatModule {}
