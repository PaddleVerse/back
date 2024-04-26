import Ball from "../objects/Ball";
import Game from "../objects/game";

function checkScore(game: Game) {
    const ball = game.ball;
    if (!ball) return;
    if (ball.hitGround) {
        if (!ball.lastHit) return;
        if (game.ball.hitTable) {
            game.score[ball.lastHit.id] += 1; 
            console.log('Scored');
            console.log(game.score);
        }
        ball.hitGround = false;
        ball.hitTable = false;
        ball.lastHit = null;
        // game.resetBall();
    }
}

export default checkScore;