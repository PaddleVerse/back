import { Body } from '@nestjs/common';
import { ConnectedSocket, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { FriendshipService } from 'src/friendship/friendship.service';
import { UserService } from '../user/user.service';
import { Req, Status } from '@prisma/client';

@WebSocketGateway({
  cors:{
    origin: '*',
  }
})
export class GatewaysGateway  {
  constructor(private readonly friendshipService : FriendshipService,
              private readonly userService: UserService) {}

  @WebSocketServer() server: Server;

  async handleConnection(client: any)
  {
    const userId = await client.handshake.query?.userId;
    this.userService.clients[userId] = { socketId : client.id };
    const user = await this.userService.getUserById(+userId);
    (user) && await this.userService.updateUser(user.id, { status : Status.ONLINE });
    this.server.emit('ok', { ok : 1 });
    console.log(`User ${userId} connected with socket ID ${client.id}`);
  }

  async handleDisconnect(client: any)
  {
    for (const key in this.userService.clients)
    {
      if (this.userService.clients[key].socketId === client.id)
      {
        console.log(`Client with id ${key} disconnected.`);
        const user = await this.userService.getUserById(+key);
        (user) && await this.userService.updateUser(user.id, { status : Status.OFFLINE });
        await delete this.userService.clients[key];
        this.server.emit('ok', { ok : 1 });
      }
    }
  }

  @SubscribeMessage('friendRequest')
  async handleFriendRequest(client: any, payload: any): Promise<string>
  {
    try
    {
      const id: any = await this.getSocketId(payload?.reciverId);
      await this.friendshipService.addFriend(payload?.senderId, payload?.reciverId, Req.SEND);
      await this.friendshipService.addFriend(payload?.reciverId, payload?.senderId, Req.RECIVED);
      if (id === null)
      {
        this.server.to(client.id).emit('refresh', { ok : 0});
        return "User not found."
      }

      this.server.to(id).emit('refresh', payload);
      client.emit('refresh', payload);
      return 'Friend request received!';
    }
    catch (error) { return 'Failed to receive friend request.'; }
  }

  @SubscribeMessage('acceptFriendRequest')
  async handleAcceptFriendRequest(client: any, payload: any): Promise<string> {
    try
    {
      await this.friendshipService.acceptFriend(payload?.senderId, payload?.reciverId);
      await this.friendshipService.acceptFriend(payload?.reciverId, payload?.senderId);
      const id: any = this.getSocketId(payload?.senderId);
      if (id === null)
      {
        this.server.to(client.id).emit('refresh', { ok : 0 });
        return "User not found.";
      }
      this.server.to(id).emit('refresh', payload);
      client.emit('refresh', payload);
      
      return 'Friend request accepted!';
    }
    catch (error) { return 'Failed to accept friend request.'; }
  }
  

  @SubscribeMessage('rejectFriendRequest')
  async handleRejectFriendRequest(client: any, payload: any): Promise<string>
  {
    try
    {
      const id: any = await this.getSocketId(payload?.senderId);
      await this.friendshipService.removeFriend(payload?.senderId, payload?.reciverId);
      await this.friendshipService.removeFriend(payload?.reciverId, payload?.senderId);
      
      if (id === null)
      {
        this.server.to(client.id).emit('refresh', { ok : 0 });
        return "User not found.";
      }
      this.server.to(id).emit('refresh', payload);
      client.emit('refresh', payload);
    }
    catch (error) { return 'Failed to reject friend request.'; }
    return 'Friend request rejected!';
  }

  @SubscribeMessage('removeFriend')
  async handleRemoveFriend(client: any, payload: any): Promise<string>
  {
    try
    {
      const id: any = await this.getSocketId((payload?.is ? payload?.reciverId : payload?.senderId));
      await this.friendshipService.removeFriend(payload?.senderId, payload?.reciverId);
      await this.friendshipService.removeFriend(payload?.reciverId, payload?.senderId);

      if (id === null)
      {
        this.server.to(client.id).emit('refresh', { ok : 0});
        return "User not found."
      }
      this.server.to(id).emit('refresh', payload);
      client.emit('refresh', payload);
      return 'Friend removed!';
    }
    catch (error) { return 'Failed to removed friend.'; }
  }

  @SubscribeMessage('cancelFriendRequest')
  async handleCancelFriendRequest(client: any, payload: any): Promise<string>
  {
    try
    {
      await this.friendshipService.removeFriend(payload?.senderId, payload?.reciverId);
      await this.friendshipService.removeFriend(payload?.reciverId, payload?.senderId);
      const id: any = await this.getSocketId(payload?.reciverId);
      if (id === null)
      {
        this.server.to(client.id).emit('refresh', { ok : 0});
        return "User not found."
      }
      
      this.server.to(id).emit('refresh', payload);
      client.emit('refresh', payload);

      return 'Friend request canceled!';
    }
    catch (error) { return 'Failed to cancele friend.'; }
  }

  @SubscribeMessage('blockFriend')
  async handleBlockFriendRequest(client: any, payload: any): Promise<string>
  {
    try
    {
      await this.friendshipService.blockFriend(payload?.senderId, payload?.reciverId, Req.SEND);
      await this.friendshipService.blockFriend(payload?.reciverId, payload?.senderId, Req.RECIVED);
      const id: any = await this.getSocketId(payload?.reciverId);
      if (id === null)
      {
        this.server.to(client.id).emit('refresh', { ok : 0});
        return "User not found."
      }
      
      this.server.to(id).emit('refresh', payload);
      client.emit('refresh', payload);

      return 'Friend request canceled!';
    }
    catch (error) { return 'Failed to cancele friend.'; }
  }

  @SubscribeMessage('unblockFriend')
  async handleUnblockFriendRequest(client: any, payload: any): Promise<string>
  {
    try
    {
      const id: any = await this.getSocketId(payload?.reciverId);
      await this.friendshipService.removeFriend(payload?.senderId, payload?.reciverId);
      await this.friendshipService.removeFriend(payload?.reciverId, payload?.senderId);
      if (id === null)
      {
        this.server.to(client.id).emit('refresh', { ok : 0});
        return "User not found."
      }
      this.server.to(id).emit('refresh', payload);
      client.emit('refresh', payload);
      return 'Friend removed!';
    }
    catch (error) { return 'Failed to cancele friend.'; }
  }
  
  getSocketId(userId: number): string
  {
    return (this.userService.clients[userId] === undefined ? null : this.userService.clients[userId].socketId);
  }
  
}
