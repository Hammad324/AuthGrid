import { IsEmail, IsNotEmpty, IsOptional, IsString, IsStrongPassword, MinLength } from "class-validator";

export class CreateUserDto {

    @IsOptional()
    @IsString()
    name?: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;


    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    @IsStrongPassword()
    passwordHash: string;
}