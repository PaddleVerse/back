import { Module } from '@nestjs/common';
import { ParticipantsService } from './participants.service';
import { ParticipantsController } from './participants.controller';
import { ChannelsService } from 'src/channels/channels.service';
import { UserService } from 'src/user/user.service';

@Module({
  providers: [ParticipantsService, ChannelsService, UserService],
  controllers: [ParticipantsController]
})
export class ParticipantsModule {}
