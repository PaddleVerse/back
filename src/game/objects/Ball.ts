import { Vector3 } from "../types/Vector3";
import Player from "./Player";

class Ball {
	position: Vector3;
	velocity: Vector3;
	rotation: Vector3;
	radius: number;
	mass: number;
	min: Vector3;
	max: Vector3;
	lastHit: Player;
	hitTable: boolean;
	hitGround: boolean;
	maxSpeed: number;
	constructor(
		radius: number = 0.3,
		position: Vector3 = { x: 0, y: 15, z: 0 },
		velocity: Vector3 = { x: 0, y: 0, z: 0 },
		maxSpeed: number = 0.9
	) {
		this.position = { ...position };
		this.velocity = { ...velocity };
		this.rotation = { x: 0, y: 0, z: 0 };
		this.radius = radius;
		this.mass = 0.01;
		this.min = {
			x: this.position.x - this.radius,
			y: this.position.y - this.radius,
			z: this.position.z - this.radius,
		};
		this.max = {
			x: this.position.x + this.radius,
			y: this.position.y + this.radius,
			z: this.position.z + this.radius,
		};
		this.lastHit = null;
		this.hitTable = false;
		this.hitGround = false;
		this.maxSpeed = maxSpeed;
	}

	update(): void {
		this.applyGravity();
		this.applyAirResistance();
		this.position.x += this.velocity.x;
		this.position.y += this.velocity.y;
		this.position.z += this.velocity.z;

		this.min = {
			x: this.position.x - this.radius,
			y: this.position.y - this.radius,
			z: this.position.z - this.radius,
		};
		this.max = {
			x: this.position.x + this.radius,
			y: this.position.y + this.radius,
			z: this.position.z + this.radius,
		};
	}

	applyGravity(GRAVITY: number = 0.01): void {
		this.velocity.y -= GRAVITY;
	}

	applyAirResistance(): void {
		const AIR_RESISTANCE = 0.0015; // Adjust this value for desired air resistance
		this.velocity.x *= 1 - AIR_RESISTANCE;
		// this.velocity.y *= 1 - AIR_R÷ESISTANCE;
		this.velocity.z *= 1 - AIR_RESISTANCE;
	}
	// applySpeedLimit(): void {
	// 	const velocityMagnitude = Math.sqrt(this.velocity.x ** 2 + this.velocity.y ** 2 + this.velocity.z ** 2);
	// 	if (velocityMagnitude > this.maxSpeed) {
	// 		// Normalize the velocity vector and then multiply by maxSpeed
	// 		this.velocity.x = (this.velocity.x / velocityMagnitude) * this.maxSpeed;
	// 		this.velocity.y = (this.velocity.y / velocityMagnitude) * this.maxSpeed;
	// 		this.velocity.z = (this.velocity.z / velocityMagnitude) * this.maxSpeed;
	// 		console.log("Speed limit reached!");
	// 		console.log(this.velocity);
	// 	}
	// }
}

export default Ball;
