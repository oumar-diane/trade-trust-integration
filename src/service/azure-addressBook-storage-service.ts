
import {AzureNamedKeyCredential, TableClient} from "@azure/data-tables";
import {
    ADDRESS_BOOK_STORAGE_NAME,
    StorageManagerService,
} from "../service/interface/storage-manager-service";
import {Addressbook} from "../model/addressbook-model";

export class AzureAddressBookStorageService implements StorageManagerService<Addressbook>{
    private readonly tableName: string = ADDRESS_BOOK_STORAGE_NAME;
    public tableClient?: TableClient;

    constructor() {
        this.initializeStorage()
    }

    async delete(organizationId:string, rowKey: string){
        await this.tableClient?.deleteEntity(organizationId, rowKey)
    }

    async update(organizationId:string, rowKey:string, entity: Addressbook){
        this.tableClient?.updateEntity({
            partitionKey: organizationId,
            name:entity["name"],
            rowKey: rowKey,
            address: entity["address"],
        })
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

    async retrieveAll(): Promise<Addressbook[]> {
        const entities: Addressbook[] = []
        for await (const entity of this.tableClient!.listEntities()) {
            const documentDTO: Addressbook = {
                name:entity["name"] as string,
                organizationId:entity["organizationId"] as string,
                address: entity["address"] as string,
            }
            entities.push(documentDTO);
        }
        return entities;
    }

    async retrieve(organizationId:string, rowKey: string){
        const document = await this.tableClient?.getEntity(organizationId, rowKey)
        if (!document) {
            throw new Error(`token registry not found for address: ${rowKey}`);
        }
        return {
            name:document["name"] as string,
            organizationId: document["organizationId"] as string,
            address: document["address"] as string,
        };
    }

    async store(organizationId:string, rowKey:string, addressbook: Addressbook){
        try {
            const tokenRegistryDTO: Addressbook & {partitionKey: string; rowKey: string} = {
                partitionKey: organizationId,
                rowKey: rowKey,
                name:addressbook.name,
                organizationId:organizationId,
                address: addressbook.address
            }
            await this.tableClient?.upsertEntity(tokenRegistryDTO)
        }catch (e) {
            console.log(e)
        }
    }
}