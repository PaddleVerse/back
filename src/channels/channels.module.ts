import { Module } from '@nestjs/common';
import { ChannelsService } from './channels.service';
import { ChannelsController } from './channels.controller';
import { UserService } from 'src/user/user.service';
import { ParticipantsService } from 'src/participants/participants.service';
import { BanService } from 'src/ban/ban.service';

@Module({
  providers: [ChannelsService, UserService, ParticipantsService, BanService],
  controllers: [ChannelsController]
})
export class ChannelsModule {}
