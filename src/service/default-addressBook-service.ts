import {AddressBookService} from "../service/interface/addressBook-service";
import {Addressbook} from "../model/addressbook-model";
import {AzureAddressBookStorageService} from "../service/azure-addressBook-storage-service";
import {SimpleParamsValidator} from "../service/simple-params-validator";


export class DefaultAddressBookService implements AddressBookService{

    private storage:AzureAddressBookStorageService
    protected paramValidator = SimpleParamsValidator.createValidator()

    constructor(storage:AzureAddressBookStorageService) {
        this.storage=storage
    }
    async deleteAddress(addrEntity: Addressbook): Promise<Addressbook[]> {
        this.paramValidator.validate({
            "organization is required":addrEntity.organizationId,
            "name is required":addrEntity.name,
            "address is required":addrEntity.address,
        })
        await this.storage.delete(addrEntity.organizationId!, addrEntity.address!)
        const allAddrBook = await this.storage.retrieveAll()
        return allAddrBook.filter((addr)=>addr.organizationId === addrEntity.organizationId)
    }

    async getAddresses(organizationId: string): Promise<Addressbook[]> {
        this.paramValidator.validate({"organizationId is required":organizationId})
        const allAdresses = await this.storage.retrieveAll()
        return allAdresses.filter((address)=>address.organizationId === organizationId)
    }

    async newAddress(addrEntity: Addressbook): Promise<Addressbook[]> {
        this.paramValidator.validate({
            "organizationId is required":addrEntity.organizationId,
            "name is required":addrEntity.name,
            "address is required":addrEntity.address
        })
        await this.storage.store(addrEntity.organizationId!, addrEntity.address!, addrEntity)
        const allAddrBook = await this.storage.retrieveAll()
        return allAddrBook.filter((addr)=>addr.organizationId === addrEntity.organizationId)
    }

    async updateAddress(addrEntity: Addressbook): Promise<Addressbook[]> {
        this.paramValidator.validate({
            "organizationId is required":addrEntity.organizationId,
            "name is required":addrEntity.name,
            "address is required":addrEntity.address
        })
        await this.storage.update(addrEntity.organizationId!, addrEntity.address!, addrEntity)
        const allAddrBook = await this.storage.retrieveAll()
        return allAddrBook.filter((addr)=>addr.organizationId === addrEntity.organizationId)
    }

}