import {AzureNamedKeyCredential, TableClient} from "@azure/data-tables";
import {
    StorageManagerService,
    TOKEN_REGISTRY_STORAGE_NAME,
    TokenRegistryDTO
} from "../service/interface/storage-manager-service";

export class AzureTokenRegistryStorageService implements StorageManagerService<TokenRegistryDTO>{
    private readonly tableName: string = TOKEN_REGISTRY_STORAGE_NAME;
    public tableClient?: TableClient;

    constructor() {
        this.initializeStorage()
    }

    async delete(rowKey: string){
        console.log(rowKey)
    }

    async update(partition:string, rowKey:string, entity: TokenRegistryDTO){
        console.log(partition, rowKey, entity)
    }

    async checkExisting(partition:string, rowKey: string){
        try {
            const entity = await this.tableClient!.getEntity(partition, rowKey)
            return entity !== undefined;
        }catch (e) {
            return false;
        }
    }

    async clearAll(){
        console.log("rowKey")
    }

    async checkTokenStorageExists(partition:string, address: string){
        try {
            const entity = await this.tableClient!.getEntity(partition, address)
            return entity !== undefined;
        }catch (e) {
            return false;
        }
    }

    async checkStorageEmpty(){
        const iterator = this.tableClient!.listEntities()[Symbol.asyncIterator]();
        const first = await iterator.next();
        return first.done ?? true;
    }

    checkStorageInitialized() {
        return this.tableClient !== undefined
    }

    async initializeStorage(){
        const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
        const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;
        if (!accountName || !accountKey) {
            throw new Error("Missing Azure Storage account name or key");
        }
        const credential = new AzureNamedKeyCredential(accountName, accountKey);
        this.tableClient = new TableClient(
            `https://${accountName}.table.core.windows.net`,
            this.tableName,
            credential
        );
    }

    async retrieveAll(): Promise<TokenRegistryDTO[]> {
        const entities: TokenRegistryDTO[] = []
        for await (const entity of this.tableClient!.listEntities()) {
            const tokenRegistryDTO: TokenRegistryDTO = {
                organizationId: entity.partitionKey,
                transactionHash: entity["transactionHash"] as any,
                contractAddress: entity["contractAddress"] as any,
                blockNumber: entity["blockNumber"] as any,
                gasUsed: entity["gasUsed"] as any,
                status: entity["status"] as any,
                chainId: entity["chainId"] as any,
                name: entity["name"] as string,
                symbol: entity["symbol"] as string,
                deployer: entity["deployer"] as string
            }
            entities.push(tokenRegistryDTO);
        }
        return entities;
    }

    async retrieve(organizationId:string, rowKey: string){
        const tokenRegistry = await this.tableClient?.getEntity(organizationId, rowKey)
        if (!tokenRegistry) {
            throw new Error(`token registry not found for address: ${rowKey}`);
        }
        return {
            transactionHash: tokenRegistry["transactionHash"] as any,
            contractAddress: tokenRegistry["contractAddress"] as any,
            blockNumber: tokenRegistry["blockNumber"] as any,
            gasUsed: tokenRegistry["gasUsed"] as any,
            status: tokenRegistry["status"] as any,
            chainId: tokenRegistry["chainId"] as any,
            name: tokenRegistry["name"] as string,
            symbol: tokenRegistry["symbol"] as string,
            deployer: tokenRegistry["deployer"] as string
        };
    }

    async store(organizationId:string, rowKey:string, tokenRegistry: TokenRegistryDTO){
        try {
            const tokenRegistryDTO: TokenRegistryDTO & {partitionKey: string; rowKey: string} = {
                partitionKey: organizationId,
                rowKey: rowKey,
                transactionHash: tokenRegistry["transactionHash"] as any,
                contractAddress: tokenRegistry["contractAddress"] as any,
                blockNumber: tokenRegistry["blockNumber"] as any,
                gasUsed: tokenRegistry["gasUsed"] as any,
                status: tokenRegistry["status"] as any,
                chainId: tokenRegistry["chainId"] as any,
                name: tokenRegistry["name"] as string,
                symbol: tokenRegistry["symbol"] as string,
                deployer: tokenRegistry["deployer"] as string,
            }
            await this.tableClient?.createEntity(tokenRegistryDTO)
        }catch (e) {
            console.log(e)
        }
    }

}