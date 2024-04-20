import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { ChannelsService } from "./channels.service";
import { Appearance, channel, Prisma, Role, user } from "@prisma/client";
import { UserService } from "src/user/user.service";
import { ParticipantsService } from "src/participants/participants.service";
import { BanService } from "src/ban/ban.service";
import { ConversationsService } from "src/conversations/conversations.service";
import { MessageService } from "src/message/message.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { MulterFile } from "multer";

@Controller("channels")
export class ChannelsController {
  constructor(
    private readonly channelService: ChannelsService,
    private readonly userService: UserService,
    private readonly participantService: ParticipantsService,
    private readonly banService: BanService,
    private readonly messagesService: MessageService
  ) {}

  @Post()
  async createChannel(
    @Body("channel") info: Prisma.channelCreateInput,
    @Body("user") user: user
  ) {
    try {
      try {
        const ch = await this.channelService.getChannelByName(info.name!);
        if (ch)
          throw new HttpException(
            "channel already exist",
            HttpStatus.BAD_GATEWAY
          );
      } catch (error) {
        throw error;
      }

      try {
        const us = await this.userService.getUserById(Number(user.id));
        if (!us)
          throw new HttpException("user doesnt exist", HttpStatus.BAD_GATEWAY);
      } catch (error) {
        throw error;
      }
      try {
        const newChannel = await this.channelService.createChannel(info);
        const admin = await this.participantService.createParticipant({
          role: Role.ADMIN,
          mute: false,
          channel: { connect: { id: newChannel.id } },
          user: { connect: { id: user.id } },
        });
        newChannel.participants.push(admin);
        return { ...newChannel, success: true };
      } catch (error) {
        throw error;
      }
    } catch (error) {
      return { success: false, error: error };
    }
  }

  @Get()
  async getAllChannels() {
    let channels = await this.channelService.getChannels();
    channels = channels.filter(
      (channel) => channel.state !== Appearance.private
    );
    return channels;
  }

  @Get(":id")
  async getChannel(@Param("id") id: string) {
    try {
      const channels = !isNaN(Number(id))
        ? await this.channelService.getChannelById(Number(id))
        : await this.channelService.getChannelByName(id);
      return channels;
    } catch (error) {
      throw error;
    }
  }

  @Get("/participants/:id")
  async getChannelParticipants(
    @Param("id") id: string,
    @Query("uid") user: string
  ) {
    try {
      const channels = !isNaN(Number(id))
        ? await this.channelService.getChannelById(Number(id))
        : await this.channelService.getChannelByName(id);
      if (!channels) {
        throw new HttpException("no such channel", HttpStatus.BAD_REQUEST);
      }
      const us = await this.userService.getUserById(Number(user));
      if (!us) {
        throw new HttpException("no such user", HttpStatus.BAD_REQUEST);
      }
      const participant = await this.participantService.getParticipantByIds(
        channels.id,
        us.id
      );
      if (!participant) {
        throw new HttpException(
          "you are not a participant",
          HttpStatus.BAD_REQUEST
        );
      }
      const participants =
        await this.participantService.getParticipantsByChannelId(channels.id);
      return participants;
    } catch (error) {
      throw error;
    }
  }

  @Put(":id")
  async updateChannel(
    @Param("id") id: string,
    @Body("user") user: user,
    @Body("channel") updates: Prisma.channelUpdateInput
  ) {
    try {
      try {
        console.log(updates);
        const channels = !isNaN(Number(id))
          ? await this.channelService.getChannelById(Number(id))
          : await this.channelService.getChannelByName(id);
        const us = await this.userService.getUserById(Number(user.id));
        if (!us) {
          throw new HttpException("no such user", HttpStatus.BAD_REQUEST);
        }
        if (!channels)
          throw new HttpException("no such channel", HttpStatus.BAD_REQUEST);
        const participant = await this.participantService.getParticipantByIds(
          channels.id,
          us.id
        );
        if (participant.role === Role.MEMBER || !participant) {
          throw new HttpException(
            "you are not an admin to this channel",
            HttpStatus.BAD_REQUEST
          );
        }
        if (updates.state) {
          if (updates.state === Appearance.protected) {
            if (!updates.key) {
              throw new HttpException(
                "no key for protection mode",
                HttpStatus.BAD_GATEWAY
              );
            }
          }
        }
        const updatedChannel = await this.channelService.updateChannel(
          channels.id,
          updates
        );
        console.log(updatedChannel);
        return updatedChannel;
      } catch (error) {
        throw error;
      }
    } catch (error) {
      throw error;
    }
  }

  // in here i should add the users that are blocked and filter their messages
  @Get("/messages/:id")
  async getMessages(@Param("id") id: string, @Query("uid") user: string) {
    try {
      const channels = !isNaN(Number(id))
        ? await this.channelService.getChannelById(Number(id))
        : await this.channelService.getChannelByName(id);
      const us = await this.userService.getUserById(Number(user));
      if (!us) {
        throw new HttpException("no such user", HttpStatus.BAD_REQUEST);
      }
      if (!channels)
        throw new HttpException("no such channel", HttpStatus.BAD_REQUEST);
      const participant = await this.participantService.getParticipantByIds(
        channels.id,
        us.id
      );
      if (!participant) {
        throw new HttpException(
          "you are not a participant",
          HttpStatus.BAD_REQUEST
        );
      }
      const blocked = await this.channelService.prisma.friendship.findMany({
        where: {
          user_id: us.id,
          status: "BLOCKED",
        },
      });
      let messages = await this.messagesService.getChannelMessages(channels.id);
      blocked.forEach((block) => {
        messages = messages.filter(
          (message) => message.sender_id !== block.friendId
        );
      });
      // console.log(messages);

      return messages.sort(
        (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  @Get("/messages/lastMessage/:id")
  async getLastMessages(@Param("id") id: string, @Query("uid") user: string) {
    try {
      const channels = !isNaN(Number(id))
        ? await this.channelService.getChannelById(Number(id))
        : await this.channelService.getChannelByName(id);
      const us = await this.userService.getUserById(Number(user));
      if (!us) {
        throw new HttpException("no such user", HttpStatus.BAD_REQUEST);
      }
      if (!channels)
        throw new HttpException("no such channel", HttpStatus.BAD_REQUEST);
      const participant = await this.participantService.getParticipantByIds(
        channels.id,
        us.id
      );
      if (!participant) {
        throw new HttpException(
          "you are not a participant",
          HttpStatus.BAD_REQUEST
        );
      }
      const blocked = await this.channelService.prisma.friendship.findMany({
        where: {
          user_id: us.id,
          status: "BLOCKED",
        },
      });
      let messages = await this.messagesService.getChannelMessages(channels.id);
      blocked.forEach((block) => {
        messages = messages.filter(
          (message) => message.sender_id !== block.friendId
        );
      });
      return messages.sort(
        (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
      )[messages.length - 1];
    } catch (error) {
      throw error;
    }
  }

  @Post("/image")
  @UseInterceptors(FileInterceptor("image"))
  async uploadImage(
    @UploadedFile() file: MulterFile,
    @Query("channel") channelId: string,
    @Query("user") user: string
  ) {
    try {
      const channels = await this.channelService.getChannelById(
        Number(channelId)
      );
      if (!channels)
        throw new HttpException("no such channel", HttpStatus.BAD_REQUEST);
      const us = await this.userService.getUserById(Number(user));
      if (!us) {
        throw new HttpException("no such user", HttpStatus.BAD_REQUEST);
      }
      const participant = await this.participantService.getParticipantByIds(
        channels.id,
        us.id
      );
      if (participant.role === Role.MEMBER || !participant) {
        throw new HttpException(
          "you are not an admin to this channel",
          HttpStatus.BAD_REQUEST
        );
      }
      const url = await this.channelService.uploadImage(file);
      const updateChannel = await this.channelService.updateChannel(
        channels.id,
        { picture: url }
      );
      return { ...updateChannel, success: true };
    } catch (error) {
      return { success: false, error: error };
    }
  }

  @Get('inviteList/:id')
  async  getUsers(@Param('id') id: string) 
  {
    try {
      const users = await this.userService.getUsers()
     let list = [];
     for (const user of users) {
       const pa = await this.participantService.getParticipantByIds(
         Number(id),
         user.id
       );
       if (!(pa?.id > 0)) {
         list.push(user);
       }
     }
      console.log("the list of the users", list);
      return list;
    }
    catch (error) {
      throw error;
    }
    }

}
