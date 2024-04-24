import Paddle from "./paddle";
import { Vector3 } from "../types/Vector3";

class Player {
  id: string | null;
  paddle: Paddle;

  constructor(
    id: string | null = null,
    paddle: Paddle = new Paddle(id, { x: 0, y: 0, z: 0 })
  ) {
    this.id = id;
    this.paddle = paddle;
  }

  update(data: any): void {
    let d = { paddle: data };
    this.paddle.update(d);
  }
}

export default Player;
