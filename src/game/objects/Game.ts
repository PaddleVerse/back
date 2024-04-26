import Ball from "./ball";
import Table from "./table";
import { checkCollisionGround, checkCollisionNet, checkCollisionPaddle, checkCollisionTable } from "../logic/Collisions";
import Player from "./Player";
import { Vector3 } from "../types/Vector3";
import checkScore from "../logic/PointCounting";

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
        this.score[this.players[0].id] = 0;
        this.score[this.players[1].id] = 0;
        this.players[0].paddle.update({ paddle: { x: 16, y: 10, z: 0 } });
        this.players[1].paddle.update({ paddle: { x: -16, y: 10, z: 0 } });
        // delay of 3 seconds before the ball spawns
        this.spawnBall();

        // setTimeout(() => {
        //     this.spawnBall();
        // }, 3000);
    }
    endGame(): void {
        this.winner = this.score[0] > this.score[1] ? 0 : 1;
    }
    endGameLeave(player : Player): void {
        this.players.forEach((p) => {
            if (p.id !== player.id) {
                this.players = [p]; 
            }
        });
    }

    updateScore(player: number, score: number): void {
        this.score[player] = score;
    }

    spawnBall(): void {
        this.ball = new Ball(0.3, { x: 0, y: 15, z: 0 }, { x: 0, y: 0, z: 0 });
    }
    resetBall(): void {
        this.ball.velocity = { x: 0, y: 0, z: 0 };
        // delay of 3 seconds before the ball spawns
        setTimeout(() => {
            this.ball.position = { x: 0, y: 15, z: 0 };
            this.ball.velocity = { x: 0.4, y: 0, z: 0 };
        }, 3000);
    }
    update(): void {
        if (!this.ball) return;
        checkCollisionPaddle(this.players[0], this.ball);
        checkCollisionPaddle(this.players[1], this.ball);
        checkCollisionTable(this.ball, this.table);
        checkCollisionGround(this.ball);
        this.ball.update();
        checkScore(this);
        // checkCollisionNet(this.table.netBound, this.ball);
    }
    movePaddle(playerid: string, payload: any): void {
        this.players.forEach((player) => {
            if (player.id === playerid) {
                // player.paddle.position = position;
                player.paddle.velocity = payload.velocity;
                player.paddle.update({ paddle: payload.paddle });
            }
        });
    }
}

export default Game;
