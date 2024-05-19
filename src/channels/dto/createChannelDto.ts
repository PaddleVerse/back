import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsAlphanumeric,
  Matches,
} from "class-validator";

export class CreateChannelDto {

  @IsString({ message: "Password must be a string" })
  @MinLength(6, { message: "Password must be at least 6 characters long" })
  @MaxLength(20, { message: "Password cannot be longer than 20 characters" })
  @IsAlphanumeric()
  password: string;

  

  @IsString({ message: "Name must be a string" })
  @IsNotEmpty({ message: "Name cannot be empty" })
  @MinLength(3, { message: "Name must be at least 3 characters long" })
  @MaxLength(20, { message: "Name cannot be longer than 20 characters" })
  @Matches(/^[a-zA-Z_]+$/, {
    message: "Name can only contain alphabet characters and underscores",
  })
  name: string;

  @IsString({ message: "topic  must be a string" })
  @MinLength(3, { message: "topic must be at least 3 characters long" })
  @Matches(/^[a-zA-Z_]+$/, {
    message: "topic can only contain alphabet characters and underscores",
  })
  topic: string;
}
