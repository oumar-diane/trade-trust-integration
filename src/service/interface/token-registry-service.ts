import {TokenRegistryModel} from "../../model/token-registry-model";
import { TransactionReceipt } from "@ethersproject/providers";
import { TransactionRequest } from "@ethersproject/abstract-provider";


/**
 * service to deploy token registry in blockchain network
 * **/
export interface TokenRegistryService {

    /**
     * deploy the given token registry model in designated blockchain network
     *
     * @param tokenRegistryModel - token registry model to be deployed
     *
     * @returns {@link TransactionRequest} deployment result
     */
    deployTokenRegistry(tokenRegistryModel:TokenRegistryModel): Promise<{ transaction: TransactionRequest }>;

    /**
     * get the token registry contract address from the deployement transaction receipt
     *
     * @param transactionReceipt - the signed transaction receipt
     *
     * @returns {@link TokenRegistryReturnValue} deployment result
     */
    getTokenRegistryDeploymentEvent(transactionReceipt:TransactionReceipt): Promise<TokenRegistryReturnValue>;
}

export type TokenRegistryReturnValue = {
    transactionHash: any;
    contractAddress: any,
    blockNumber: any,
    gasUsed: any,
    status: any,
}