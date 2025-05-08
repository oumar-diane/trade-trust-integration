import {TokenRegistryService} from "./interface/token-registry-service";
import {TokenRegistryModel} from "../model/token-registry-model";
import {CHAIN_ID, SUPPORTED_CHAINS, v5ContractAddress, v5Contracts} from "@trustvc/trustvc";
import {getRPCUrl} from "../util/provider-utils";
import {ethers} from "ethers";
import {utils as v5Utils} from "@tradetrust-tt/token-registry-v4";
import {SimpleParamsValidator} from "./simple-params-validator";
import {Interface} from "@ethersproject/abi";
import { TransactionReceipt } from "@ethersproject/providers";
import { TransactionRequest } from "@ethersproject/abstract-provider";


export class DefaultTokenRegistryService implements TokenRegistryService {

    protected paramsValidator = SimpleParamsValidator.createValidator()

    async deployTokenRegistry(tokenRegistryModel: TokenRegistryModel): Promise<{ transaction: TransactionRequest }> {
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
        return {
            transaction: transaction,
        }
    }

    async getTokenRegistryDeploymentEvent(transactionReceipt: TransactionReceipt){
        let registryAddress;
        const deployerInterface = new Interface(v5Contracts.TDocDeployer__factory.abi);

        if (ethers.version.includes("/5.")) {
            registryAddress = v5Utils.getEventFromReceipt<any>(
                transactionReceipt,
                (deployerInterface as any).getEventTopic("Deployment")?.topicHash!,
                deployerInterface,
            ).args.deployed;
        } else if (ethers.version.startsWith("6.")) {
            registryAddress = v5Utils.getEventFromReceipt<any>(transactionReceipt, "Deployment", deployerInterface).args.deployed;
        } else {
            throw new Error("Unsupported ethers version");
        }
        return {
            transactionHash: transactionReceipt.blockHash,
            contractAddress: registryAddress,
            blockNumber: transactionReceipt.blockNumber,
            gasUsed: transactionReceipt.gasUsed,
            status: transactionReceipt.status,
        };
    }

}