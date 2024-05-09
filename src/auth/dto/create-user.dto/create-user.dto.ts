import { IsString, IsNotEmpty, MinLength, MaxLength, IsAlphanumeric } from "class-validator";

export class CreateUserDto 
{
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(20)
    nickname: string;
    
    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    @MaxLength(20)
    @IsAlphanumeric()
    password: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(20)
    name: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(20)
    middlename: string;

}
