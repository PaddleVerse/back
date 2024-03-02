import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";
import { UserModule } from "./user/user.module";
import { FriendshipService } from "./friendship/friendship.service";
import { FriendshipController } from "./friendship/friendship.controller";
import { FriendshipModule } from "./friendship/friendship.module";
import { ChatGateway } from "./chat/chat.gateway";
import { ChatModule } from "./chat/chat.module";
import { ChatService } from "./chat/chat.service";
import { ChannelsService } from "./channels/channels.service";
import { ChannelsModule } from "./channels/channels.module";
import { MessageController } from "./message/message.controller";
import { MessageService } from "./message/message.service";
import { MessageModule } from "./message/message.module";
import { ParticipantsModule } from "./participants/participants.module";
import { ConversationsController } from "./conversations/conversations.controller";
import { ParticipantsController } from "./participants/participants.controller";
import { BanController } from "./ban/ban.controller";
import { ChannelsController } from "./channels/channels.controller";
import { ChatController } from "./chat/chat.controller";
import { ParticipantsService } from "./participants/participants.service";
import { BanService } from "./ban/ban.service";
import { ConversationsService } from "./conversations/conversations.service";
import { ConversationsModule } from "./conversations/conversations.module";
import { UserGateway } from "./user/user.gateway";

@Module({
  imports: [
    AuthModule,
    UserModule,
    FriendshipModule,
    ChatModule,
    ChannelsModule,
    MessageModule,
    ParticipantsModule,
    ConversationsModule
  ],
  controllers: [
    AppController,
    FriendshipController,
    MessageController,
    ConversationsController,
    ParticipantsController,
    BanController,
    ChannelsController,
    ChatController
  ],
  providers: [
    AppService,
    FriendshipService,
    ChatGateway,
    ChatService,
    ChannelsService,
    MessageService,
    BanService,
    ParticipantsService,
    ConversationsService,
  ],
})
export class AppModule {}
