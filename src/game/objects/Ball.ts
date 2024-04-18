import { Vector3 } from "../types/Vector3";

class Ball {
	position: Vector3;
	velocity: Vector3;
	rotation: Vector3;
	radius: number;
	mass: number;
	min: Vector3;
	max: Vector3;
	lastHit: any; // Define a more specific type if possible
	hitTable: boolean;

	constructor(
		radius: number = 0.3,
		position: Vector3 = { x: 0, y: 15, z: 0 },
		velocity: Vector3 = { x: 0, y: 0, z: 0 }
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
	}

	update(): void {
		this.applyGravity();
		// this.applySpinning();
		this.position.x += this.velocity.x;
		this.position.y += this.velocity.y;
		this.position.z += this.velocity.z;
		// this.applySpeedLimit();

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

	applySpinning(): void {
		const SPIN_SPEED = 0.003; // Adjust this value for desired spinning speed
		const radiusAboveGround = 5; // Adjust this value for desired distance above ground
		const centerX = 0; // X coordinate of the center of the circle
		const centerZ = 0; // Z coordinate of the center of the circle

		// Calculate new position based on circular motion
		this.position.x = centerX + Math.cos(Date.now() * SPIN_SPEED) * radiusAboveGround;
		this.position.z = centerZ + Math.sin(Date.now() * SPIN_SPEED) * radiusAboveGround;
	}

	
	applySpeedLimit(maxSpeed: number = 0.5): void {
		let signX = Math.sign(this.velocity.x);
		let signY = Math.sign(this.velocity.y);
		let signZ = Math.sign(this.velocity.z);
		if (Math.abs(this.velocity.x) > maxSpeed) {
			this.velocity.x = maxSpeed * signX;
		}
		if (Math.abs(this.velocity.y) > maxSpeed) {
			this.velocity.y = maxSpeed * signY;
		}
		if (Math.abs(this.velocity.z) > maxSpeed) {
			this.velocity.z = maxSpeed * signZ;
		}
	}
}

export default Ball;
