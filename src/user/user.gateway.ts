import { Body } from '@nestjs/common';
import { ConnectedSocket, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { FriendshipService } from 'src/friendship/friendship.service';

interface ClientData {
  [userId: number]: { socketId: string;};
}

@WebSocketGateway({
  cors:{
    origin: '*',
  }
})
export class UserGateway {
  private clients: ClientData = {};
  constructor(private readonly friendshipService : FriendshipService) {}

  @WebSocketServer() server: Server;

  handleConnection(client: any)
  {
    const userId = client.handshake.query?.userId;
    this.clients[userId] = { socketId : client.id };
    console.log(`User ${userId} connected with socket ID ${client.id}`);
  }

  handleDisconnect(client: any)
  {
    for (const key in this.clients)
    {
      if (this.clients[key].socketId === client.id)
      {
        console.log(`Client with id ${key} disconnected.`);
        delete this.clients[key];
      }
    }
  }
  
  @SubscribeMessage('friendRequest')
  async handleFriendRequest(client: any, payload: any): Promise<string>
  {
    try
    {
      const id: any = await this.getSocketId(payload?.reciverId);
      await this.friendshipService.addFriend(payload?.senderId, payload?.reciverId);
      if (id === null)
      {
        this.server.to(client.id).emit('friendRequest', { ok : 0});
        return "User not found."
      }

      this.server.to(id).emit('friendRequest', payload);
      client.emit('friendRequest', payload);
      return 'Friend request received!';
    }
    catch (error) { return 'Failed to receive friend request.'; }
  }

  @SubscribeMessage('acceptFriendRequest')
  async handleAcceptFriendRequest(client: any, payload: any): Promise<string> {
    try
    {
      await this.friendshipService.acceptFriend(payload?.senderId, payload?.reciverId);
  
      const id: any = this.getSocketId(payload?.senderId);
      if (id === null)
      {
        this.server.to(client.id).emit('acceptFriendRequest', { ok : 0 });
        return "User not found.";
      }
      this.server.to(id).emit('acceptFriendRequest', payload);
      client.emit('acceptFriendRequest', payload);
      
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
      if (id === null)
      {
        this.server.to(client.id).emit('rejectFriendRequest', { ok : 0 });
        return "User not found.";
      }
      this.server.to(id).emit('rejectFriendRequest', payload);
      client.emit('rejectFriendRequest', payload);
    }
    catch (error) { return 'Failed to reject friend request.'; }
    return 'Friend request rejected!';
  }

  @SubscribeMessage('removeFriend')
  async handleRemoveFriend(client: any, payload: any): Promise<string>
  {
    try
    {
      const id: any = await this.getSocketId(payload?.senderId);
      await this.friendshipService.removeFriend(payload?.senderId, payload?.reciverId);
      if (id === null)
      {
        this.server.to(client.id).emit('removeFriend', { ok : 0});
        return "User not found."
      }
      this.server.to(id).emit('removeFriend', payload);
      client.emit('removeFriend', payload);
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
      const id: any = await this.getSocketId(payload?.reciverId);

      
      this.server.to(id).emit('cancelFriendRequest', payload);
      client.emit('cancelFriendRequest', payload);

      return 'Friend request canceled!';
    }
    catch (error) { return 'Failed to cancele friend.'; }
  }

  
  getSocketId(userId: number): string
  {
    return (this.clients[userId] === undefined ? null : this.clients[userId].socketId);
  }
  
}
