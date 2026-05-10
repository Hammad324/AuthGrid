import { Module, Global } from "@nestjs/common";
import { AuthCryptoService } from "./auth.crypto.service";

@Global()
@Module({
    providers: [AuthCryptoService],
    exports: [AuthCryptoService],
})

export class AuthCryptoModule {}