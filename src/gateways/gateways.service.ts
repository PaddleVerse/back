import { Injectable } from "@nestjs/common";
import { user } from "@prisma/client";

type userT = {
  id: number;
  userName: string;
  socketId: string;
};

type room = {
  name: string;
  host: userT;
  users: Map<number, userT>;
};

@Injectable()
export class GatewaysService {
  rooms: room[] = [];

  async getRoom(name: string) {
    const room = await this.rooms.findIndex((room) => room.name === name);
    return room;
  }

  async addRoom(name: string, host: userT) {
    const room = await this.getRoom(name);
    if (room === -1) {
      this.rooms.push({ name, host, users: new Map() });
    }
  }

  async deleteRoom(name: string) {
    const room = await this.getRoom(name);
    if (room !== -1) {
      this.rooms = this.rooms.filter((room) => room.name !== name);
    }
  }

  async getRoomHost(name: string) {
    const room = await this.getRoom(name);
    return this.rooms[room].host;
  }

  async addUserToRoom(name: string, user: userT) {
    const room = await this.getRoom(name);

    if (room !== -1) {
      this.rooms[room].users.set(user.id, user);
    }
  }
  async RemoveUserFromRoom(name: string, user: number) {
    const room = await this.getRoom(name);
    if (room !== -1) {
      if (this.rooms[room].host.id === user) {
        this.deleteRoom(name);
      } else {
        this.rooms[room].users.delete(user);
      }
    }
  }

  async findRoomsByUserId(id: number): Promise<room[]> {
    const filteredRooms = this.rooms.filter((room) => {
      const found = room.users.get(id);
      if (found) {
        return found;
      }
    });
    return filteredRooms;
  }

  async removeUserFromAllRooms(id: number): Promise<void> {
    const rooms = await this.findRoomsByUserId(id);
    for (const room of rooms) {
      await this.RemoveUserFromRoom(room.name, id);
    }
  }
}
