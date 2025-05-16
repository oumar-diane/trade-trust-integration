import express from "express";
import {DefaultTokenRegistryService} from "../service/default-token-registry-service";
import {AzureTokenRegistryStorageService} from "../service/azure-token-registry-storage-service";

const router = express.Router();

const tokenRegistryStorageService = new AzureTokenRegistryStorageService()
const tokenRegistryService = new DefaultTokenRegistryService(tokenRegistryStorageService)

// deploy token registry
router.post("/", async function(req, res, next){
    try {
        const registryModel = req.body;
        const result = await tokenRegistryService.deployTokenRegistry(registryModel)
        res.json(result);
    } catch (error) {
        console.error(error);
        next(error);
    }
});

// get deployment event from transaction receipt
router.post("/event", async function(req, res, next){
    try {
        const transactionReceipt = req.body;
        const result = await tokenRegistryService.getTokenRegistryDeploymentEvent(transactionReceipt)
        res.json(result);
    } catch (error) {
        console.error(error);
        next(error);
    }
});

// get deployed token registry for the given domain
router.get("/", async function(req, res, next){
    try {
        const {organizationId} = req.query;
        const result = await tokenRegistryService.getDeployedTokenRegistry(organizationId as string)
        res.json(result);
    } catch (error) {
        console.error(error);
        next(error);
    }
});

export {router as tokenRegistryRouter};
