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
exports.DefaultTokenRegistryService = void 0;
const trustvc_1 = require("@trustvc/trustvc");
const provider_utils_1 = require("../util/provider-utils");
const ethers_1 = require("ethers");
const token_registry_v4_1 = require("@tradetrust-tt/token-registry-v4");
const simple_params_validator_1 = require("./simple-params-validator");
const abi_1 = require("@ethersproject/abi");
class DefaultTokenRegistryService {
    constructor() {
        this.paramsValidator = simple_params_validator_1.SimpleParamsValidator.createValidator();
    }
    deployTokenRegistry(tokenRegistryModel) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f;
            //parameters validation
            this.paramsValidator.validate({
                "name is required": tokenRegistryModel.name,
                "symbol is required": tokenRegistryModel.symbol,
                "deployer is required": tokenRegistryModel.deployer,
                "chainId is required": tokenRegistryModel.chainId,
            });
            const chainId = (_a = tokenRegistryModel.chainId) !== null && _a !== void 0 ? _a : trustvc_1.CHAIN_ID.amoy;
            const CHAININFO = trustvc_1.SUPPORTED_CHAINS[chainId];
            Object.assign(CHAININFO, {
                rpcUrl: (_b = (0, provider_utils_1.getRPCUrl)(chainId)) !== null && _b !== void 0 ? _b : CHAININFO.rpcUrl
            });
            const { TDocDeployer__factory } = trustvc_1.v5Contracts;
            const { TokenImplementation, Deployer } = trustvc_1.v5ContractAddress;
            const deployerInterface = new abi_1.Interface(TDocDeployer__factory.abi);
            const initParam = token_registry_v4_1.utils.encodeInitParams({
                name: tokenRegistryModel.name,
                symbol: tokenRegistryModel.symbol,
                deployer: tokenRegistryModel.deployer,
            });
            let encodedFunctionData = "";
            if (CHAININFO.gasStation) {
                const gasFees = yield CHAININFO.gasStation();
                console.log("gasFees", gasFees);
                encodedFunctionData = deployerInterface.encodeFunctionData("deploy", [
                    TokenImplementation[chainId],
                    initParam,
                    {
                        maxFeePerGas: (_d = (_c = gasFees.maxFeePerGas) === null || _c === void 0 ? void 0 : _c.toBigInt()) !== null && _d !== void 0 ? _d : 0,
                        maxPriorityFeePerGas: (_f = (_e = gasFees.maxPriorityFeePerGas) === null || _e === void 0 ? void 0 : _e.toBigInt()) !== null && _f !== void 0 ? _f : 0,
                    },
                ]);
            }
            else {
                encodedFunctionData = deployerInterface.encodeFunctionData("deploy", [
                    TokenImplementation[chainId],
                    initParam,
                ]);
            }
            const transaction = {
                to: Deployer[chainId],
                data: encodedFunctionData,
            };
            console.log(`Transaction: `, transaction);
            return {
                transaction: transaction,
            };
        });
    }
    getTokenRegistryDeploymentEvent(transactionReceipt) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            let registryAddress;
            const deployerInterface = new abi_1.Interface(trustvc_1.v5Contracts.TDocDeployer__factory.abi);
            if (ethers_1.ethers.version.includes("/5.")) {
                registryAddress = token_registry_v4_1.utils.getEventFromReceipt(transactionReceipt, (_a = deployerInterface.getEventTopic("Deployment")) === null || _a === void 0 ? void 0 : _a.topicHash, deployerInterface).args.deployed;
            }
            else if (ethers_1.ethers.version.startsWith("6.")) {
                registryAddress = token_registry_v4_1.utils.getEventFromReceipt(transactionReceipt, "Deployment", deployerInterface).args.deployed;
            }
            else {
                throw new Error("Unsupported ethers version");
            }
            return {
                transactionHash: transactionReceipt.blockHash,
                contractAddress: registryAddress,
                blockNumber: transactionReceipt.blockNumber,
                gasUsed: transactionReceipt.gasUsed,
                status: transactionReceipt.status,
            };
        });
    }
}
exports.DefaultTokenRegistryService = DefaultTokenRegistryService;
