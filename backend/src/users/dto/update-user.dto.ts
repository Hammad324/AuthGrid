import { IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class UpdateUserDto {
    
        @IsOptional()
        @IsString()
        name?: string;
    
        @IsEmail()
        @IsOptional()
        email?: string;
}

