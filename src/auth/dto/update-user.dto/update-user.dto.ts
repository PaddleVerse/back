import { PartialType } from "@nestjs/mapped-types";
import { CreateUserDto } from "../create-user.dto/create-user.dto";
import { IsDate, IsInt, IsString, Length } from "class-validator";

export class UpdateUserDto extends PartialType(CreateUserDto)
{
    @IsString()
    @Length(3, undefined, { message: "Username must be at least 3 characters long" })
    username: string;

    @IsString()
    @Length(3, undefined, { message: "Name must be at least 3 characters long" })
    name: string;
    @IsString()
    picture: string;
    @IsString()
    banner_picture: string;
    @IsString()
    status: string;
    @IsInt()
    level: number;
}
