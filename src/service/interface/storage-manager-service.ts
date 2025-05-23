

/**
 * handle the decentralized identifier storage, by providing a service for:
 * - initializing the storage
 * - storing the underling entity
 * - retrieving the entity
 * - deleting the entity
 * - updating the entity
 * - checking if the entities exist
 * - checking if the storage is initialized
 * - checking if the storage is empty
 *
 * **/
export interface StorageManagerService<T> {

    /**
     * Initializes the storage the underling entity.
     * @returns A promise that resolves when the storage is initialized.
     */
    initializeStorage(): Promise<void>

    /**
     * Stores entity for the given key.
     * @param organizationId the organization of the entity to be stored
     * @param entity the entity to be stored
     * @param rowKey the row key of the entity to be stored
     * @returns A promise that resolves when the entity is stored.
     */
    store(organizationId:string, rowKey:string, entity:T): Promise<void>

    /**
     * Retrieves entity for the given rowKey.
     * @param organizationId the organization of the entity to be retrieved
     * @param rowKey the key of the entity to be retrieved
     * @returns A promise that resolves to the retrieved entity.
     */
    retrieve(organizationId:string, rowKey: string): Promise<T>

    /**
     * Deletes entity for the given key.
     * @param rowKey
     * @param organization the organization id of the entity to be deleted
     * @returns A promise that resolves when the entity is deleted.
     */
    delete(organization:string, rowKey: string): Promise<void>

    /**
     * Update entity.
     * @param entity the entity to be updated
     * @param organizationId the organization id of the entity to be updated
     * @param rowKey the key of the entity to be updated
     * @returns A promise that resolves when the DID is updated.
     */
    update(organizationId:string, rowKey:string, entity:T): Promise<void>

    /**
     * Checks if the underline entity for the given key exists.
     * @param organizationId the organization id of the entity to be checked
     * @param rowKey the key of the entity to be checked
     * @returns A promise that resolves to a boolean indicating if the entity.
     */
    checkExisting(organizationId:string, rowKey: string): Promise<boolean>

    /**
     * Checks if the storage for the underline entity is initialized.
     * @returns A promise that resolves to a boolean indicating if the storage is initialized.
     */
    checkStorageInitialized(): boolean

    /**
     * Checks if the storage the underline entity is empty.
     * @returns A promise that resolves to a boolean indicating if the storage is empty.
     */
    checkStorageEmpty(): Promise<boolean>

    /**
     * Retrieves entities from underline the storage.
     * @returns A promise that resolves to an array of entity type.
     */
    retrieveAll(): Promise<T[]>


    /**
     * Clears all entities from underline the storage.
     * @returns A promise that resolves when all entities are cleared.
     */
    clearAll(): Promise<void>

}


export const DID_STORAGE_NAME = process.env.DID_STORAGE_NAME || "didstorage";
export const TOKEN_REGISTRY_STORAGE_NAME = process.env.TOKEN_REGISTRY_STORAGE_NAME || "tokenregistrystorage";
export const DOCUMENT_STORAGE_NAME = process.env.DOCUMENT_STORAGE_NAME || "documentstorage";
export const ADDRESS_BOOK_STORAGE_NAME = process.env.ADDRESS_BOOK_STORAGE_NAME || "addressbookstorage";

export type TokenRegistryDTO = {
    transactionHash: any;
    contractAddress: any,
    blockNumber: any,
    gasUsed: any,
    status: any,
    chainId?: string,
    name?: string,
    symbol?: string,
    deployer?: string,
    organizationId?: string,
}

export type DocumentDTO = {
    organizationId:string
    signedW3CDocument:any
    name:string
}