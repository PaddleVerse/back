import { PartialType } from "@nestjs/mapped-types";
import { CreateChannelDto } from "./createChannelDto";
import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  Matches,
} from "class-validator";

export class UpdateChannelDto extends PartialType(CreateChannelDto) {
  @IsString({ message: "Name must be a string" })
  @IsNotEmpty({ message: "Name cannot be empty" })
  @MinLength(3, { message: "Name must be at least 3 characters long" })
  @MaxLength(20, { message: "Name cannot be longer than 20 characters" })
  @Matches(/^[a-zA-Z_]+$/, {
    message: "Name can only contain alphabet characters and underscores",
  })
  name: string;

  @IsString({ message: "City must be a string" })
  @IsNotEmpty({ message: "City cannot be empty" })
  state: string;

  @IsString({ message: "topic must be a string" })
  @Matches(/^[a-zA-Z_]+$/, {
    message: "Middlename can only contain alphabet characters and underscores",
  })
  topic: string;

  @IsNotEmpty({ message: "Name cannot be empty" })
  @IsString({ message: "topic  must be a string" })
  picture: string;
}
