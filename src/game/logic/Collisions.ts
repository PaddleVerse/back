import Ball from "../objects/Ball";
import Paddle  from "../objects/Paddle";
import Table from "../objects/Table";
import { BoundingBox } from "../types/BoundingBox";
function checkCollisionTable(ball: Ball, table: Table): void {
	// Use 'tableBounds' which contains 'width', 'height', 'depth', and 'center'.
	if (!table.tableBounds) return;  // Early return if tableBounds is not defined

	const { center, width, height, depth } = table.tableBounds;
	if (center.x - width / 2 < ball.position.x + ball.radius &&
		ball.position.x - ball.radius < center.x + width / 2) {
		if (center.y - height / 2 < ball.position.y + ball.radius &&
			ball.position.y - ball.radius < center.y + height / 2) {
			if (center.z - depth / 2 < ball.position.z + ball.radius &&
				ball.position.z - ball.radius < center.z + depth / 2) {
				// Reacting to the collision
				ball.velocity.y = -ball.velocity.y * 0.9;  // Reverse and dampen the y-velocity
				ball.velocity.x = ball.velocity.x * 0.8;  // Reduce x-velocity
				ball.velocity.z = ball.velocity.z * 0.8;  // Reduce z-velocity
				ball.position.y = center.y + height / 2 + ball.radius;  // Adjust ball position to sit on the table
				ball.hitTable = true;
			}
		}
	}
}
function checkCollisionGround(ball: Ball): void {
	const ground = 0;  // Assume the ground is at y = 0

	if (ball.position.y - ball.radius < ground) {
		ball.velocity.y = -ball.velocity.y * 0.9;  // Reverse and dampen the y-velocity
		ball.velocity.x = ball.velocity.x * 0.8;  // Reduce x-velocity
		ball.velocity.z = ball.velocity.z * 0.8;  // Reduce z-velocity
		ball.position.y = ground + ball.radius;  // Adjust ball position to sit on the ground
	}
}

function checkCollisionNet(netBox: BoundingBox, ball: Ball): void {
	if (
		netBox.position.x - netBox.width / 2 < ball.position.x + ball.radius &&
		ball.position.x - ball.radius < netBox.position.x + netBox.width / 2
	) {
		if (
			netBox.position.y - netBox.height / 2 < ball.position.y &&
			ball.position.y < netBox.position.y + netBox.height / 2
		) {
			ball.velocity.x = -ball.velocity.x * 0.6; // Reverse and dampen the x-velocity
		}
	}
}


export { checkCollisionTable, checkCollisionGround, checkCollisionNet };