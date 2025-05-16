import express from "express";
import {DefaultDidService} from "../service/default-did-service";
import * as path from "node:path";
import * as fs from "node:fs";

const router = express.Router();

const didService = new DefaultDidService()

// server did json file
router.get("/did.json", async function(req, res, next){
    try {
        const didJsonPath = path.join(__dirname, "../../did.json");
        const didJson = fs.readFileSync(didJsonPath, "utf-8");
        res.json(JSON.parse(didJson));
    } catch (error) {
        console.error(error);
        next(error);
    }
});


// generate a new did from user domain
router.post("/:domain", async function(req, res, next){
    try {
        const {domain} = req.params;
        const result = await didService.generateDid(domain)
        res.json(result);
    } catch (error) {
        console.error(error);
        next(error);
    }
});

export {router as didRouter};
