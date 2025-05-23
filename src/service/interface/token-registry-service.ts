import {TokenRegistryModel} from "../../model/token-registry-model";
import { TransactionRequest } from "@ethersproject/abstract-provider";
import {TokenRegistryDTO} from "../../service/interface/storage-manager-service";


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
    deployTokenRegistry(tokenRegistryModel:TokenRegistryModel): Promise<TransactionRequest>;

    /**
     * get the token registry contract address from the deployment transaction receipt
     *
     *
     * @returns {@link TokenRegistryDTO} deployment result
     * @param tokenRegistryModel
     */
    getTokenRegistryDeploymentEvent(tokenRegistryModel:TokenRegistryModel): Promise<TokenRegistryDTO>;

    /**
     * get deployed token registry contract address for the given domain
     *
     *
     * @returns {@link TokenRegistryDTO} deployment result
     * @param organizationId
     */
    getDeployedTokenRegistry(organizationId:string): Promise<TokenRegistryDTO[]>;
}
