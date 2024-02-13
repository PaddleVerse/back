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
  handleFriendRequest(client: any, payload: any): string
  {
    console.log(payload);
    const id: any = this.getSocketId(payload?.reciverId);
    if (id === null)
    {
      this.server.to(client.id).emit('friendRequest', { ok : 0});
      return "User not found."
    }
    console.log(`Sending friend request to user ${payload?.reciverId} with socket ID ${id}.`);
    this.server.to(id).emit('friendRequest', payload);
    this.friendshipService.addFriend(payload?.senderId, payload?.reciverId);
    return 'Friend request received!';
  }

  @SubscribeMessage('acceptFriendRequest')
  handleAcceptFriendRequest(client: any, payload: any): string
  {
    return 'Friend request accepted!';
  }

  @SubscribeMessage('rejectFriendRequest')
  handleRejectFriendRequest(client: any, payload: any): string
  {
    return 'Friend request rejected!';
  }

  @SubscribeMessage('removeFriend')
  handleRemoveFriend(client: any, payload: any): string
  {
    return 'Friend removed!';
  }

  @SubscribeMessage('cancelFriendRequest')
  handleCancelFriendRequest(client: any, payload: any): string
  {
    this.friendshipService.removeFriend(payload?.senderId, payload?.reciverId);
    const id: any = this.getSocketId(payload?.reciverId);
    console.log(id + "  " + client.id);
    (id && this.server.to(id).emit('friendRequest', { ok : 1}))
    client.emit('friendRequest', { ok : 1});
    return 'Friend request canceled!';
  }

  
  getSocketId(userId: number): string {
    return (this.clients[userId] === undefined ? null : this.clients[userId].socketId);
  }
  
}
