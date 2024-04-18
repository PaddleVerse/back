import Ball from "./ball";
import Table from "./table";
import { checkCollisionGround, checkCollisionNet, checkCollisionPaddle, checkCollisionTable } from "../logic/Collisions";
import Player from "./Player";
import { Vector3 } from "../types/Vector3";

// Assuming the Score type as a record mapping player index to score:

class Game {
    players: Player[]; // Use a more specific type for players if possible
    winner: number | null;
    score: Record<string, number>;
    ball: Ball;
    table: Table;

    constructor(players: Player[] | null) { // Replace 'any' with a specific type for players
        this.players = players;
        this.winner = null;
        this.score = {};
        this.ball = null;
        this.table = new Table();
        this.table.loadTable();
    }
    startGame(): void {
        this.winner = null;
        this.players[0].paddle.position = { x: 13, y: 10, z: 0 };
        this.players[1].paddle.position = { x: -13, y: 10, z: 0 };
        this.score[this.players[0].id] = 0;
        this.score[this.players[1].id] = 0;
        // delay of 3 seconds before the ball spawns
        setTimeout(() => {
            this.spawnBall();
        }, 3000);
    }
    endGame(): void {
        this.winner = this.score[0] > this.score[1] ? 0 : 1;
    }

    updateScore(player: number, score: number): void {
        this.score[player] = score;
    }

    spawnBall(): void {
        this.ball = new Ball(0.3, { x: 0, y: 15, z: 0 }, { x: 0, y: 0, z: 0 });
    }

    update(): void {
        if (!this.ball) return;
        checkCollisionTable(this.ball, this.table);
        checkCollisionGround(this.ball);
        checkCollisionNet(this.table.netBound, this.ball);
        checkCollisionPaddle(this.players[0].paddle, this.ball);
        checkCollisionPaddle(this.players[1].paddle, this.ball);
        this.ball.update();
    }
    movePaddle(playerid: string, position: Vector3): void {
        this.players.forEach((player) => {
            if (player.id === playerid) {
                // player.paddle.position = position;
                player.paddle.update({ paddle: position });
            }
        });
    }
}

export default Game;
