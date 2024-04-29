import { IsString, IsNotEmpty, MinLength, MaxLength, IsAlphanumeric } from "class-validator";

export class CreateUserDto 
{
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(20)
    username: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    name: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(20)
    nickname: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    @MaxLength(20)
    @IsAlphanumeric()
    password: string;
}
