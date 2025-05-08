"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultDidService = void 0;
const issuer_1 = require("@trustvc/trustvc/w3c/issuer");
const crypto_utils_1 = require("../util/crypto-utils");
const simple_params_validator_1 = require("./simple-params-validator");
const path_1 = require("path");
const fs_1 = require("fs");
class DefaultDidService {
    constructor() {
        this.paramsValidator = simple_params_validator_1.SimpleParamsValidator.createValidator();
    }
    generateDid(domain) {
        return __awaiter(this, void 0, void 0, function* () {
            //parameters validation
            this.paramsValidator.validate({ "the domain is required": domain });
            const keyPair = yield (0, issuer_1.generateKeyPair)({
                type: issuer_1.VerificationType.Bls12381G2Key2020,
            });
            const issuedDidWeb = yield (0, issuer_1.issueDID)(Object.assign({ domain: domain }, keyPair));
            const encryptedDidKeyPairs = (0, crypto_utils_1.signWithPrivateKey)(process.env.SIGNER_PRIVATE_KEY, JSON.stringify(issuedDidWeb.didKeyPairs));
            if (process.env.NODE_ENV === "development") {
                // Write the wellKnownDid to a JSON file
                const outputPath = (0, path_1.join)(process.cwd(), "did.json");
                (0, fs_1.writeFileSync)(outputPath, JSON.stringify(issuedDidWeb.wellKnownDid, null, 2));
                console.log("DID document has been written to ./did.json \n", JSON.stringify(issuedDidWeb.wellKnownDid, null, 2));
                console.log("DID keyPairs has been written to ./did.json \n", JSON.stringify(issuedDidWeb.didKeyPairs, null, 2));
            }
            return {
                wellKnownDid: issuedDidWeb.wellKnownDid,
                didKeyPairs: encryptedDidKeyPairs,
            };
        });
    }
}
exports.DefaultDidService = DefaultDidService;
