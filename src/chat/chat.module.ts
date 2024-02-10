import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { UserService } from 'src/user/user.service';
import { UserModule } from 'src/user/user.module';

@Module({
  providers: [ChatService, UserService],
  controllers: [ChatController],
  imports: [UserModule],
})
export class ChatModule {}
