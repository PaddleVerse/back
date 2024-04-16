import { Vector3 } from "./Vector3";

export type BoundingBox = {
	width: number;
	height: number;
	depth: number;
	max: Vector3;
	min: Vector3;
	center: Vector3;
	position?: Vector3;
};
