import {
  HttpStatus,
  HttpException,
} from "@nestjs/common";

export class DuplicateError extends HttpException {
  constructor(name: string) {
    super(`the channel with name '${name}' already exists`, HttpStatus.BAD_REQUEST);
  }
}
