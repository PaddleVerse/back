import { PartialType } from "@nestjs/mapped-types";
import { CreateUserDto } from "../create-user.dto/create-user.dto";
import {IsString, IsNotEmpty, MinLength, MaxLength, IsInt } from "class-validator";

export class UpdateUserDto extends PartialType(CreateUserDto)
{
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(20)
    nickname: string;
    
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(20)
    name: string;

    @IsString()
    picture: string;

    @IsString()
    status: string;
    @IsInt()
    level: number;
}
