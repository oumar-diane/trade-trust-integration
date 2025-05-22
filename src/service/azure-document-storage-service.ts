
import {AzureNamedKeyCredential, TableClient} from "@azure/data-tables";
import {
    DOCUMENT_STORAGE_NAME,
    DocumentDTO,
    StorageManagerService,
} from "../service/interface/storage-manager-service";

export class AzureDocumentStorageService implements StorageManagerService<DocumentDTO>{
    private readonly tableName: string = DOCUMENT_STORAGE_NAME;
    public tableClient?: TableClient;

    constructor() {
        this.initializeStorage()
    }

    async delete(rowKey: string){
        console.log(rowKey)
    }

    async update(organizationId:string, rowKey:string, entity: DocumentDTO){
        this.tableClient?.updateEntity({
            partitionKey: organizationId,
            name:entity["name"],
            rowKey: rowKey,
            signedW3CDocument: JSON.stringify(entity["signedW3CDocument"]),
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

    async retrieveAll(): Promise<DocumentDTO[]> {
        const entities: DocumentDTO[] = []
        for await (const entity of this.tableClient!.listEntities()) {
            const documentDTO: DocumentDTO = {
                name:entity["name"] as string,
                organizationId:entity["organizationId"] as string,
                signedW3CDocument: JSON.parse(entity["signedW3CDocument"] as string) as any,
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
            signedW3CDocument: JSON.parse(document["signedW3CDocument"] as string) as any,
        };
    }

    async store(organizationId:string, rowKey:string, documentDTO: DocumentDTO){
        try {
            const tokenRegistryDTO: DocumentDTO & {partitionKey: string; rowKey: string} = {
                partitionKey: organizationId,
                rowKey: rowKey,
                name:documentDTO.name,
                organizationId:organizationId,
                signedW3CDocument: JSON.stringify(documentDTO["signedW3CDocument"]),
            }
            await this.tableClient?.upsertEntity(tokenRegistryDTO)
        }catch (e) {
            console.log(e)
        }
    }
}