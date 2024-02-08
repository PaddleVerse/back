import { PartialType } from "@nestjs/mapped-types";
import { CreateUserDto } from "../create-user.dto/create-user.dto";
import { IsDate, IsInt, IsString } from "class-validator";

export class UpdateUserDto extends PartialType(CreateUserDto)
{
    @IsString()
    username: string;
    @IsString()
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
