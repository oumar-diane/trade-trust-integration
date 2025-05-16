import {DidService} from "./interface/did-service";
import {generateKeyPair, issueDID, VerificationType} from "@trustvc/trustvc/w3c/issuer";
import {signWithPrivateKey} from "../util/crypto-utils";
import {SimpleParamsValidator} from "./simple-params-validator";
import {writeFileSync} from "fs";
import {join} from "path";

export class DefaultDidService implements DidService {

    protected paramsValidator = SimpleParamsValidator.createValidator()

    async generateDid(domain: string){

        //parameters validation
        this.paramsValidator.validate({
            "the domain is required":domain,
        })

        const keyPair = await generateKeyPair({
            type: VerificationType.Bls12381G2Key2020,
        });
        const issuedDidWeb = await issueDID({
            domain: domain,
            ...keyPair,
        });
        const encryptedDidKeyPairs = signWithPrivateKey(process.env.SIGNER_PRIVATE_KEY!, JSON.stringify(issuedDidWeb.didKeyPairs));

        // Write to store
        // Write the wellKnownDid to a JSON file
        const didOutputPath = join(process.cwd(), "did.json");
        const didKeyOutputPath = join(process.cwd(), "didKey.json");
        writeFileSync(didOutputPath, JSON.stringify(issuedDidWeb.wellKnownDid, null, 2));
        writeFileSync(didKeyOutputPath, JSON.stringify(encryptedDidKeyPairs, null, 2));
        console.log("DID document has been written to ./did.json \n", JSON.stringify(issuedDidWeb.wellKnownDid, null, 2));
        console.log("DID keyPairs has been written to ./did.json \n", JSON.stringify(issuedDidWeb.didKeyPairs, null, 2));


        return {
            wellKnownDid: issuedDidWeb.wellKnownDid,
            didKeyPairs:  encryptedDidKeyPairs,
        }
    }

}