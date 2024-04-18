import { Socket } from "socket.io";
import Game from "./game";
import Player from "./player";

class GameRoom {
  players: Player[];
  game: Game | null;
  maxPlayers: number;
  id: string;

  constructor(id: string) {
    this.players = [];
    this.game = null;
    this.maxPlayers = 2;
    this.id = id;
  }

  addPlayer(playerId: string, socket: any, client: Socket): void {
    if (this.players.length < this.maxPlayers) {
      this.players.push(new Player(playerId));
      client.join(this.id);
    }
    if (this.players.length === this.maxPlayers) {
      this.startGame();
    }
    // give every player either role player1 or player2
    this.players.forEach((player, index) => {
      socket.to(playerId).emit("role", index === 0 ? "player1" : "player2");
    });
  }
  startGame(): void {
    this.game = new Game(this.players);
    this.game.startGame();
  }
  


  removePlayer(player: Player): void {
    this.players = this.players.filter((p) => p.id !== player.id);
  }

  getPlayers(): Player[] {
    return this.players;
  }

  getGame(): Game | null {
    return this.game;
  }

  getId(): string {
    return this.id;
  }

  isFull(): boolean {
    return this.players.length === this.maxPlayers;
  }
}

export default GameRoom;
