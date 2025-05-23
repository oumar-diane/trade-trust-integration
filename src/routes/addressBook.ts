import express from "express";
import {DefaultAddressBookService} from "../service/default-addressBook-service";
import {AzureAddressBookStorageService} from "../service/azure-addressBook-storage-service";
import {Addressbook} from "../model/addressbook-model";

const router = express.Router();

const storage = new AzureAddressBookStorageService();
const addressBookService = new DefaultAddressBookService(storage)

// new address
router.post("/", async function(req, res, next){
    try {
        const addEntity = req.body as Addressbook
        const addresses = await addressBookService.newAddress(addEntity)
        res.json(addresses);
    } catch (error) {
        console.error(error);
        next(error);
    }
});


// get addresses
router.get("/:organizationId", async function(req, res, next){
    try {
        const {organizationId} = req.params;
        const addresses = await addressBookService.getAddresses(organizationId)
        res.json(addresses);
    } catch (error) {
        console.error(error);
        next(error);
    }
});

// delete addresses
router.delete("/", async function(req, res, next){
    try {
        const addressEntity = req.body as Addressbook;
        const addresses = await addressBookService.deleteAddress(addressEntity)
        res.json(addresses);
    } catch (error) {
        console.error(error);
        next(error);
    }
});

// update addresses
router.patch("/", async function(req, res, next){
    try {
        const addressEntity = req.body as Addressbook;
        const addresses = await addressBookService.updateAddress(addressEntity)
        res.json(addresses);
    } catch (error) {
        console.error(error);
        next(error);
    }
});

export {router as addressBookRouter};
