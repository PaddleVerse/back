import { Injectable } from "@nestjs/common";

type userT = {
	id: number;
	userName: string;
	socketId: string;
}

type room = {
  name: string;
  host: Record<number, string>;
  users: Map<number, userT>;
};

@Injectable()
export class GatewaysService {
  rooms: room[] = [];

  async getRoom(name: string) {
    const room = await this.rooms.findIndex((room) => room.name === name);
    return room;
  }

  async addRoom(name: string, host: Record<number, string>) {
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

  async addUserToRoom(name: string, user: userT) {
    const room = await this.getRoom(name);

    if (room !== -1) {
		this.rooms[room].users.set(
			user.id,
			user
      );
    }
  }
	async RemoveUserFromRoom(name: string, user: number) {
		const room = await this.getRoom(name);
		if (room !== -1) {
			this.rooms[room].users.delete(user);
		}
	}
}
