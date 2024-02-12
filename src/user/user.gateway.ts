import { Body } from '@nestjs/common';
import { ConnectedSocket, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';

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

  @WebSocketServer() server: Server;


  handleConnection(client: any)
  {
    client.on('new', (data : any) => {
      const clientId = data.clientId;
      console.log(`Client ${clientId} with id ${client.id} connected.`);
      this.clients[clientId] = { socketId : client.id };
    });
  }
  
  @SubscribeMessage('friendRequest')
  handleFriendRequest(client: any, payload: any): string {
    console.log(payload);
    const id: any = this.getSocketId(payload.id)
    if (id === null)
    {
      this.server.to(client.id).emit('friendRequest', { Error : 1});
      return "User not found."
    }
    this.server.to(id).emit('friendRequest', payload);

    return 'Friend request received!';
  }

  @SubscribeMessage('acceptFriendRequest')
  handleAcceptFriendRequest(client: any, payload: any): string {
    // Logic to accept friend request
    // For example, you might want to update the database and notify both users
    return 'Friend request accepted!';
  }

  @SubscribeMessage('rejectFriendRequest')
  handleRejectFriendRequest(client: any, payload: any): string {
    // Logic to reject friend request
    // For example, you might want to update the database and notify the sender
    return 'Friend request rejected!';
  }

  @SubscribeMessage('removeFriend')
  handleRemoveFriend(client: any, payload: any): string {
    // Logic to remove friend
    // For example, you might want to update the database and notify the other user
    return 'Friend removed!';
  }

  
  getSocketId(userId: number): string {
    return (this.clients[userId] === undefined ? null : this.clients[userId].socketId);
  }
  
}
