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
var _a;
var _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultDocumentService = void 0;
const trustvc_1 = require("@trustvc/trustvc");
const provider_utils_1 = require("../util/provider-utils");
const ethers_1 = require("ethers");
const contracts_1 = require("@trustvc/trustvc/token-registry-v5/contracts");
const document_service_1 = require("./interface/document-service");
const simple_params_validator_1 = require("./simple-params-validator");
const crypto_utils_1 = require("../util/crypto-utils");
const abi_1 = require("@ethersproject/abi");
class DefaultDocumentService {
    constructor() {
        this.paramsValidator = simple_params_validator_1.SimpleParamsValidator.createValidator();
    }
    applyVerification(signedW3CDocument) {
        return __awaiter(this, void 0, void 0, function* () {
            // Validate required parameters
            this.paramsValidator.validate({ "the signedW3CDocument is required": signedW3CDocument });
            // Verify the document
            return yield (0, trustvc_1.verifyDocument)(signedW3CDocument);
        });
    }
    applyDocumentTransferabilityAction(transferabilityData, vc, action) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            Object.assign(_b.CHAININFO, {
                rpcUrl: (_a = (0, provider_utils_1.getRPCUrl)(transferabilityData.chainId)) !== null && _a !== void 0 ? _a : trustvc_1.SUPPORTED_CHAINS[transferabilityData.chainId]
            });
            const title_escrow_factory = new abi_1.Interface(trustvc_1.v5Contracts.TitleEscrow__factory.abi);
            const params = yield this.getTransferabilityAction(action, vc, transferabilityData);
            const title_escrow_tx = title_escrow_factory.encodeFunctionData(action, [...params]);
            console.log("Transaction confirmed");
            return {
                to: transferabilityData.titleEscrowAddress,
                data: title_escrow_tx,
            };
        });
    }
    createDocument(rawDocument) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _c, _d, _e, _f, _g;
            // decrypt the didKeyPairs
            rawDocument.didKeyPairs = (0, crypto_utils_1.decryptWithPrivateKey)(process.env.SIGNER_PRIVATE_KEY, rawDocument.didKeyPairs);
            // validate required parameters
            this.paramsValidator.validate({
                "Document not supported": rawDocument.documentId,
                "didKeyPair is required": rawDocument.owner,
                "tokenRegistry is required": rawDocument.holder,
                "tokenRegistryAddress is required": rawDocument.tokenRegistryAddress,
                "chainId is required": rawDocument.chainId,
                "didKeyPairs is required": rawDocument.didKeyPairs,
                "credentialSubject is required": rawDocument.credentialSubject,
            });
            Object.assign(_b.CHAININFO, {
                rpcUrl: (_a = (0, provider_utils_1.getRPCUrl)(rawDocument.chainId)) !== null && _a !== void 0 ? _a : trustvc_1.SUPPORTED_CHAINS[rawDocument.chainId]
            });
            // Remove escaped characters and parsing
            const DID_KEY_PAIRS = JSON.parse(this.cleanedJsonString(rawDocument.didKeyPairs));
            rawDocument.didKeyPairs = DID_KEY_PAIRS;
            // Prepare the document
            rawDocument.issuanceDate = (new Date()).toISOString();
            rawDocument.expirationDate = (this.applyExpirationDate(rawDocument.expirationDate)).toISOString();
            const document = (0, document_service_1.getDocumentSchema)(rawDocument);
            // Sign the document
            const { error, signed: signedW3CDocument } = yield (0, trustvc_1.signW3C)(document, DID_KEY_PAIRS);
            if (error) {
                throw new Error(error);
            }
            // Issue the document on chain:
            const tokenId = (0, trustvc_1.getTokenId)(signedW3CDocument);
            const tradeTrustToken_factory_abi = new abi_1.Interface(contracts_1.TradeTrustToken__factory.abi);
            let tx;
            // Encrypt remarks
            const encryptedRemarks = rawDocument.remarks && (0, trustvc_1.encrypt)((_c = rawDocument.remarks) !== null && _c !== void 0 ? _c : '', signedW3CDocument === null || signedW3CDocument === void 0 ? void 0 : signedW3CDocument.id) || '0x';
            if (trustvc_1.SUPPORTED_CHAINS[rawDocument.chainId].gasStation) {
                const gasFees = yield trustvc_1.SUPPORTED_CHAINS[rawDocument.chainId].gasStation();
                console.log('gasFees: ', gasFees);
                tx = tradeTrustToken_factory_abi.encodeFunctionData("mint", [rawDocument.owner, rawDocument.holder, tokenId, encryptedRemarks,
                    {
                        maxFeePerGas: (_e = (_d = gasFees.maxFeePerGas) === null || _d === void 0 ? void 0 : _d.toBigInt()) !== null && _e !== void 0 ? _e : 0,
                        maxPriorityFeePerGas: (_g = (_f = gasFees.maxPriorityFeePerGas) === null || _f === void 0 ? void 0 : _f.toBigInt()) !== null && _g !== void 0 ? _g : 0,
                    }
                ]);
            }
            else {
                // Encrypt remarks
                tx = tradeTrustToken_factory_abi.encodeFunctionData("mint", [rawDocument.owner, rawDocument.holder, tokenId, encryptedRemarks]);
            }
            return {
                to: rawDocument.tokenRegistryAddress,
                signedW3CDocument: signedW3CDocument,
                data: tx,
            };
        });
    }
    getEscrowAddress(vc) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const tokenId = (0, trustvc_1.getTokenId)(vc);
            const tokenRegistry = vc.credentialStatus.tokenRegistry;
            const network = vc.credentialStatus.tokenNetwork;
            const chain = trustvc_1.SUPPORTED_CHAINS[network.chainId];
            const JsonRpcProvider = ethers_1.ethers.version.startsWith("6.")
                ? ethers_1.ethers.JsonRpcProvider
                : ethers_1.ethers.providers.JsonRpcProvider;
            Object.assign(chain, {
                rpcUrl: (_a = (0, provider_utils_1.getRPCUrl)(network.chainId)) !== null && _a !== void 0 ? _a : chain.rpcUrl
            });
            const provider = new JsonRpcProvider(chain.rpcUrl);
            if (!provider)
                return;
            const titleEscrowAddress = yield (0, trustvc_1.getTitleEscrowAddress)(tokenRegistry, tokenId, provider);
            return { address: titleEscrowAddress };
        });
    }
    cleanedJsonString(jsonString) {
        // Remove escaped characters before parsing
        return jsonString.replace(/\\(?=["])/g, '');
    }
    applyExpirationDate(expirationDate) {
        const defaultExpirationDate = new Date();
        defaultExpirationDate.setMonth(defaultExpirationDate.getMonth() + 3);
        return (expirationDate != undefined && expirationDate != '') ? new Date(expirationDate) : defaultExpirationDate;
    }
    getProvider() {
        let provider;
        if (ethers_1.ethers.version.startsWith('6.')) {
            provider = new ethers_1.ethers.JsonRpcProvider(_b.CHAININFO.rpcUrl);
        }
        else if (ethers_1.ethers.version.includes('/5.')) {
            provider = new ethers_1.ethers.providers.JsonRpcProvider(_b.CHAININFO.rpcUrl);
        }
        return provider;
    }
    isAddress(address) {
        return ethers_1.ethers.version.startsWith("6.") ? ethers_1.ethers.isAddress(address) : ethers_1.ethers.utils.isAddress(address);
    }
    getTransferabilityAction(action, vc, transferabilityData) {
        return __awaiter(this, void 0, void 0, function* () {
            let params = [];
            const encryptedRemark = "0x" + (0, trustvc_1.encrypt)(transferabilityData.remarks, vc.id);
            switch (action) {
                case "transferHolder":
                    if (!this.isAddress(transferabilityData.newHolder)) {
                        throw new Error("Invalid Ethereum address:" + transferabilityData.newHolder);
                    }
                    params = [transferabilityData.newHolder, encryptedRemark];
                    break;
                case "transferBeneficiary":
                    if (!this.isAddress(transferabilityData.newBeneficiary)) {
                        throw new Error("Invalid Ethereum address:" + transferabilityData.newBeneficiary);
                    }
                    params = [transferabilityData.newBeneficiary, encryptedRemark];
                    break;
                case "nominate":
                    if (!this.isAddress(transferabilityData.newBeneficiary)) {
                        throw new Error("Invalid Ethereum address:" + transferabilityData.newBeneficiary);
                    }
                    params = [transferabilityData.newBeneficiary, encryptedRemark];
                    break;
                case "transferOwners":
                    if (!this.isAddress(transferabilityData.newBeneficiary) || !this.isAddress(transferabilityData.newHolder)) {
                        throw new Error("Invalid Ethereum address:" + transferabilityData.newBeneficiary + ", " + transferabilityData.newHolder);
                    }
                    params = [transferabilityData.newBeneficiary, encryptedRemark];
                    break;
                default:
                    params = [encryptedRemark];
                    console.error("Invalid action:", action);
                    return params;
            }
        });
    }
}
exports.DefaultDocumentService = DefaultDocumentService;
_b = DefaultDocumentService;
DefaultDocumentService.CHAINID = (_a = process.env.NET) !== null && _a !== void 0 ? _a : trustvc_1.CHAIN_ID.amoy;
DefaultDocumentService.CHAININFO = trustvc_1.SUPPORTED_CHAINS[_b.CHAINID];
