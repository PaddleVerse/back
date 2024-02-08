import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ChatService } from "./chat.service";
import { Prisma, channel, user } from "@prisma/client";
import { DuplicateError } from "./utils/Errors";

@Controller("chat")
export class ChatController {
  /**
   *
   * @param chatService
   * @description this constructor will init all the dependencies that we need to use in the chatController
   */
  constructor(private readonly chatService: ChatService) {}

  // /**
  //  *
  //  * @returns all the channels in case no parameter was passed in the url
  //  */
  // @Get("channels") // in here i should add a query that indicates that we are searching by name or something
  // async getAllChannels() {
  //   return await this.chatService.getChatRooms(null);
  // }

  // /**
  //  *
  //  * @returns all the direct messages in the the data base that the user is participating in
  //  */
  // @Get("DirectMessages") // here i should add a query to indicate that the user can use filters or something like that
  // async getAllDirectMessage() {
  //   return "got all direct messages";
  // }

  // @Get("channels/:id")
  // async getChannel(@Param("id") id: string) {
  //   return await this.chatService.getChatRooms(id);
  // }

  // @Get("DirectMessages/:id")
  // async getDirectMessage(@Param("id") id: string) {
  //   return "here in get direct messages by id/name";
  // }

  // /*
  //  * descripion:
  //  * this function will create a channel if it doesn't already exist
  //  * in here i will create the participante field and also the messages field, but i will have to create end points for those as well
  //  */
  // @Post("Channels/") // this still needs some error management from the front end in case sql injection etc. it needs to add the logic for the init state where there will be only one user which is the creator of the channel
  // async createChannel(
  //   @Body("channelData") channelData: Prisma.channelCreateInput,
  //   @Body("userInfo") user: user
  // ): Promise<channel> {
  //   const channel = await this.chatService.getChatRooms(channelData.name);
  //   if (channel) {
  //     // the case where the channel already exists
  //     throw new DuplicateError(channelData.name);
  //   }
  //   // i should create the channel participantes list and the message so i can add them later on when trying to create the channel
  //   const createdChannel = await this.chatService.createGroupChat(channelData);

  //   // const participant = {
  //   //   id: participantId,
  //   //   user_id: user.id,
  //   //   channel_id: createdChannel.id,
  //   //   role: "participant",
  //   //   joinedAt: new Date(),
  //   // };
  //   // createdChannel.participants.push({
  //   //   id :
  //   // });
  //   return createdChannel;
  // }
  // @Post("DirectMessages")
  // async createDirectMessage() {
  //   return "in create direct messages";
  // }

  @Post("channels")
  async createChannel(
    @Body("channel") channel: Prisma.channelCreateInput,
    @Body("user") user: user
  ) {
    const c = await this.chatService.getChannel(channel.name);
    if (c) throw new DuplicateError(channel.name);
    const ch = await this.chatService.createChannel(channel);
    const participant = await this.chatService.createParticipant({
      user: {connect: {id: user.id}},
      channel: {connect: { id: ch.id }}, // Fix: Connect the channel using its unique identifier
      role: "ADMIN"
    });
    ch.participants.push(participant);
    return ch;
  }

  /**
   * 
   * @returns all the channels in the database
   */
  @Get('channels')
  async getChannels() {
    console.log("here at get all channels");
    const channels = await this.chatService.getChannels();
    return channels;
  }
}


// type ChatRoom = channel & {
//   participants: channel_participant[];
//   messages: message[];
// };

// type ChatRoom = Prisma.channelGetPayload<{
//   include: { participants: true; messages: true };
// }>;
