import {Addressbook} from "../../model/addressbook-model";


/**
 * service for manage user wallet address
 *
 * **/
export interface AddressBookService {
    /**
     * Stores new address entity.
     * @param addrEntity - The address entity to store.
     * @returns A promise that resolves to the list of stored address entities.
     */
    newAddress(addrEntity: Addressbook): Promise<Addressbook[]>;

    /**
     * Deletes address entity.
     * @param addrEntity - The address entity to delete.
     * @returns A promise that resolves to the list of stored address entities.
     */
    deleteAddress(addrEntity: Addressbook): Promise<Addressbook[]>;

    /**
     * Updates address entity.
     * @param addrEntity - The address entity to update.
     * @returns A promise that resolves to the list of stored address entities.
     */
    updateAddress(addrEntity: Addressbook): Promise<Addressbook[]>;

    /**
     * Retrieves stored address entities.
     * @param organizationId the organizationId
     * @returns A promise that resolves to the list of stored address entities.
     */
    getAddresses(organizationId:string): Promise<Addressbook[]>;
}