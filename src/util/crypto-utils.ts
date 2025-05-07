import {decrypt, encrypt} from "@trustvc/trustvc";

/**
 * sign sensitive data with a private key
 * **/
export function signWithPrivateKey(privateKey: string, data: string): string {
    return encrypt(data, privateKey)
}

export function decryptWithPrivateKey(privateKey: string, data: string): string {
    return decrypt(data, privateKey)
}
