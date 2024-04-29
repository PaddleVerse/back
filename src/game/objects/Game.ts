import Ball from "./ball";
import Table from "./table";
import { checkCollisionGround, checkCollisionNet, checkCollisionPaddle, checkCollisionTable } from "../logic/Collisions";
import Player from "./Player";
import { Vector3 } from "../types/Vector3";
import { Socket } from "socket.io";

// Assuming the Score type as a record mapping player index to score:

class Game {
    id: string;
    players: Player[]; // Define a more specific type if possible
    winner: number | null;
    score: Record<string, number>;
    ball: Ball;
    table: Table;
    timeIdle: number;
    ballSide: number; 
    socket: any;

    constructor(id: string, players: Player[] | null, socket: any) {
        this.id = id;
        this.players = players;
        this.winner = null;
        this.score = {};
        this.ball = null;
        this.table = new Table();
        this.table.loadTable();
        this.timeIdle = 0;
        this.ballSide = 1;
        this.socket = socket;
    }
    startGame(): void {
        this.winner = null;
        this.score[this.players[0].id] = 0;
        this.score[this.players[1].id] = 0;
        this.players[0].paddle.update({ paddle: { x: 16, y: 10, z: 0 } });
        this.players[1].paddle.update({ paddle: { x: -16, y: 10, z: 0 } });
        setTimeout(() => {
            this.spawnBall();
        }, 3000);
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
        this.ball = new Ball(0.3, { x: 0, y: 15, z: 0 }, { x: 0.4 * this.ballSide, y: 0, z: (Math.random() * 0.4 - 0.2)});
    }
    resetBall(): void {
        delete this.ball;
        setTimeout(() => {
            this.spawnBall();
        }, 3000);
    }
    checkIfLegalScore(): boolean {
        if (!this.ball) return false;
        // check if the ball hit on the half of the table on the side of the player who scored
        if (this.ball.hitTablePosition.x > this.table.tableBounds.center.x && this.ballSide === 1) {
            return true;
        }
        if (this.ball.hitTablePosition.x < this.table.tableBounds.center.x && this.ballSide === -1) {
            return true;
        }
        return false;
    }
    checkScore() {
        if (!this.ball) return;
        if (this.ball.hitGround) {
            if (this.ball.hitTable && this.ball.lastHit) {
                let otherPlayerIdx = this.ball.lastHit.id === this.players[0].id ? 1 : 0;
                this.score[this.ball.lastHit.id] += 1;
                let score = [{
                    player: 'player1',
                    score: this.score[this.players[0].id]
                }, {
                    player: 'player2',
                    score: this.score[this.players[1].id]
                }]
                this.socket.to(this.id).emit("updateScore", { score: score });
                this.ballSide = otherPlayerIdx === 0 ? 1 : -1;
                this.ball.hitGround = false;
                this.ball.hitTable = false;
                this.ball.lastHit = null;
                this.ball.hitTablePosition = null;
            }
            setTimeout(() => {
                this.resetBall();
            }
            , 3000);
        }
    }
    checkStandStill() {
        if (!this.ball) return;
        if (this.ball.velocity.x === 0 && this.ball.velocity.z === 0) {
            this.timeIdle += 1;
            if (this.timeIdle > 500) {
                this.timeIdle = 0;
                this.resetBall();
            }
        }
    }
    update(): void {
        if (!this.ball) return;
        checkCollisionPaddle(this.players[0], this.ball);
        checkCollisionPaddle(this.players[1], this.ball);
        checkCollisionTable(this.ball, this.table);
        checkCollisionGround(this.ball);
        this.ball.update();
        this.checkScore();
        this.checkStandStill();
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
