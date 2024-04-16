import { Vector3 } from "../types/Vector3";

class Paddle {
	id: number;
	position: Vector3;
	velocity: Vector3;
	rotationX: number;

	constructor(id: number, position: Vector3) {
		this.id = id;
		this.position = position;
		this.velocity = { x: 0, y: 0, z: 0 };
		this.rotationX = Math.PI / 2;
	}

	update(data: { paddle: Vector3 }): void {
		this.position = data.paddle;
	}
}

export default Paddle;
