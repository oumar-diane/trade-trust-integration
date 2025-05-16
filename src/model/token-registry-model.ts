import {TransactionReceipt} from "@ethersproject/providers";


export interface TokenRegistryModel{
    chainId?: string,
    name?: string,
    symbol?: string,
    deployer?: string,
    organizationId?: string,
    transactionReceipt?:TransactionReceipt
}