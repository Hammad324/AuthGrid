import { IsNotEmpty, IsString } from "class-validator";

export class AppTokenDto {
    @IsString()
    @IsNotEmpty()
    clientId: string;

    @IsString()
    @IsNotEmpty()
    clientSecret: string;
}
