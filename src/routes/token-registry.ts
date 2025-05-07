import express from "express";
import {DefaultTokenRegistryService} from "../service/default-token-registry-service";

const router = express.Router();

const tokenRegistryService = new DefaultTokenRegistryService()

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

export {router as tokenRegistryRouter};
