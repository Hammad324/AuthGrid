import { Injectable } from "@nestjs/common";
import crypto from "crypto";

@Injectable()
export class AuthCryptoService {

    private privateKey: string;
    private publicKey: string;
    private keyId: string = process.env.OAUTH_KEYID!; // A unique ID for this, put this in the env file.

    constructor() {

        const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
            modulusLength: 2048,
            publicKeyEncoding: {
                type: 'spki',
                format: 'pem'
            },
            privateKeyEncoding: {
                type: 'pkcs8',
                format: 'pem'
            }
        });

        this.publicKey = publicKey;
        this.privateKey = privateKey;
        console.log(`RSA Key Pair generated.`);
    }
    
    getPrivateKey(): string {
            return this.privateKey
        }
    
    getPublicKey(): string {
            return this.publicKey
        }


    getJwks() {
            const keyObject = crypto.createPublicKey(this.publicKey);
            const jwk = keyObject.export({ format: 'jwk' });

            const result = {
                keys: [
                    {
                        kid: this.keyId,
                        kty: 'RSA',
                        alg: 'RS256',
                        use: 'sig',
                        n: jwk.n,
                        e: jwk.e
                    },
                ],
            };

            return result
        }
}