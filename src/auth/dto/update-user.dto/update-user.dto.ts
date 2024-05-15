import { PartialType } from "@nestjs/mapped-types";
import { CreateUserDto } from "../create-user.dto/create-user.dto";
import {IsString, IsNotEmpty, MinLength, MaxLength, Matches } from "class-validator";

export class UpdateUserDto extends PartialType(CreateUserDto)
{
    @IsString({ message: "Name must be a string" })
    @IsNotEmpty({ message: "Name cannot be empty" })
    @MinLength(3, { message: "Name must be at least 3 characters long" })
    @MaxLength(20, { message: "Name cannot be longer than 20 characters" })
    @Matches(/^[a-zA-Z_]+$/, { message: "Name can only contain alphabet characters and underscores" })
    name: string;

    @IsString({ message: "Middle name must be a string" })
    @IsNotEmpty({ message: "Middle name cannot be empty" })
    @MinLength(3, { message: "Middle name must be at least 3 characters long" })
    @MaxLength(20, { message: "Middle name cannot be longer than 20 characters" })
    @Matches(/^[a-zA-Z_]+$/, { message: "Middlename can only contain alphabet characters and underscores" })
    middlename: string;
}
