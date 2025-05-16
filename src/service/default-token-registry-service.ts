import {TokenRegistryService} from "./interface/token-registry-service";
import {TokenRegistryModel} from "../model/token-registry-model";
import {CHAIN_ID, SUPPORTED_CHAINS, v5ContractAddress, v5Contracts} from "@trustvc/trustvc";
import {getRPCUrl} from "../util/provider-utils";
import {ethers} from "ethers";
import {utils as v5Utils} from "@tradetrust-tt/token-registry-v4";
import {SimpleParamsValidator} from "./simple-params-validator";
import {Interface} from "@ethersproject/abi";
import {TransactionRequest} from "@ethersproject/abstract-provider";
import {StorageManagerService, TokenRegistryDTO} from "../service/interface/storage-manager-service";


export class DefaultTokenRegistryService implements TokenRegistryService {

    protected paramsValidator = SimpleParamsValidator.createValidator()
    private tokenRegistryStorageService: StorageManagerService<TokenRegistryDTO>

    constructor(tokenRegistryStorageService: StorageManagerService<TokenRegistryDTO>) {
        this.tokenRegistryStorageService = tokenRegistryStorageService
    }

    async getDeployedTokenRegistry(organizationId: string){
        //parameters validation
        this.paramsValidator.validate({"the organizationId is required":organizationId})
        try {
            const allTokenRegistry =  await this.tokenRegistryStorageService.retrieveAll()
            return allTokenRegistry.filter((tokenRegistry:TokenRegistryDTO) => tokenRegistry.organizationId === organizationId)
        }catch (e){
            throw new Error("Token registry not found for the given organizationId")
        }
    }

    async deployTokenRegistry(tokenRegistryModel: TokenRegistryModel){
        //parameters validation
        this.paramsValidator.validate({
            "name is required": tokenRegistryModel.name,
            "symbol is required": tokenRegistryModel.symbol,
            "deployer is required": tokenRegistryModel.deployer,
            "chainId is required": tokenRegistryModel.chainId,
        })
        const chainId: CHAIN_ID = (tokenRegistryModel.chainId as CHAIN_ID) ?? CHAIN_ID.amoy;
        const CHAININFO = SUPPORTED_CHAINS[chainId];
        Object.assign(CHAININFO, {
            rpcUrl:getRPCUrl(chainId) ?? CHAININFO.rpcUrl
        })

        const { TDocDeployer__factory } = v5Contracts;

        const { TokenImplementation, Deployer } = v5ContractAddress;
        const deployerInterface = new Interface(TDocDeployer__factory.abi);
        const initParam = v5Utils.encodeInitParams({
            name: tokenRegistryModel.name!,
            symbol: tokenRegistryModel.symbol!,
            deployer: tokenRegistryModel.deployer!,
        });

        let encodedFunctionData = "";
        if (CHAININFO.gasStation) {
            const gasFees = await CHAININFO.gasStation();
            console.log("gasFees", gasFees);
            encodedFunctionData = deployerInterface.encodeFunctionData("deploy", [
                TokenImplementation[chainId],
                initParam,
                {
                    maxFeePerGas: gasFees!.maxFeePerGas?.toBigInt() ?? 0,
                    maxPriorityFeePerGas: gasFees!.maxPriorityFeePerGas?.toBigInt() ?? 0,
                },
            ])
        } else {
            encodedFunctionData = deployerInterface.encodeFunctionData("deploy", [
                TokenImplementation[chainId],
                initParam,
            ])
        }
        const transaction:TransactionRequest={
            to: Deployer[chainId],
            data: encodedFunctionData,
        }
        console.log(`Transaction: ` , transaction);
        return transaction
    }

    async getTokenRegistryDeploymentEvent(tokenRegistryModel: TokenRegistryModel){

        //parameters validation
        this.paramsValidator.validate({
            "name is required": tokenRegistryModel.name,
            "symbol is required": tokenRegistryModel.symbol,
            "organizationId is required": tokenRegistryModel.organizationId,
            "deployer is required": tokenRegistryModel.deployer,
            "chainId is required": tokenRegistryModel.chainId,
            "transactionReceipt is required": tokenRegistryModel.transactionReceipt,
        })


        let registryAddress;
        const deployerInterface = new Interface(v5Contracts.TDocDeployer__factory.abi);

        if (ethers.version.includes("/5.")) {
            const deploymentTopic = deployerInterface.getEventTopic("Deployment");

            const log = tokenRegistryModel.transactionReceipt!.logs.find(
                (log) => log.topics[0] === deploymentTopic
            );
            if (!log) throw new Error("Deployment event not found in logs");
            const parsedLog = deployerInterface.parseLog(log);
            registryAddress = parsedLog.args.deployed;
        } else if (ethers.version.startsWith("6.")) {
            registryAddress = v5Utils.getEventFromReceipt<any>(tokenRegistryModel.transactionReceipt!, "Deployment", deployerInterface).args.deployed;
        } else {
            throw new Error("Unsupported ethers version");
        }
        await this.tokenRegistryStorageService!.store(
            tokenRegistryModel.organizationId!,
            registryAddress,
            {
            chainId: tokenRegistryModel.chainId,
            transactionHash: tokenRegistryModel.transactionReceipt?.transactionHash,
            contractAddress: registryAddress,
            blockNumber: tokenRegistryModel.transactionReceipt?.blockNumber,
            gasUsed: tokenRegistryModel.transactionReceipt?.gasUsed,
            status: tokenRegistryModel.transactionReceipt?.status,
            name: tokenRegistryModel.name,
        })
        return {
            chainId: tokenRegistryModel.chainId,
            transactionHash: tokenRegistryModel.transactionReceipt?.transactionHash,
            contractAddress: registryAddress,
            blockNumber: tokenRegistryModel.transactionReceipt?.blockNumber,
            gasUsed: tokenRegistryModel.transactionReceipt?.gasUsed,
            status: tokenRegistryModel.transactionReceipt?.status,
            name: tokenRegistryModel.name,
        };
    }

}